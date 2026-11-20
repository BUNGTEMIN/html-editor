import {
  CopyPlus,
  FolderOpen,
  Layers,
  Plus,
  Save,
  Trash2,
} from 'lucide-react';
import type { EmailBlock, EmailDocument } from '../types/email';
import { getBlockLabel } from '../utils/blocks';
import { formatIndonesianTimestamp } from '../utils/storage';

interface SidebarLeftProps {
  currentDoc: EmailDocument;
  savedDesigns: EmailDocument[];
  selectedBlockId: string | null;
  onTitleChange: (title: string) => void;
  onSelectBlock: (blockId: string) => void;
  onSaveDesign: () => void;
  onCreateNew: () => void;
  onLoadDesign: (design: EmailDocument) => void;
  onDuplicateDesign: (design: EmailDocument) => void;
  onDeleteDesign: (designId: string) => void;
  lastSavedText: string;
}

function getBlockPreviewSnippet(block: EmailBlock): string {
  switch (block.type) {
    case 'header':
      return block.title || 'Header tanpa judul';
    case 'text':
      return block.content.replace(/\*\*|\*/g, '').slice(0, 36) || 'Paragraf kosong';
    case 'image':
      return block.caption || block.alt || 'Gambar';
    case 'button':
      return block.label || 'Tombol CTA';
    case 'callout':
      return block.title || 'Kotak informasi';
    case 'kvTable':
      return block.title || `${block.rows.length} baris info`;
    case 'twoColumns':
      return `${block.left.title || 'Kolom 1'} & ${block.right.title || 'Kolom 2'}`;
    case 'divider':
      return block.showLine ? `Garis (${block.spacerHeight}px)` : `Spasi (${block.spacerHeight}px)`;
    case 'footer':
      return block.orgName || 'Footer organisasi';
  }
}

