import { ArrowRight, X } from 'lucide-react';
import { TEMPLATE_PRESETS } from '../utils/templates';

interface TemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (templateId: string) => void;
}

export function TemplateModal({
  isOpen,
  onClose,
  onSelectTemplate,
}: TemplateModalProps) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="template-modal-title"
      className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-[2px] flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-xl border border-slate-200 shadow-xl w-full max-w-3xl max-h-[88vh] flex flex-col overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-4">
          <div>
            <h2
              id="template-modal-title"
              className="text-base font-bold text-slate-900"
            >
              Pilih Template Preset Siap Pakai
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Muat struktur email profesional dalam 1 klik. Anda tetap dapat mengedit seluruh blok setelah dimuat.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup modal template"
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto studio-scroll grid grid-cols-1 sm:grid-cols-2 gap-4">
          {TEMPLATE_PRESETS.map((preset) => (
            <div
              key={preset.id}
              className="border border-slate-200 rounded-xl overflow-hidden flex flex-col bg-white hover:border-slate-300 transition-colors"
            >
              {/* Mini wireframe thumbnail */}
              <div
                className="h-28 p-4 flex flex-col justify-between border-b border-slate-100"
                style={{ backgroundColor: preset.document.pageStyle.outerBgColor }}
              >
                <div className="bg-white rounded-md border border-slate-200/80 shadow-2xs overflow-hidden h-full flex flex-col">
                  {preset.document.blocks.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center text-[11px] text-slate-400 border border-dashed border-slate-200 m-2 rounded">
                      Kanvas Kosong
                    </div>
                  ) : (
                    <>
                      <div
                        className="h-7 px-2.5 flex items-center"
                        style={{ backgroundColor: preset.accentColor }}
                      >
                        <div className="w-24 h-1.5 rounded bg-white/80" />
                      </div>
                      <div className="p-2.5 space-y-1.5 flex-1">
                        <div className="w-4/5 h-1.5 rounded bg-slate-200" />
                        <div className="w-3/5 h-1.5 rounded bg-slate-200" />
                        <div className="pt-1 flex gap-1.5">
                          <div className="w-12 h-3 rounded bg-slate-100 border border-slate-200" />
                          <div
                            className="w-14 h-3 rounded opacity-80"
                            style={{ backgroundColor: preset.accentColor }}
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between gap-4">
                <div>
                  <div className="text-[11px] text-slate-500 mb-1">
                    {preset.category} · {preset.document.blocks.length} blok
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {preset.name}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed mt-1">
                    {preset.description}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onSelectTemplate(preset.id);
                    onClose();
                  }}
                  className="w-full inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-emerald-600 rounded-lg transition-colors cursor-pointer"
                >
                  <span>Gunakan Template</span>
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
