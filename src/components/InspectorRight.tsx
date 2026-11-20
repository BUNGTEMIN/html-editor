import {
  AlignLeft,
  Building2,
  Check,
  Code2,
  Columns2,
  Copy,
  Download,
  Heading,
  Image,
  Info,
  Minus,
  MousePointerClick,
  Palette,
  Plus,
  SlidersHorizontal,
  SquareStack,
  Table2,
} from 'lucide-react';
import type {
  BlockType,
  EmailBlock,
  InspectorTab,
  PageStyle,
} from '../types/email';
import { BLOCK_CATALOG, FONT_FAMILY_OPTIONS } from '../utils/blocks';
import { BlockPropertiesForm } from './BlockPropertiesForm';

interface InspectorRightProps {
  activeTab: InspectorTab;
  onTabChange: (tab: InspectorTab) => void;
  selectedBlock: EmailBlock | null;
  pageStyle: PageStyle;
  compiledHtml: string;
  compact?: boolean;
  onAddBlock: (type: BlockType) => void;
  onUpdateBlock: (updated: EmailBlock) => void;
  onUpdatePageStyle: (updated: PageStyle) => void;
  onCopyHtml: () => void;
  onDownloadHtml: () => void;
  copiedRecently: boolean;
}

const BLOCK_ICONS: Record<BlockType, typeof Heading> = {
  header: Heading,
  text: AlignLeft,
  image: Image,
  button: MousePointerClick,
  callout: Info,
  kvTable: Table2,
  twoColumns: Columns2,
  divider: Minus,
  footer: Building2,
};

const TABS: { id: InspectorTab; label: string; icon: typeof SquareStack }[] = [
  { id: 'blocks', label: 'Blocks', icon: SquareStack },
  { id: 'properties', label: 'Properties', icon: SlidersHorizontal },
  { id: 'pageStyle', label: 'Page Style', icon: Palette },
  { id: 'code', label: 'Code', icon: Code2 },
];