export function SidebarLeft({
  currentDoc,
  savedDesigns,
  selectedBlockId,
  onTitleChange,
  onSelectBlock,
  onSaveDesign,
  onCreateNew,
  onLoadDesign,
  onDuplicateDesign,
  onDeleteDesign,
  lastSavedText,
}: SidebarLeftProps) {
  return (
    <aside
      aria-label="Desain Tersimpan dan Struktur Blok"
      className="w-full lg:w-64 xl:w-68 bg-white border-r border-slate-200 flex flex-col h-full shrink-0 overflow-hidden"
    >
      {/* Mobile-only document title input */}
      <div className="sm:hidden px-4 py-3 border-b border-slate-200 bg-slate-50">
        <label
          htmlFor="mobile-doc-title"
          className="block text-[11px] font-semibold text-slate-600 mb-1"
        >
          Judul Dokumen Aktif
        </label>
        <input
          id="mobile-doc-title"
          type="text"
          value={currentDoc.title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Judul dokumen email..."
          className="w-full px-2.5 py-1.5 text-xs font-medium bg-white border border-slate-200 rounded-md focus:border-slate-500 outline-none"
        />
      </div>

      {/* Section 1: Desain Tersimpan */}
      <div className="flex flex-col border-b border-slate-200 max-h-[52%] min-h-[210px]">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <FolderOpen className="w-4 h-4 text-slate-500 shrink-0" aria-hidden="true" />
            <h2 className="text-xs font-semibold text-slate-900 truncate">
              Desain Tersimpan
            </h2>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={onSaveDesign}
              title="Simpan ke daftar Desain Tersimpan"
              aria-label="Simpan desain saat ini"
              className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-md transition-colors cursor-pointer whitespace-nowrap"
            >
              <Save className="w-3 h-3" aria-hidden="true" />
              <span>Simpan</span>
            </button>
            <button
              type="button"
              onClick={onCreateNew}
              title="Buat dokumen baru"
              aria-label="Buat dokumen baru"
              className="p-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="px-4 py-1.5 bg-slate-50 border-b border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
          <span>Auto-save lokal aktif</span>
          <span className="tabular-nums">{lastSavedText}</span>
        </div>

        <div className="overflow-y-auto studio-scroll p-2 space-y-1 flex-1">
          {savedDesigns.length === 0 ? (
            <div className="px-3 py-6 text-center text-xs text-slate-500">
              <p className="mb-2">Belum ada desain tersimpan di daftar proyek.</p>
              <button
                type="button"
                onClick={onSaveDesign}
                className="text-emerald-700 font-medium hover:underline cursor-pointer"
              >
                Simpan desain aktif sekarang
              </button>
            </div>
          ) : (
            savedDesigns.map((design) => {
              const isActive = design.id === currentDoc.id;
              return (
                <div
                  key={design.id}
                  className={`group rounded-lg border transition-colors ${
                    isActive
                      ? 'bg-slate-900 border-slate-900 text-white'
                      : 'bg-white border-transparent hover:bg-slate-50 hover:border-slate-200 text-slate-800'
                  }`}
                >
                  <div className="flex items-start justify-between gap-1 p-2">
                    <button
                      type="button"
                      onClick={() => onLoadDesign(design)}
                      className="text-left min-w-0 flex-1 cursor-pointer"
                      aria-label={`Buka desain ${design.title}`}
                    >
                      <p
                        className={`text-xs font-semibold truncate ${
                          isActive ? 'text-white' : 'text-slate-800'
                        }`}
                      >
                        {design.title}
                      </p>
                      <p
                        className={`text-[11px] mt-0.5 tabular-nums ${
                          isActive ? 'text-slate-300' : 'text-slate-500'
                        }`}
                      >
                        {design.blocks.length} blok · {formatIndonesianTimestamp(design.updatedAt)}
                      </p>
                    </button>

                    <div className="flex items-center gap-0.5 shrink-0 opacity-75 group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={() => onDuplicateDesign(design)}
                        aria-label={`Duplikat desain ${design.title}`}
                        title="Duplikat desain"
                        className={`p-1 rounded transition-colors cursor-pointer ${
                          isActive
                            ? 'text-slate-300 hover:text-white hover:bg-slate-800'
                            : 'text-slate-400 hover:text-slate-700 hover:bg-slate-200/70'
                        }`}
                      >
                        <CopyPlus className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteDesign(design.id)}
                        aria-label={`Hapus desain ${design.title}`}
                        title="Hapus dari daftar tersimpan"
                        className={`p-1 rounded transition-colors cursor-pointer ${
                          isActive
                            ? 'text-slate-300 hover:text-rose-300 hover:bg-slate-800'
                            : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                        }`}
                      >
                        <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Section 2: Struktur Blok */}
      <div className="flex flex-col flex-1 min-h-0">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-slate-500 shrink-0" aria-hidden="true" />
            <h2 className="text-xs font-semibold text-slate-900">Struktur Blok</h2>
          </div>
          <span className="text-[11px] font-mono tabular-nums text-slate-500">
            {currentDoc.blocks.length}
          </span>
        </div>

        <div className="overflow-y-auto studio-scroll p-2 space-y-1 flex-1">
          {currentDoc.blocks.length === 0 ? (
            <p className="px-3 py-6 text-center text-xs text-slate-400">
              Kanvas masih kosong. Tambahkan blok dari panel kanan.
            </p>
          ) : (
            currentDoc.blocks.map((block, idx) => {
              const isSelected = block.id === selectedBlockId;
              return (
                <button
                  key={block.id}
                  type="button"
                  onClick={() => onSelectBlock(block.id)}
                  aria-label={`Pilih blok ${idx + 1}: ${getBlockLabel(block.type)}`}
                  className={`w-full text-left px-2.5 py-2 rounded-lg border transition-colors flex items-start gap-2 cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                      : 'bg-white border-transparent hover:bg-slate-50 hover:border-slate-200 text-slate-700'
                  }`}
                >
                  <span className="text-[11px] font-mono tabular-nums text-slate-400 mt-0.5 shrink-0">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold truncate">
                      {getBlockLabel(block.type)}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {getBlockPreviewSnippet(block)}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </aside>
  );
}
