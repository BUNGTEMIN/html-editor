import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Eye,
  FolderOpen,
  Layers,
  Redo2,
  SlidersHorizontal,
  Undo2,
} from 'lucide-react';
import type {
  BlockType,
  EmailBlock,
  EmailDocument,
  InspectorTab,
  PageStyle,
  PreviewMode,
} from './types/email';
import {
  copyTextToClipboard,
  createDefaultBlock,
  duplicateBlock,
  generateId,
  getBlockLabel,
  insertBlockAt,
  moveBlock,
  reorderBlocks,
} from './utils/blocks';
import { compileToEmailHtml } from './utils/compiler';
import {
  formatIndonesianTimestamp,
  loadActiveDocument,
  loadSavedDesigns,
  persistActiveDocument,
  persistSavedDesigns,
  upsertSavedDesign,
} from './utils/storage';
import { cloneTemplateToDocument } from './utils/templates';
import { TopBar } from './components/TopBar';
import { SidebarLeft } from './components/SidebarLeft';
import { CanvasEditor } from './components/CanvasEditor';
import { InspectorRight } from './components/InspectorRight';
import { LivePreviewPane } from './components/LivePreviewPane';
import { TemplateGalleryPage } from './components/TemplateGalleryPage';
import { JsonModal } from './components/JsonModal';
import { Toast, type ToastMessage } from './components/Toast';

const MAX_HISTORY = 40;

type MobilePane = 'saved' | 'canvas' | 'preview' | 'inspector';
type AppView = 'gallery' | 'editor';

function getInitialAppView(): AppView {
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get('autostart') === '1') {
      return 'editor';
    }
  } catch {
    // ignore
  }
  return 'gallery';
}

function loadInitialWorkspace(): {
  activeDoc: EmailDocument;
  saved: EmailDocument[];
} {
  const activeDoc = loadActiveDocument();
  const existing = loadSavedDesigns();
  if (existing.length > 0) {
    return { activeDoc, saved: existing };
  }
  const initialSaved = [activeDoc];
  persistSavedDesigns(initialSaved);
  return { activeDoc, saved: initialSaved };
}

