import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CopyPlus,
  Eye,
  FilePlus2,
  FolderOpen,
  Mail,
  Monitor,
  Search,
  Smartphone,
  Trash2,
  X,
} from 'lucide-react';
import type { EmailDocument, PreviewMode, TemplatePreset } from '../types/email';
import {
  filterTemplates,
  TEMPLATE_CATEGORIES,
  TEMPLATE_PRESETS,
} from '../utils/templates';
import { formatIndonesianTimestamp } from '../utils/storage';
import { BlockPreview } from './BlockPreview';

interface TemplateGalleryPageProps {
  activeDoc: EmailDocument;
  hasVisitedEditor: boolean;
  savedDesigns: EmailDocument[];
  onSelectTemplate: (templateId: string) => void;
  onResumeEditor: () => void;
  onLoadSavedDesign: (design: EmailDocument) => void;
  onDuplicateSavedDesign: (design: EmailDocument) => void;
  onDeleteSavedDesign: (designId: string) => void;
}

function ScaledTemplateThumbnail({ preset }: { preset: TemplatePreset }) {
  const { pageStyle, blocks } = preset.document;

  if (blocks.length === 0) {
    return (
      <div className="h-56 bg-slate-50 border-b border-slate-200 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 mb-3">
          <FilePlus2 className="w-5 h-5" aria-hidden="true" />
        </div>
        <p className="text-xs font-semibold text-slate-700">Kanvas Kosong</p>
        <p className="text-[11px] text-slate-500 mt-0.5 max-w-[200px]">
          Susun blok sendiri dari awal sesuai kebutuhan organisasi
        </p>
      </div>
    );
  }

  // Render an authentic scaled-down live preview of the template's top blocks
  const previewBlocks = blocks.slice(0, 4);

  return (
    <div
      className="h-56 border-b border-slate-200 overflow-hidden relative select-none"
      style={{ backgroundColor: pageStyle.outerBgColor }}
    >
      <div
        style={{
          width: '600px',
          transform: 'translateX(-50%) scale(0.46)',
          transformOrigin: 'top center',
          backgroundColor: pageStyle.contentBgColor,
          borderRadius: `${pageStyle.containerRadius}px`,
          fontFamily: pageStyle.fontFamily,
        }}
        className="absolute top-3 left-1/2 pointer-events-none shadow-sm border border-slate-200/90 overflow-hidden h-fit"
      >
        {previewBlocks.map((block) => (
          <BlockPreview
            key={block.id}
            block={block}
            fontFamily={pageStyle.fontFamily}
            previewMode="desktop"
          />
        ))}
      </div>
      {/* Subtle bottom fade into card body */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/10 to-transparent" />
    </div>
  );
}

export function TemplateGalleryPage({
  activeDoc,
  hasVisitedEditor,
  savedDesigns,
  onSelectTemplate,
  onResumeEditor,
  onLoadSavedDesign,
  onDuplicateSavedDesign,
  onDeleteSavedDesign,
}: TemplateGalleryPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [previewPreset, setPreviewPreset] = useState<TemplatePreset | null>(null);
  const [previewViewport, setPreviewViewport] = useState<PreviewMode>('desktop');

  const filteredTemplates = useMemo(
    () => filterTemplates(TEMPLATE_PRESETS, searchQuery, selectedCategory),
    [searchQuery, selectedCategory]
  );

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-slate-50 text-slate-900 flex flex-col">
      {/* Clean 3-Zone Top Bar */}
      <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-xs border-b border-slate-200 px-3 sm:px-6 lg:px-8 flex items-center justify-between gap-3 sm:gap-6">
        {/* Zone 1: Brand wordmark */}
        <div className="flex items-center gap-2 shrink-0 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0">
            <Mail className="w-4 h-4" aria-hidden="true" />
          </div>
          <span className="font-bold text-sm sm:text-base tracking-tight text-slate-900 whitespace-nowrap shrink-0">
            Bungtemin Mail Studio
          </span>
        </div>

        {/* Zone 2: Concise single-line anchor links */}
        <nav
          aria-label="Navigasi Galeri Template"
          className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600"
        >
          <a
            href="#kumpulan-template"
            className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
          >
            Kumpulan Template
          </a>
          <a
            href="#desain-tersimpan"
            className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
          >
            Desain Tersimpan ({savedDesigns.length})
          </a>
        </nav>

        {/* Zone 3: Primary action */}
        <div className="flex items-center gap-2 shrink-0">
          {hasVisitedEditor ? (
            <button
              type="button"
              onClick={onResumeEditor}
              className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">Kembali ke Editor</span>
              <span className="sm:hidden">Editor</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onResumeEditor}
              className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span>Buka Editor</span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10 space-y-12">
        {/* Intro & Filter Toolbar */}
        <section id="kumpulan-template" className="space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <div className="max-w-2xl">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 [text-wrap:balance]">
                Pilih Template Email Organisasi
              </h1>
              <p className="text-sm sm:text-base text-slate-600 mt-2 leading-relaxed">
                Mulai dari template siap pakai untuk pengumuman, undangan rapat, buletin, hingga laporan kegiatan. Semua layout responsif untuk HP maupun desktop dan siap diekspor ke HTML penuh.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => onSelectTemplate('kanvas-kosong')}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-slate-800 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <FilePlus2 className="w-4 h-4 text-slate-500" aria-hidden="true" />
                <span>Mulai dari Kanvas Kosong</span>
              </button>
            </div>
          </div>

          {/* Search + Category Segmented Controls */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-2">
            <div
              role="group"
              aria-label="Filter Kategori Template"
              className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-lg overflow-x-auto max-w-full"
            >
              {TEMPLATE_CATEGORIES.map((category) => {
                const active = selectedCategory === category;
                return (
                  <button
                    key={category}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      active
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {category}
                  </button>
                );
              })}
            </div>

            <div className="relative w-full md:w-72 shrink-0">
              <Search
                className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              />
              <label htmlFor="template-search-input" className="sr-only">
                Cari template email
              </label>
              <input
                id="template-search-input"
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari pengumuman, undangan, buletin..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:border-slate-400 outline-none transition-colors"
              />
            </div>
          </div>

          {/* Template Cards Grid */}
          {filteredTemplates.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl py-16 px-6 text-center">
              <p className="text-sm font-semibold text-slate-800">
                Tidak ada template yang cocok dengan pencarian Anda
              </p>
              <p className="text-xs text-slate-500 mt-1 mb-4">
                Coba kata kunci lain atau tampilkan kembali seluruh kategori template.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('Semua');
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg cursor-pointer"
              >
                Tampilkan Semua Template
              </button>
            </div>
          ) : (
            <div
              data-testid="template-gallery-grid"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
            >
              {filteredTemplates.map((preset) => (
                <article
                  key={preset.id}
                  data-testid={`template-card-${preset.id}`}
                  className="min-w-0 bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col hover:border-slate-300 hover:shadow-sm transition-all"
                >
                  <ScaledTemplateThumbnail preset={preset} />

                  <div className="p-4 flex-1 flex flex-col justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                        <span>{preset.category}</span>
                        <span aria-hidden="true">·</span>
                        <span className="tabular-nums">
                          {preset.document.blocks.length} blok
                        </span>
                      </div>
                      <h2 className="text-sm font-bold text-slate-900 leading-snug">
                        {preset.name}
                      </h2>
                      <p className="text-xs text-slate-600 leading-relaxed mt-1.5 line-clamp-3">
                        {preset.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => onSelectTemplate(preset.id)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-emerald-600 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                      >
                        <span>Gunakan Template</span>
                        <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>

                      {preset.document.blocks.length > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            setPreviewPreset(preset);
                            setPreviewViewport('desktop');
                          }}
                          aria-label={`Pratinjau ${preset.name}`}
                          title="Pratinjau penuh"
                          className="p-2 text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer shrink-0"
                        >
                          <Eye className="w-4 h-4" aria-hidden="true" />
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Saved Designs Section */}
        <section
          id="desain-tersimpan"
          className="pt-6 border-t border-slate-200 space-y-4"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-slate-500" aria-hidden="true" />
                <span>Desain Tersimpan di Perangkat Ini</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Proyek yang sedang Anda kerjakan otomatis tersimpan lokal agar bisa dilanjutkan kapan saja.
              </p>
            </div>
            <span className="text-xs font-mono tabular-nums text-slate-500">
              {savedDesigns.length} proyek tersimpan
            </span>
          </div>

          {savedDesigns.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-xs text-slate-500">
              Belum ada desain tersimpan. Pilih salah satu template di atas untuk mulai membuat email pertama Anda.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {savedDesigns.map((design) => {
                const isActive = design.id === activeDoc.id;
                return (
                  <div
                    key={design.id}
                    className={`bg-white border rounded-xl p-4 flex flex-col justify-between gap-3 transition-colors ${
                      isActive
                        ? 'border-emerald-500 ring-1 ring-emerald-500/20'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mb-1 tabular-nums">
                        {isActive && (
                          <>
                            <span className="font-semibold text-emerald-700">
                              Draft Aktif
                            </span>
                            <span aria-hidden="true">·</span>
                          </>
                        )}
                        <span>{design.blocks.length} blok</span>
                        <span aria-hidden="true">·</span>
                        <span>{formatIndonesianTimestamp(design.updatedAt)}</span>
                      </div>
                      <h3 className="text-sm font-semibold text-slate-900 truncate">
                        {design.title}
                      </h3>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => onLoadSavedDesign(design)}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 cursor-pointer"
                      >
                        <span>Lanjutkan Edit</span>
                        <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => onDuplicateSavedDesign(design)}
                          aria-label={`Duplikat proyek ${design.title}`}
                          title="Duplikat proyek"
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                        >
                          <CopyPlus className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteSavedDesign(design.id)}
                          aria-label={`Hapus proyek ${design.title}`}
                          title="Hapus proyek"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* Full Template Preview Modal */}
      {previewPreset && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="preview-modal-title"
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setPreviewPreset(null);
          }}
        >
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <h2
                  id="preview-modal-title"
                  className="text-sm font-bold text-slate-900 truncate"
                >
                  Pratinjau: {previewPreset.name}
                </h2>
                <p className="text-xs text-slate-500">
                  {previewPreset.category} · {previewPreset.document.blocks.length} blok konten
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <div
                  role="group"
                  aria-label="Ukuran Pratinjau Template"
                  className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200"
                >
                  <button
                    type="button"
                    onClick={() => setPreviewViewport('desktop')}
                    aria-pressed={previewViewport === 'desktop'}
                    className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                      previewViewport === 'desktop'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600'
                    }`}
                  >
                    <Monitor className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Desktop</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewViewport('mobile')}
                    aria-pressed={previewViewport === 'mobile'}
                    className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                      previewViewport === 'mobile'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Mobile</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const id = previewPreset.id;
                    setPreviewPreset(null);
                    onSelectTemplate(id);
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                >
                  <span>Edit Template Ini</span>
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </button>

                <button
                  type="button"
                  onClick={() => setPreviewPreset(null)}
                  aria-label="Tutup pratinjau template"
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  <X className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto studio-scroll studio-canvas-bg p-6 flex justify-center">
              <div
                style={{
                  width: '100%',
                  maxWidth: `${previewViewport === 'mobile' ? 375 : 600}px`,
                  backgroundColor: previewPreset.document.pageStyle.contentBgColor,
                  borderRadius: `${
                    previewViewport === 'mobile'
                      ? 0
                      : previewPreset.document.pageStyle.containerRadius
                  }px`,
                  fontFamily: previewPreset.document.pageStyle.fontFamily,
                }}
                className="h-fit border border-slate-200 shadow-sm overflow-hidden transition-[max-width] duration-200"
              >
                {previewPreset.document.blocks.map((block) => (
                  <BlockPreview
                    key={block.id}
                    block={block}
                    fontFamily={previewPreset.document.pageStyle.fontFamily}
                    previewMode={previewViewport}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
