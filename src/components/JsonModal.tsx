import { useRef, useState } from 'react';
import { Check, Copy, Download, Upload, X } from 'lucide-react';
import type { EmailDocument } from '../types/email';
import { copyTextToClipboard, validateImportedDocument } from '../utils/blocks';

interface JsonModalProps {
  isOpen: boolean;
  doc: EmailDocument;
  onClose: () => void;
  onImportDocument: (doc: EmailDocument) => void;
}

export function JsonModal({
  isOpen,
  doc,
  onClose,
  onImportDocument,
}: JsonModalProps) {
  const [tab, setTab] = useState<'export' | 'import'>('export');
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [copiedJson, setCopiedJson] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const formattedJson = JSON.stringify(doc, null, 2);

  async function handleCopyJson() {
    const ok = await copyTextToClipboard(formattedJson);
    if (ok) {
      setCopiedJson(true);
      setTimeout(() => setCopiedJson(false), 1800);
    }
  }

  function handleDownloadJson() {
    const slug = doc.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    const blob = new Blob([formattedJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${slug || 'desain-email'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function processImportRaw(rawText: string) {
    setImportError(null);
    if (!rawText.trim()) {
      setImportError('Tempelkan kode JSON terlebih dahulu sebelum mengimpor.');
      return;
    }
    try {
      const parsed = JSON.parse(rawText);
      const result = validateImportedDocument(parsed);
      if (!result.ok) {
        setImportError(result.error);
        return;
      }
      onImportDocument(result.document);
      setImportText('');
      onClose();
    } catch {
      setImportError(
        'JSON tidak dapat dibaca. Pastikan format tanda kutip dan kurung kurawal valid.'
      );
    }
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setImportText(reader.result);
        setImportError(null);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="json-modal-title"
      className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-[2px] flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-xl border border-slate-200 shadow-xl w-full max-w-2xl max-h-[86vh] flex flex-col overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2
              id="json-modal-title"
              className="text-base font-bold text-slate-900"
            >
              Import / Export Proyek JSON
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Simpan cadangan proyek dalam format JSON agar dapat diedit ulang di perangkat lain.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup modal JSON"
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <div className="px-6 pt-3 border-b border-slate-200 flex items-center gap-4">
          <button
            type="button"
            onClick={() => {
              setTab('export');
              setImportError(null);
            }}
            className={`pb-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              tab === 'export'
                ? 'border-emerald-600 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Export JSON
          </button>
          <button
            type="button"
            onClick={() => setTab('import')}
            className={`pb-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              tab === 'import'
                ? 'border-emerald-600 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Import JSON
          </button>
        </div>

        <div className="p-6 overflow-y-auto studio-scroll flex-1">
          {tab === 'export' ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs text-slate-600">
                  Berisi seluruh pengaturan halaman dan {doc.blocks.length} blok konten aktif.
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyJson}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg cursor-pointer"
                  >
                    {copiedJson ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                    )}
                    <span>{copiedJson ? 'JSON Disalin' : 'Salin JSON'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadJson}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Download .json</span>
                  </button>
                </div>
              </div>
              <pre className="p-3.5 rounded-lg bg-slate-900 text-slate-200 font-mono text-[11px] leading-relaxed max-h-72 overflow-auto studio-scroll">
                <code>{formattedJson}</code>
              </pre>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <label
                  htmlFor="json-import-textarea"
                  className="text-xs font-semibold text-slate-700"
                >
                  Tempelkan isi JSON atau unggah file .json
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/json,.json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Unggah File .json</span>
                </button>
              </div>

              <textarea
                id="json-import-textarea"
                rows={10}
                value={importText}
                onChange={(e) => {
                  setImportText(e.target.value);
                  if (importError) setImportError(null);
                }}
                placeholder='{"title": "Pengumuman", "pageStyle": {...}, "blocks": [...]}'
                className="w-full p-3 font-mono text-xs border border-slate-200 rounded-lg focus:border-slate-500 outline-none resize-y"
              />

              {importError && (
                <p
                  role="alert"
                  className="text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2"
                >
                  {importError}
                </p>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => processImportRaw(importText)}
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg cursor-pointer"
                >
                  Muat Desain JSON
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