export default function App() {
  const initialWorkspace = useMemo(() => loadInitialWorkspace(), []);
  const [doc, setDoc] = useState<EmailDocument>(initialWorkspace.activeDoc);
  const [savedDesigns, setSavedDesigns] = useState<EmailDocument[]>(
    initialWorkspace.saved
  );

  const [past, setPast] = useState<EmailDocument[]>([]);
  const [future, setFuture] = useState<EmailDocument[]>([]);

  const [appView, setAppView] = useState<AppView>(() => getInitialAppView());
  const [hasVisitedEditor, setHasVisitedEditor] = useState<boolean>(
    () => getInitialAppView() === 'editor'
  );
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(
    () => doc.blocks[0]?.id ?? null
  );
  const [previewMode, setPreviewMode] = useState<PreviewMode>('desktop');
  const [showLivePreview, setShowLivePreview] = useState<boolean>(false);
  const [inspectorTab, setInspectorTab] = useState<InspectorTab>('blocks');
  const [mobilePane, setMobilePane] = useState<MobilePane>('canvas');

  const [isJsonOpen, setIsJsonOpen] = useState(false);
  const [copiedRecently, setCopiedRecently] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [lastSavedText, setLastSavedText] = useState<string>(() =>
    formatIndonesianTimestamp(doc.updatedAt)
  );

  const toastTimerRef = useRef<number | null>(null);

  const showToast = useCallback(
    (message: string, type: 'success' | 'error' = 'success') => {
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current);
      }
      setToast({ id: Date.now(), type, message });
      toastTimerRef.current = window.setTimeout(() => {
        setToast(null);
      }, 3200);
    },
    []
  );

  // Auto-save active document and sync with savedDesigns if already saved
  useEffect(() => {
    persistActiveDocument(doc);
    setLastSavedText(formatIndonesianTimestamp(doc.updatedAt));
    setSavedDesigns((prev) => {
      const exists = prev.some((d) => d.id === doc.id);
      if (!exists) return prev;
      const next = prev.map((d) => (d.id === doc.id ? doc : d));
      persistSavedDesigns(next);
      return next;
    });
  }, [doc]);

  const commitDoc = useCallback((updater: (prev: EmailDocument) => EmailDocument) => {
    setDoc((prev) => {
      const next = {
        ...updater(prev),
        updatedAt: new Date().toISOString(),
      };
      setPast((history) => [...history.slice(-(MAX_HISTORY - 1)), prev]);
      setFuture([]);
      return next;
    });
  }, []);

  const handleUndo = useCallback(() => {
    setPast((prevPast) => {
      if (prevPast.length === 0) return prevPast;
      const previous = prevPast[prevPast.length - 1];
      setFuture((prevFuture) => [doc, ...prevFuture.slice(0, MAX_HISTORY - 1)]);
      setDoc(previous);
      return prevPast.slice(0, -1);
    });
  }, [doc]);

  const handleRedo = useCallback(() => {
    setFuture((prevFuture) => {
      if (prevFuture.length === 0) return prevFuture;
      const next = prevFuture[0];
      setPast((prevPast) => [...prevPast.slice(-(MAX_HISTORY - 1)), doc]);
      setDoc(next);
      return prevFuture.slice(1);
    });
  }, [doc]);

  // Keyboard shortcuts for Undo / Redo
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      const isEditingInput =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable);
      if (isEditingInput) return;

      const isMod = e.metaKey || e.ctrlKey;
      if (isMod && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      } else if (
        (isMod && e.key.toLowerCase() === 'y') ||
        (isMod && e.shiftKey && e.key.toLowerCase() === 'z')
      ) {
        e.preventDefault();
        handleRedo();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

  const compiledHtml = useMemo(() => compileToEmailHtml(doc), [doc]);

  const selectedBlock = useMemo(
    () => doc.blocks.find((b) => b.id === selectedBlockId) ?? null,
    [doc.blocks, selectedBlockId]
  );

  function handleSelectBlock(blockId: string | null) {
    setSelectedBlockId(blockId);
    if (blockId) {
      setInspectorTab('properties');
    }
  }

  function handleAddBlock(type: BlockType) {
    const created = createDefaultBlock(type);
    commitDoc((prev) => ({
      ...prev,
      blocks: [...prev.blocks, created],
    }));
    setSelectedBlockId(created.id);
    setInspectorTab('properties');
    setMobilePane('canvas');
    showToast(`Blok ${getBlockLabel(type)} ditambahkan.`);
  }

  function handleInsertBlockAt(type: BlockType, index: number) {
    const created = createDefaultBlock(type);
    commitDoc((prev) => ({
      ...prev,
      blocks: insertBlockAt(prev.blocks, created, index),
    }));
    setSelectedBlockId(created.id);
    setInspectorTab('properties');
    showToast(`Blok ${getBlockLabel(type)} ditambahkan.`);
  }

  function handleUpdateBlock(updated: EmailBlock) {
    commitDoc((prev) => ({
      ...prev,
      blocks: prev.blocks.map((b) => (b.id === updated.id ? updated : b)),
    }));
  }

  function handleMoveBlock(index: number, direction: 'up' | 'down') {
    commitDoc((prev) => ({
      ...prev,
      blocks: moveBlock(prev.blocks, index, direction),
    }));
  }

  function handleReorderBlocks(fromIndex: number, toIndex: number) {
    commitDoc((prev) => ({
      ...prev,
      blocks: reorderBlocks(prev.blocks, fromIndex, toIndex),
    }));
  }

  function handleDuplicateBlock(index: number) {
    const target = doc.blocks[index];
    if (!target) return;
    const copy = duplicateBlock(target);
    commitDoc((prev) => ({
      ...prev,
      blocks: insertBlockAt(prev.blocks, copy, index + 1),
    }));
    setSelectedBlockId(copy.id);
    setInspectorTab('properties');
    showToast(`Blok ${getBlockLabel(target.type)} diduplikat.`);
  }

  function handleDeleteBlock(index: number) {
    const target = doc.blocks[index];
    if (!target) return;
    commitDoc((prev) => ({
      ...prev,
      blocks: prev.blocks.filter((_, i) => i !== index),
    }));
    if (selectedBlockId === target.id) {
      setSelectedBlockId(null);
    }
    showToast(`Blok ${getBlockLabel(target.type)} dihapus.`);
  }

  function handleUpdatePageStyle(updated: PageStyle) {
    commitDoc((prev) => ({
      ...prev,
      pageStyle: updated,
    }));
  }

  function handleTitleChange(title: string) {
    commitDoc((prev) => ({
      ...prev,
      title,
    }));
  }

  function handleSelectTemplate(templateId: string) {
    const freshDoc = cloneTemplateToDocument(templateId);
    setPast((history) => [...history.slice(-(MAX_HISTORY - 1)), doc]);
    setFuture([]);
    setDoc(freshDoc);
    setSelectedBlockId(freshDoc.blocks[0]?.id ?? null);
    setInspectorTab(freshDoc.blocks.length > 0 ? 'properties' : 'blocks');
    setSavedDesigns((prev) => {
      const next = upsertSavedDesign(prev, freshDoc);
      persistSavedDesigns(next);
      return next;
    });
    setHasVisitedEditor(true);
    setAppView('editor');
    setMobilePane('canvas');
    showToast(`Template "${freshDoc.title}" berhasil dimuat.`);
  }

  function handleOpenGallery() {
    setAppView('gallery');
  }

  function handleResumeEditor() {
    setHasVisitedEditor(true);
    setAppView('editor');
  }

  function handleSaveCurrentDesign() {
    setSavedDesigns((prev) => {
      const next = upsertSavedDesign(prev, doc);
      persistSavedDesigns(next);
      return next;
    });
    showToast('Desain berhasil disimpan ke daftar proyek lokal.');
  }

  function handleCreateNewBlank() {
    const blank = cloneTemplateToDocument('kanvas-kosong');
    setPast((history) => [...history.slice(-(MAX_HISTORY - 1)), doc]);
    setFuture([]);
    setDoc(blank);
    setSelectedBlockId(null);
    setInspectorTab('blocks');
    setSavedDesigns((prev) => {
      const next = upsertSavedDesign(prev, blank);
      persistSavedDesigns(next);
      return next;
    });
    setMobilePane('canvas');
    showToast('Dokumen kosong baru dibuat.');
  }

  function handleLoadDesign(design: EmailDocument) {
    setPast((history) => [...history.slice(-(MAX_HISTORY - 1)), doc]);
    setFuture([]);
    setDoc(design);
    setSelectedBlockId(design.blocks[0]?.id ?? null);
    setHasVisitedEditor(true);
    setAppView('editor');
    setMobilePane('canvas');
    showToast(`Membuka "${design.title}".`);
  }

  function handleDuplicateDesign(design: EmailDocument) {
    const copy: EmailDocument = {
      ...(JSON.parse(JSON.stringify(design)) as EmailDocument),
      id: generateId('doc'),
      title: `${design.title} (Salinan)`,
      updatedAt: new Date().toISOString(),
    };
    setSavedDesigns((prev) => {
      const next = upsertSavedDesign(prev, copy);
      persistSavedDesigns(next);
      return next;
    });
    setDoc(copy);
    setSelectedBlockId(copy.blocks[0]?.id ?? null);
    setHasVisitedEditor(true);
    setAppView('editor');
    showToast('Desain berhasil diduplikat.');
  }

  function handleDeleteDesign(designId: string) {
    setSavedDesigns((prev) => {
      const next = prev.filter((d) => d.id !== designId);
      persistSavedDesigns(next);
      return next;
    });
    showToast('Desain dihapus dari daftar tersimpan.');
  }

  function handleImportDocument(imported: EmailDocument) {
    setPast((history) => [...history.slice(-(MAX_HISTORY - 1)), doc]);
    setFuture([]);
    setDoc(imported);
    setSelectedBlockId(imported.blocks[0]?.id ?? null);
    setSavedDesigns((prev) => {
      const next = upsertSavedDesign(prev, imported);
      persistSavedDesigns(next);
      return next;
    });
    showToast(`Desain "${imported.title}" berhasil diimpor.`);
  }

  async function handleCopyHtml() {
    const ok = await copyTextToClipboard(compiledHtml);
    if (ok) {
      setCopiedRecently(true);
      setTimeout(() => setCopiedRecently(false), 2000);
      showToast('Script HTML email siap pakai berhasil disalin ke clipboard!');
    } else {
      showToast(
        'Gagal menyalin otomatis. Silakan salin dari tab Code di panel kanan.',
        'error'
      );
    }
  }

  function handleDownloadHtml() {
    const slug = doc.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    const blob = new Blob([compiledHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${slug || 'bungtemin-email'}.html`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`File ${slug || 'bungtemin-email'}.html mulai diunduh.`);
  }

  if (appView === 'gallery') {
    return (
      <>
        <TemplateGalleryPage
          activeDoc={doc}
          hasVisitedEditor={hasVisitedEditor}
          savedDesigns={savedDesigns}
          onSelectTemplate={handleSelectTemplate}
          onResumeEditor={handleResumeEditor}
          onLoadSavedDesign={handleLoadDesign}
          onDuplicateSavedDesign={handleDuplicateDesign}
          onDeleteSavedDesign={handleDeleteDesign}
        />
        <Toast toast={toast} onDismiss={() => setToast(null)} />
      </>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-slate-100 text-slate-900">
      <TopBar
        title={doc.title}
        onTitleChange={handleTitleChange}
        canUndo={past.length > 0}
        canRedo={future.length > 0}
        onUndo={handleUndo}
        onRedo={handleRedo}
        previewMode={previewMode}
        onPreviewModeChange={setPreviewMode}
        showLivePreview={showLivePreview}
        onToggleLivePreview={() => setShowLivePreview((prev) => !prev)}
        onOpenTemplates={handleOpenGallery}
        onOpenJson={() => setIsJsonOpen(true)}
        onDownloadHtml={handleDownloadHtml}
        onCopyHtml={handleCopyHtml}
        copiedRecently={copiedRecently}
      />

      {/* Mobile workspace pane switcher (visible below lg) */}
      <div className="lg:hidden bg-white border-b border-slate-200 px-3 py-1.5 flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center border border-slate-200 rounded-lg p-0.5 bg-slate-50 md:hidden shrink-0">
          <button
            type="button"
            onClick={handleUndo}
            disabled={past.length === 0}
            aria-label="Undo mobile"
            className="p-1.5 rounded text-slate-700 disabled:opacity-35 cursor-pointer disabled:cursor-not-allowed"
          >
            <Undo2 className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={handleRedo}
            disabled={future.length === 0}
            aria-label="Redo mobile"
            className="p-1.5 rounded text-slate-700 disabled:opacity-35 cursor-pointer disabled:cursor-not-allowed"
          >
            <Redo2 className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>
        <div
          role="tablist"
          aria-label="Navigasi Panel Mobile"
          className="grid grid-cols-4 gap-1 flex-1 bg-slate-100 p-0.5 rounded-lg"
        >
          {[
            { id: 'saved' as const, label: 'Desain', icon: FolderOpen },
            { id: 'canvas' as const, label: 'Kanvas', icon: Layers },
            { id: 'preview' as const, label: 'Preview', icon: Eye },
            { id: 'inspector' as const, label: 'Inspector', icon: SlidersHorizontal },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={mobilePane === id}
              onClick={() => setMobilePane(id)}
              className={`flex items-center justify-center gap-1 py-1.5 text-[11px] font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                mobilePane === id
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600'
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Studio Workspace (3-Column or Split Canvas + Live Preview Iframe) */}
      <div className="flex-1 min-h-0 flex overflow-hidden">
        <div
          className={`${
            mobilePane === 'saved' ? 'flex w-full' : 'hidden'
          } ${showLivePreview ? '2xl:flex' : 'lg:flex'} lg:w-auto h-full shrink-0`}
        >
          <SidebarLeft
            currentDoc={doc}
            savedDesigns={savedDesigns}
            selectedBlockId={selectedBlockId}
            onTitleChange={handleTitleChange}
            onSelectBlock={(id) => {
              handleSelectBlock(id);
              setMobilePane('canvas');
            }}
            onSaveDesign={handleSaveCurrentDesign}
            onCreateNew={handleCreateNewBlank}
            onLoadDesign={handleLoadDesign}
            onDuplicateDesign={handleDuplicateDesign}
            onDeleteDesign={handleDeleteDesign}
            lastSavedText={lastSavedText}
          />
        </div>

        <div
          className={`${
            mobilePane === 'canvas' ? 'flex' : 'hidden'
          } lg:flex flex-1 min-w-0 h-full`}
        >
          <CanvasEditor
            doc={doc}
            previewMode={previewMode}
            selectedBlockId={selectedBlockId}
            onSelectBlock={(id) => {
              handleSelectBlock(id);
            }}
            onMoveBlock={handleMoveBlock}
            onDuplicateBlock={handleDuplicateBlock}
            onDeleteBlock={handleDeleteBlock}
            onInsertBlockAt={handleInsertBlockAt}
            onReorderBlocks={handleReorderBlocks}
            onOpenTemplates={handleOpenGallery}
          />
        </div>

        {/* Live HTML Iframe Preview beside Canvas Editor */}
        <div
          className={`${
            mobilePane === 'preview' ? 'flex w-full' : 'hidden'
          } ${showLivePreview ? 'lg:flex lg:flex-1' : 'lg:hidden'} min-w-0 h-full`}
        >
          {(showLivePreview || mobilePane === 'preview') && (
            <LivePreviewPane
              compiledHtml={compiledHtml}
              previewMode={previewMode}
              onPreviewModeChange={setPreviewMode}
              onClose={() => {
                setShowLivePreview(false);
                if (mobilePane === 'preview') setMobilePane('canvas');
              }}
            />
          )}
        </div>

        <div
          className={`${
            mobilePane === 'inspector' ? 'flex w-full' : 'hidden'
          } lg:flex lg:w-auto h-full shrink-0`}
        >
          <InspectorRight
            activeTab={inspectorTab}
            onTabChange={setInspectorTab}
            selectedBlock={selectedBlock}
            pageStyle={doc.pageStyle}
            compiledHtml={compiledHtml}
            compact={showLivePreview}
            onAddBlock={handleAddBlock}
            onUpdateBlock={handleUpdateBlock}
            onUpdatePageStyle={handleUpdatePageStyle}
            onCopyHtml={handleCopyHtml}
            onDownloadHtml={handleDownloadHtml}
            copiedRecently={copiedRecently}
          />
        </div>
      </div>

      <JsonModal
        isOpen={isJsonOpen}
        doc={doc}
        onClose={() => setIsJsonOpen(false)}
        onImportDocument={handleImportDocument}
      />

      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}
