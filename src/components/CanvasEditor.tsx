import { useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Copy,
  GripVertical,
  LayoutTemplate,
  Plus,
  Trash2,
} from 'lucide-react';
import type { BlockType, EmailDocument, PreviewMode } from '../types/email';
import { getBlockLabel } from '../utils/blocks';
import { BlockPreview } from './BlockPreview';

interface CanvasEditorProps {
  doc: EmailDocument;
  previewMode: PreviewMode;
  selectedBlockId: string | null;
  onSelectBlock: (blockId: string | null) => void;
  onMoveBlock: (index: number, direction: 'up' | 'down') => void;
  onDuplicateBlock: (index: number) => void;
  onDeleteBlock: (index: number) => void;
  onInsertBlockAt: (type: BlockType, index: number) => void;
  onReorderBlocks: (fromIndex: number, toIndex: number) => void;
  onOpenTemplates: () => void;
}

export function CanvasEditor({
  doc,
  previewMode,
  selectedBlockId,
  onSelectBlock,
  onMoveBlock,
  onDuplicateBlock,
  onDeleteBlock,
  onInsertBlockAt,
  onReorderBlocks,
  onOpenTemplates,
}: CanvasEditorProps) {
  const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);

  const frameWidth =
    previewMode === 'mobile' ? 375 : doc.pageStyle.containerWidth || 600;

  function handleDragOverSlot(e: React.DragEvent, index: number) {
    e.preventDefault();
    e.dataTransfer.dropEffect =
      e.dataTransfer.types.includes('application/x-bungtemin-new-block')
        ? 'copy'
        : 'move';
    if (dropTargetIndex !== index) {
      setDropTargetIndex(index);
    }
  }

  function handleDropAt(e: React.DragEvent, targetIndex: number) {
    e.preventDefault();
    setDropTargetIndex(null);
    setDraggingIndex(null);

    const newBlockType = e.dataTransfer.getData(
      'application/x-bungtemin-new-block'
    ) as BlockType | '';
    if (newBlockType) {
      onInsertBlockAt(newBlockType, targetIndex);
      return;
    }

    const fromIndexRaw = e.dataTransfer.getData(
      'application/x-bungtemin-move-index'
    );
    if (fromIndexRaw !== '') {
      const fromIndex = Number(fromIndexRaw);
      if (!Number.isNaN(fromIndex)) {
        onReorderBlocks(fromIndex, targetIndex);
      }
    }
  }

  function handleCanvasBgClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget) {
      onSelectBlock(null);
    }
  }

  return (
    <main
      aria-label="Kanvas Editor Email"
      onClick={handleCanvasBgClick}
      onDragLeave={(e) => {
        if (e.currentTarget === e.target) {
          setDropTargetIndex(null);
        }
      }}
      className="flex-1 min-w-0 h-full overflow-y-auto studio-scroll studio-canvas-bg px-4 sm:px-6 lg:px-8 py-6 flex flex-col items-center"
    >
      {/* Subtle viewport dimension ruler */}
      <div className="mb-3 flex items-center gap-2 text-xs text-slate-500 select-none">
        <span className="font-medium text-slate-700">
          {previewMode === 'mobile' ? 'Pratinjau Mobile' : 'Pratinjau Desktop'}
        </span>
        <span aria-hidden="true">·</span>
        <span className="font-mono tabular-nums">{frameWidth}px</span>
        <span aria-hidden="true">·</span>
        <span className="tabular-nums">{doc.blocks.length} blok</span>
      </div>

      {/* Outer email background preview wrapper */}
      <div
        data-testid="email-canvas-frame"
        style={{
          width: '100%',
          maxWidth: `${frameWidth + (previewMode === 'mobile' ? 20 : 48)}px`,
          backgroundColor: doc.pageStyle.outerBgColor,
        }}
        className="rounded-2xl border border-slate-200/90 shadow-sm p-2.5 sm:p-6 transition-[max-width] duration-200"
      >
        {/* Email container */}
        <div
          style={{
            width: '100%',
            maxWidth: `${frameWidth}px`,
            backgroundColor: doc.pageStyle.contentBgColor,
            borderRadius: `${previewMode === 'mobile' ? 0 : doc.pageStyle.containerRadius}px`,
            fontFamily: doc.pageStyle.fontFamily,
          }}
          className="mx-auto border border-slate-200 shadow-xs overflow-hidden min-h-[260px]"
          onDragOver={(e) => {
            if (doc.blocks.length === 0) {
              handleDragOverSlot(e, 0);
            }
          }}
          onDrop={(e) => {
            if (doc.blocks.length === 0) {
              handleDropAt(e, 0);
            }
          }}
        >
          {doc.blocks.length === 0 ? (
            <div
              className={`py-16 px-6 text-center transition-colors ${
                dropTargetIndex === 0 ? 'bg-emerald-50/70' : ''
              }`}
            >
              <p className="text-sm font-semibold text-slate-800 mb-1.5">
                Kanvas Email Masih Kosong
              </p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mb-5 leading-relaxed">
                Klik atau tarik blok dari tab <strong className="font-semibold text-slate-700">Blocks</strong> di panel kanan, atau muat salah satu template siap pakai.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => onInsertBlockAt('header', 0)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Tambah Header Banner</span>
                </button>
                <button
                  type="button"
                  onClick={onOpenTemplates}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                >
                  <LayoutTemplate className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Pilih Template Preset</span>
                </button>
              </div>
            </div>
          ) : (
            <div>
              {doc.blocks.map((block, index) => {
                const isSelected = block.id === selectedBlockId;
                const label = getBlockLabel(block.type);
                const isDragging = draggingIndex === index;

                return (
                  <div key={block.id}>
                    {/* Drop zone above block */}
                    <div
                      onDragOver={(e) => handleDragOverSlot(e, index)}
                      onDrop={(e) => handleDropAt(e, index)}
                      className={`transition-all ${
                        dropTargetIndex === index
                          ? 'h-3 bg-emerald-500/20 border-y-2 border-emerald-500'
                          : 'h-0'
                      }`}
                    />

                    {/* Interactive Block Wrapper */}
                    <div
                      draggable
                      onDragStart={(e) => {
                        setDraggingIndex(index);
                        e.dataTransfer.setData(
                          'application/x-bungtemin-move-index',
                          String(index)
                        );
                        e.dataTransfer.effectAllowed = 'move';
                      }}
                      onDragEnd={() => {
                        setDraggingIndex(null);
                        setDropTargetIndex(null);
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        const rect = e.currentTarget.getBoundingClientRect();
                        const midY = rect.top + rect.height / 2;
                        const target = e.clientY < midY ? index : index + 1;
                        if (dropTargetIndex !== target) {
                          setDropTargetIndex(target);
                        }
                      }}
                      onDrop={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const midY = rect.top + rect.height / 2;
                        const target = e.clientY < midY ? index : index + 1;
                        handleDropAt(e, target);
                      }}
                      data-testid={`canvas-block-${block.type}`}
                      className={`group relative transition-opacity ${
                        isDragging ? 'opacity-40' : 'opacity-100'
                      } ${
                        isSelected
                          ? 'ring-2 ring-inset ring-emerald-600 z-10'
                          : 'hover:ring-1 hover:ring-inset hover:ring-slate-400/80'
                      }`}
                    >
                      {/* Clickable selection overlay button (accessible) */}
                      <div
                        role="button"
                        tabIndex={0}
                        aria-label={`Edit blok ${index + 1}: ${label}`}
                        aria-pressed={isSelected}
                        onClick={() => onSelectBlock(block.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            onSelectBlock(block.id);
                          }
                        }}
                        className="cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
                      >
                        <BlockPreview
                          block={block}
                          fontFamily={doc.pageStyle.fontFamily}
                          previewMode={previewMode}
                        />
                      </div>

                      {/* Floating Block Label (top-left) */}
                      <div
                        className={`pointer-events-none absolute top-1.5 left-1.5 px-2 py-0.5 text-[10px] font-semibold tracking-wide rounded bg-slate-900/95 border border-white/15 text-white shadow-sm transition-opacity ${
                          isSelected
                            ? 'opacity-100'
                            : 'opacity-0 group-hover:opacity-100'
                        }`}
                      >
                        {label}
                      </div>

                      {/* Floating Hover / Selected Controls (top-right) */}
                      <div
                        className={`absolute top-1.5 right-1.5 flex items-center gap-0.5 bg-slate-900/95 border border-white/15 text-white rounded-md p-0.5 shadow-md transition-opacity z-20 ${
                          isSelected
                            ? 'opacity-100'
                            : 'opacity-0 group-hover:opacity-100 focus-within:opacity-100'
                        }`}
                      >
                        <span
                          title="Tarik untuk urutkan ulang"
                          className="p-1 text-slate-300 cursor-grab active:cursor-grabbing"
                          aria-hidden="true"
                        >
                          <GripVertical className="w-3.5 h-3.5" />
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onMoveBlock(index, 'up');
                          }}
                          disabled={index === 0}
                          aria-label={`Pindah atas blok ${index + 1} ${label}`}
                          title="Pindah ke atas"
                          className="p-1 rounded hover:bg-slate-700 disabled:opacity-35 transition-colors cursor-pointer disabled:cursor-not-allowed"
                        >
                          <ArrowUp className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onMoveBlock(index, 'down');
                          }}
                          disabled={index === doc.blocks.length - 1}
                          aria-label={`Pindah bawah blok ${index + 1} ${label}`}
                          title="Pindah ke bawah"
                          className="p-1 rounded hover:bg-slate-700 disabled:opacity-35 transition-colors cursor-pointer disabled:cursor-not-allowed"
                        >
                          <ArrowDown className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDuplicateBlock(index);
                          }}
                          aria-label={`Duplikat blok ${index + 1} ${label}`}
                          title="Duplikat blok"
                          className="p-1 rounded hover:bg-slate-700 transition-colors cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteBlock(index);
                          }}
                          aria-label={`Hapus blok ${index + 1} ${label}`}
                          title="Hapus blok"
                          className="p-1 rounded hover:bg-rose-600 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Drop zone at bottom */}
              <div
                onDragOver={(e) => handleDragOverSlot(e, doc.blocks.length)}
                onDrop={(e) => handleDropAt(e, doc.blocks.length)}
                className={`transition-all flex items-center justify-center ${
                  dropTargetIndex === doc.blocks.length
                    ? 'h-12 bg-emerald-50 border-t-2 border-emerald-500 text-xs font-medium text-emerald-700'
                    : 'h-4'
                }`}
              >
                {dropTargetIndex === doc.blocks.length && 'Lepaskan blok di sini'}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
