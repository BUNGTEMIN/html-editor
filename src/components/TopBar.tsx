import {
  Check,
  Copy,
  Download,
  Eye,
  FileJson,
  LayoutTemplate,
  Mail,
  Monitor,
  Redo2,
  Smartphone,
  Undo2,
} from 'lucide-react';
import type { PreviewMode } from '../types/email';

interface TopBarProps {
  title: string;
  onTitleChange: (title: string) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  previewMode: PreviewMode;
  onPreviewModeChange: (mode: PreviewMode) => void;
  showLivePreview: boolean;
  onToggleLivePreview: () => void;
  onOpenTemplates: () => void;
  onOpenJson: () => void;
  onDownloadHtml: () => void;
  onCopyHtml: () => void;
  copiedRecently: boolean;
}

export function TopBar({
  title,
  onTitleChange,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  previewMode,
  onPreviewModeChange,
  showLivePreview,
  onToggleLivePreview,
  onOpenTemplates,
  onOpenJson,
  onDownloadHtml,
  onCopyHtml,
  copiedRecently,
}: TopBarProps) {
  return (
    <header className="h-14 bg-white border-b border-slate-200 px-3 lg:px-4 flex items-center justify-between gap-2.5 shrink-0 z-20">
      {/* Left: Brand & Document Title */}
      <div className="flex items-center gap-2.5 min-w-0 flex-1 max-w-xs xl:max-w-sm">
        <button
          type="button"
          onClick={onOpenTemplates}
          title="Kembali ke Halaman Kumpulan Template"
          aria-label="Kembali ke Halaman Kumpulan Template"
          className="flex items-center gap-2 shrink-0 rounded-lg py-0.5 pr-1 hover:opacity-85 transition-opacity cursor-pointer"
        >
          <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0">
            <Mail className="w-4 h-4" aria-hidden="true" />
          </div>
          <span className="font-bold text-sm tracking-tight text-slate-900 whitespace-nowrap shrink-0 hidden sm:inline">
            Bungtemin Mail Studio
          </span>
        </button>

        <span className="text-slate-300 hidden sm:inline shrink-0" aria-hidden="true">
          /
        </span>

        <label htmlFor="doc-title-input" className="sr-only">
          Judul Dokumen Email
        </label>
        <input
          id="doc-title-input"
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Judul dokumen email..."
          className="hidden sm:block min-w-0 flex-1 text-sm font-medium text-slate-800 bg-transparent border border-transparent hover:border-slate-200 focus:border-slate-400 focus:bg-slate-50 rounded-md px-2 py-1 outline-none transition-colors truncate"
        />
      </div>

      {/* Center: Undo/Redo, Preview Viewport Switcher & Live Preview Switch */}
      <div className="hidden md:flex items-center gap-2 shrink-0">
        <div className="flex items-center border border-slate-200 rounded-lg p-0.5 bg-slate-50">
          <button
            type="button"
            onClick={onUndo}
            disabled={!canUndo}
            aria-label="Undo perubahan terakhir"
            title="Undo (Ctrl+Z)"
            className="p-1.5 rounded-md text-slate-700 hover:bg-white hover:text-slate-900 disabled:opacity-35 disabled:hover:bg-transparent transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            <Undo2 className="w-4 h-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={onRedo}
            disabled={!canRedo}
            aria-label="Redo perubahan"
            title="Redo (Ctrl+Y)"
            className="p-1.5 rounded-md text-slate-700 hover:bg-white hover:text-slate-900 disabled:opacity-35 disabled:hover:bg-transparent transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            <Redo2 className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        <div
          role="group"
          aria-label="Mode Pratinjau"
          className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200"
        >
          <button
            type="button"
            onClick={() => onPreviewModeChange('desktop')}
            aria-pressed={previewMode === 'desktop'}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              previewMode === 'desktop'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" aria-hidden="true" />
            <span className="hidden 2xl:inline">Desktop 600px</span>
            <span className="2xl:hidden">600px</span>
          </button>
          <button
            type="button"
            onClick={() => onPreviewModeChange('mobile')}
            aria-pressed={previewMode === 'mobile'}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              previewMode === 'mobile'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" aria-hidden="true" />
            <span className="hidden 2xl:inline">Mobile 375px</span>
            <span className="2xl:hidden">375px</span>
          </button>
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={showLivePreview}
          onClick={onToggleLivePreview}
          className={`inline-flex items-center gap-2 px-2.5 py-1.5 text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            showLivePreview
              ? 'bg-emerald-50 border-emerald-500 text-emerald-900'
              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
          }`}
        >
          <Eye
            className={`w-3.5 h-3.5 shrink-0 ${
              showLivePreview ? 'text-emerald-600' : 'text-slate-500'
            }`}
            aria-hidden="true"
          />
          <span>Live Preview</span>
          <span
            aria-hidden="true"
            className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors ${
              showLivePreview ? 'bg-emerald-600' : 'bg-slate-300'
            }`}
          >
            <span
              className={`inline-block h-3 w-3 rounded-full bg-white shadow-2xs transition-transform ${
                showLivePreview ? 'translate-x-3.5' : 'translate-x-0.5'
              }`}
            />
          </span>
        </button>
      </div>

      {/* Right: Presets, JSON, Download & Primary Copy HTML CTA */}
      <div className="flex items-center gap-1.5 lg:gap-2 shrink-0">
        <button
          type="button"
          onClick={onOpenTemplates}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <LayoutTemplate className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
          <span className="hidden xl:inline">Template Preset</span>
          <span className="xl:hidden">Template</span>
        </button>

        <button
          type="button"
          onClick={onOpenJson}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          aria-label="Import atau Export JSON"
        >
          <FileJson className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
          <span className="hidden sm:inline">JSON</span>
        </button>

        <button
          type="button"
          onClick={onDownloadHtml}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          aria-label="Download file HTML"
        >
          <Download className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
          <span className="hidden lg:inline">Download .html</span>
        </button>

        <button
          type="button"
          onClick={onCopyHtml}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-xs"
        >
          {copiedRecently ? (
            <Check className="w-3.5 h-3.5" aria-hidden="true" />
          ) : (
            <Copy className="w-3.5 h-3.5" aria-hidden="true" />
          )}
          <span>{copiedRecently ? 'HTML Disalin' : 'Copy Script HTML'}</span>
        </button>
      </div>
    </header>
  );
}
