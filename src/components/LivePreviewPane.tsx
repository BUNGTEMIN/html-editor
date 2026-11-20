import { useEffect, useRef, useState } from 'react';
import { Eye, Monitor, Smartphone, X } from 'lucide-react';
import type { PreviewMode } from '../types/email';

interface LivePreviewPaneProps {
  compiledHtml: string;
  previewMode: PreviewMode;
  onPreviewModeChange: (mode: PreviewMode) => void;
  onClose: () => void;
}

const DESKTOP_IFRAME_WIDTH = 640;
const MOBILE_IFRAME_WIDTH = 375;

export function LivePreviewPane({
  compiledHtml,
  previewMode,
  onPreviewModeChange,
  onClose,
}: LivePreviewPaneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [availableWidth, setAvailableWidth] = useState<number>(660);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;

    const update = () => {
      // Subtract horizontal padding (32px total)
      setAvailableWidth(Math.max(280, el.clientWidth - 32));
    };
    update();

    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const targetWidth =
    previewMode === 'mobile' ? MOBILE_IFRAME_WIDTH : DESKTOP_IFRAME_WIDTH;
  const scale =
    availableWidth < targetWidth ? availableWidth / targetWidth : 1;

  return (
    <section
      aria-label="Live Preview HTML Iframe"
      data-testid="live-preview-pane"
      className="flex-1 min-w-0 h-full bg-slate-100 border-l border-slate-200 flex flex-col overflow-hidden"
    >
      {/* Pane Header */}
      <div className="h-11 px-3.5 bg-white border-b border-slate-200 flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <Eye className="w-3.5 h-3.5 text-emerald-600 shrink-0" aria-hidden="true" />
          <h2 className="text-xs font-bold text-slate-900 whitespace-nowrap truncate">
            Live Preview HTML
          </h2>
          <span className="text-[11px] text-slate-400 hidden sm:inline" aria-hidden="true">
            ·
          </span>
          <span className="text-[11px] font-mono tabular-nums text-slate-500 hidden sm:inline whitespace-nowrap">
            {previewMode === 'mobile' ? '375px' : '640px'} iframe
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <div
            role="group"
            aria-label="Ukuran Live Preview Iframe"
            className="flex items-center bg-slate-100 p-0.5 rounded-md border border-slate-200"
          >
            <button
              type="button"
              onClick={() => onPreviewModeChange('desktop')}
              aria-label="Live Preview Desktop"
              aria-pressed={previewMode === 'desktop'}
              className={`p-1 rounded transition-colors cursor-pointer ${
                previewMode === 'desktop'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => onPreviewModeChange('mobile')}
              aria-label="Live Preview Mobile"
              aria-pressed={previewMode === 'mobile'}
              className={`p-1 rounded transition-colors cursor-pointer ${
                previewMode === 'mobile'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup Live Preview"
            title="Tutup panel Live Preview"
            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Iframe Viewport Container */}
      <div
        ref={containerRef}
        className="flex-1 min-h-0 overflow-hidden p-4 flex justify-center studio-canvas-bg"
      >
        <div
          style={{
            width: `${Math.round(targetWidth * scale)}px`,
            height: '100%',
          }}
          className="relative overflow-hidden rounded-xl border border-slate-300/90 bg-white shadow-sm"
        >
          <iframe
            title="Live HTML Email Preview"
            data-testid="live-preview-iframe"
            srcDoc={compiledHtml}
            sandbox="allow-same-origin"
            style={{
              width: `${targetWidth}px`,
              height: `${100 / scale}%`,
              transform: scale < 1 ? `scale(${scale})` : undefined,
              transformOrigin: 'top left',
              border: 0,
              display: 'block',
            }}
          />
        </div>
      </div>
    </section>
  );
}