export function InspectorRight({
  activeTab,
  onTabChange,
  selectedBlock,
  pageStyle,
  compiledHtml,
  compact = false,
  onAddBlock,
  onUpdateBlock,
  onUpdatePageStyle,
  onCopyHtml,
  onDownloadHtml,
  copiedRecently,
}: InspectorRightProps) {
  const htmlBytes = new TextEncoder().encode(compiledHtml).length;
  const htmlKb = (htmlBytes / 1024).toFixed(1);
  const lineCount = compiledHtml.split('\n').length;

  return (
    <aside
      aria-label="Panel Inspector dan Pustaka Blok"
      className={`w-full ${
        compact ? 'lg:w-[320px] xl:w-[332px]' : 'lg:w-[360px] xl:w-[380px]'
      } bg-white border-l border-slate-200 flex flex-col h-full shrink-0 overflow-hidden`}
    >
      {/* 4-Tab Segmented Bar */}
      <div
        role="tablist"
        aria-label="Tab Inspector"
        className="grid grid-cols-4 border-b border-slate-200 bg-slate-50/70 shrink-0"
      >
        {TABS.map(({ id, label, icon: Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onTabChange(id)}
              className={`flex flex-col items-center justify-center gap-1 py-2.5 px-1 text-[11px] font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'border-emerald-600 text-slate-900 bg-white'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>{label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Body */}
      <div className="flex-1 overflow-y-auto studio-scroll p-4">
        {activeTab === 'blocks' && (
          <div>
            <div className="mb-3">
              <h2 className="text-xs font-bold text-slate-900">Pustaka Blok Konten</h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Klik untuk menambahkan ke bawah kanvas, atau tarik langsung ke posisi yang diinginkan.
              </p>
            </div>

            <div className="space-y-2">
              {BLOCK_CATALOG.map((item) => {
                const Icon = BLOCK_ICONS[item.type];
                return (
                  <button
                    key={item.type}
                    type="button"
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData(
                        'application/x-bungtemin-new-block',
                        item.type
                      );
                      e.dataTransfer.effectAllowed = 'copy';
                    }}
                    onClick={() => onAddBlock(item.type)}
                    className="w-full text-left p-2.5 rounded-lg border border-slate-200 bg-white hover:border-emerald-500 hover:bg-emerald-50/40 transition-colors flex items-center gap-3 group cursor-grab active:cursor-grabbing"
                  >
                    <div className="w-9 h-9 rounded-lg bg-slate-100 group-hover:bg-emerald-100 text-slate-700 group-hover:text-emerald-800 flex items-center justify-center shrink-0 transition-colors">
                      <Icon className="w-4 h-4" aria-hidden="true" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-slate-900 truncate">
                        {item.label}
                      </p>
                      <p className="text-[11px] text-slate-500 leading-snug line-clamp-2 mt-0.5">
                        {item.shortDesc}
                      </p>
                    </div>
                    <Plus
                      className="w-4 h-4 text-slate-400 group-hover:text-emerald-700 shrink-0"
                      aria-hidden="true"
                    />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'properties' && (
          <div>
            {selectedBlock ? (
              <BlockPropertiesForm
                block={selectedBlock}
                onChange={onUpdateBlock}
              />
            ) : (
              <div className="py-12 px-4 text-center">
                <p className="text-xs font-semibold text-slate-800 mb-1">
                  Belum Ada Blok Dipilih
                </p>
                <p className="text-xs text-slate-500 leading-relaxed mb-4">
                  Klik salah satu blok pada kanvas di tengah untuk mengubah isi, warna, tipografi, dan jaraknya.
                </p>
                <button
                  type="button"
                  onClick={() => onTabChange('blocks')}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  Buka Pustaka Blocks
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'pageStyle' && (
          <div className="space-y-4">
            <div className="pb-2.5 border-b border-slate-100">
              <h2 className="text-xs font-bold text-slate-900">Gaya Halaman Global</h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Atur lebar kontainer, warna dasar email, dan jenis huruf standar.
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label
                  htmlFor="page-width-range"
                  className="text-xs font-semibold text-slate-700"
                >
                  Lebar Kontainer Email
                </label>
                <span className="text-xs font-mono tabular-nums text-slate-600">
                  {pageStyle.containerWidth}px
                </span>
              </div>
              <input
                id="page-width-range"
                type="range"
                min={480}
                max={700}
                step={10}
                value={pageStyle.containerWidth}
                onChange={(e) =>
                  onUpdatePageStyle({
                    ...pageStyle,
                    containerWidth: Number(e.target.value),
                  })
                }
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Standar email client adalah 600px.
              </p>
            </div>

            <div>
              <label
                htmlFor="page-outer-bg"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                Background Luar (Canvas Email)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  aria-label="Pilih warna background luar"
                  value={pageStyle.outerBgColor}
                  onChange={(e) =>
                    onUpdatePageStyle({
                      ...pageStyle,
                      outerBgColor: e.target.value,
                    })
                  }
                  className="w-8 h-8 rounded-md border border-slate-200 p-0.5 cursor-pointer bg-white"
                />
                <input
                  id="page-outer-bg"
                  type="text"
                  value={pageStyle.outerBgColor}
                  onChange={(e) =>
                    onUpdatePageStyle({
                      ...pageStyle,
                      outerBgColor: e.target.value,
                    })
                  }
                  className="flex-1 px-2.5 py-1.5 text-xs font-mono border border-slate-200 rounded-md focus:border-slate-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="page-content-bg"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                Background Konten Utama
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  aria-label="Pilih warna background konten"
                  value={pageStyle.contentBgColor}
                  onChange={(e) =>
                    onUpdatePageStyle({
                      ...pageStyle,
                      contentBgColor: e.target.value,
                    })
                  }
                  className="w-8 h-8 rounded-md border border-slate-200 p-0.5 cursor-pointer bg-white"
                />
                <input
                  id="page-content-bg"
                  type="text"
                  value={pageStyle.contentBgColor}
                  onChange={(e) =>
                    onUpdatePageStyle({
                      ...pageStyle,
                      contentBgColor: e.target.value,
                    })
                  }
                  className="flex-1 px-2.5 py-1.5 text-xs font-mono border border-slate-200 rounded-md focus:border-slate-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="page-font-family"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                Font Family (Email-Safe)
              </label>
              <select
                id="page-font-family"
                value={pageStyle.fontFamily}
                onChange={(e) =>
                  onUpdatePageStyle({
                    ...pageStyle,
                    fontFamily: e.target.value,
                  })
                }
                className="w-full px-2.5 py-2 text-xs border border-slate-200 rounded-md bg-white focus:border-slate-500 outline-none"
              >
                {FONT_FAMILY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label
                  htmlFor="page-radius-range"
                  className="text-xs font-semibold text-slate-700"
                >
                  Sudut Kontainer
                </label>
                <span className="text-xs font-mono tabular-nums text-slate-600">
                  {pageStyle.containerRadius}px
                </span>
              </div>
              <input
                id="page-radius-range"
                type="range"
                min={0}
                max={20}
                step={2}
                value={pageStyle.containerRadius}
                onChange={(e) =>
                  onUpdatePageStyle({
                    ...pageStyle,
                    containerRadius: Number(e.target.value),
                  })
                }
                className="w-full accent-emerald-600 cursor-pointer"
              />
            </div>
          </div>
        )}

        {activeTab === 'code' && (
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-xs font-bold text-slate-900">
                  Live HTML Output
                </h2>
                <p className="text-[11px] font-mono tabular-nums text-slate-500 mt-0.5">
                  {lineCount} baris · {htmlKb} KB
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={onDownloadHtml}
                  aria-label="Unduh file HTML dari tab kode"
                  className="p-1.5 text-slate-600 hover:text-slate-900 border border-slate-200 rounded-md hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={onCopyHtml}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md transition-colors cursor-pointer whitespace-nowrap"
                >
                  {copiedRecently ? (
                    <Check className="w-3.5 h-3.5" aria-hidden="true" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                  )}
                  <span>{copiedRecently ? 'Disalin' : 'Salin HTML'}</span>
                </button>
              </div>
            </div>

            <div className="mt-3 flex-1 min-h-[340px] rounded-lg bg-slate-900 border border-slate-800 overflow-hidden flex flex-col">
              <pre
                data-testid="live-html-code"
                className="p-3 text-[11px] leading-relaxed font-mono text-slate-200 overflow-auto studio-scroll flex-1 whitespace-pre"
              >
                <code>{compiledHtml}</code>
              </pre>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
