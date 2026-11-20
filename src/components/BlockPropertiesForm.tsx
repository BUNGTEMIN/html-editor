import { useRef, useState } from 'react';
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Italic,
  Plus,
  Trash2,
  Upload,
} from 'lucide-react';
import type {
  ColumnCardItem,
  EmailBlock,
  TextAlign,
} from '../types/email';
import {
  DEFAULT_GALLERY_IMAGES,
  generateId,
  getBlockLabel,
} from '../utils/blocks';

interface BlockPropertiesFormProps {
  block: EmailBlock;
  onChange: (updated: EmailBlock) => void;
}

function FieldLabel({
  htmlFor,
  children,
}: {
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-xs font-semibold text-slate-700 mb-1.5"
    >
      {children}
    </label>
  );
}

function ColorInput({
  id,
  label,
  value,
  allowTransparent,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  allowTransparent?: boolean;
  onChange: (val: string) => void;
}) {
  const isTransparent = value === 'transparent';
  const swatchValue = isTransparent ? '#FFFFFF' : value;

  return (
    <div>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <div className="flex items-center gap-2">
        <input
          type="color"
          aria-label={`Pilih warna ${label}`}
          value={/^#[0-9A-Fa-f]{6}$/.test(swatchValue) ? swatchValue : '#FFFFFF'}
          onChange={(e) => onChange(e.target.value)}
          className="w-8 h-8 rounded-md border border-slate-200 cursor-pointer shrink-0 p-0.5 bg-white"
        />
        <input
          id={id}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 min-w-0 px-2.5 py-1.5 text-xs font-mono border border-slate-200 rounded-md focus:border-slate-500 outline-none bg-white"
        />
        {allowTransparent && (
          <button
            type="button"
            onClick={() => onChange(isTransparent ? '#F8FAFC' : 'transparent')}
            className={`px-2 py-1.5 text-[11px] font-medium rounded-md border transition-colors cursor-pointer shrink-0 ${
              isTransparent
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            Transparan
          </button>
        )}
      </div>
    </div>
  );
}

function AlignControl({
  value,
  onChange,
}: {
  value: TextAlign;
  onChange: (align: TextAlign) => void;
}) {
  const options: { value: TextAlign; label: string; icon: typeof AlignLeft }[] = [
    { value: 'left', label: 'Rata Kiri', icon: AlignLeft },
    { value: 'center', label: 'Rata Tengah', icon: AlignCenter },
    { value: 'right', label: 'Rata Kanan', icon: AlignRight },
  ];

  return (
    <div>
      <span className="block text-xs font-semibold text-slate-700 mb-1.5">
        Perataan
      </span>
      <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200">
        {options.map(({ value: opt, label, icon: Icon }) => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            aria-label={label}
            aria-pressed={value === opt}
            className={`flex items-center justify-center gap-1 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              value === opt
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Icon className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{opt === 'left' ? 'Kiri' : opt === 'center' ? 'Tengah' : 'Kanan'}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function RangeField({
  id,
  label,
  value,
  min,
  max,
  step = 1,
  unit = 'px',
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (val: number) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label htmlFor={id} className="text-xs font-semibold text-slate-700">
          {label}
        </label>
        <span className="text-xs font-mono tabular-nums text-slate-500">
          {value}
          {unit}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-emerald-600 cursor-pointer"
      />
    </div>
  );
}

function uploadImageViaParent(file: File, dataUrl: string): Promise<{ ok: boolean; url?: string; error?: string }> {
  return new Promise((resolve) => {
    const target = window.parent && window.parent !== window ? window.parent : window.opener;
    if (!target) {
      resolve({ ok: false, error: 'standalone' });
      return;
    }
    const requestId = 'img_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
    let settled = false;
    const timer = window.setTimeout(() => {
      if (settled) return;
      settled = true;
      window.removeEventListener('message', onMsg);
      resolve({ ok: false, error: 'Waktu unggah ke NUDB habis.' });
    }, 35000);

    function onMsg(ev: MessageEvent) {
      const d = ev?.data;
      if (!d || typeof d !== 'object' || d.type !== 'BUNGTEMIN_UPLOAD_IMAGE_RESULT' || d.requestId !== requestId) {
        return;
      }
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      window.removeEventListener('message', onMsg);
      resolve({
        ok: Boolean(d.ok && d.url),
        url: typeof d.url === 'string' ? d.url : '',
        error: typeof d.error === 'string' ? d.error : undefined,
      });
    }

    window.addEventListener('message', onMsg);
    target.postMessage(
      {
        type: 'BUNGTEMIN_UPLOAD_IMAGE',
        requestId,
        filename: file.name || 'image.png',
        mimeType: file.type || 'image/png',
        dataUrl,
      },
      '*'
    );
  });
}

function ImageUploadRow({
  id,
  label,
  value,
  onChange,
  showGalleryPicks = false,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (url: string) => void;
  showGalleryPicks?: boolean;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadHint, setUploadHint] = useState<string | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadHint(null);
    const reader = new FileReader();
    reader.onload = async () => {
      if (typeof reader.result !== 'string') return;
      const dataUrl = reader.result;
      const isEmbedded = window.self !== window.top || Boolean(window.opener);
      if (isEmbedded) {
        setUploading(true);
        const res = await uploadImageViaParent(file, dataUrl);
        setUploading(false);
        if (res.ok && res.url) {
          onChange(res.url);
          setUploadHint('Terunggah ke NUDB');
          return;
        }
        setUploadHint(res.error ? `${res.error} (pakai Base64)` : 'Fallback ke Base64');
      }
      onChange(dataUrl);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  return (
    <div className="space-y-2">
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <div className="flex gap-1.5">
        <input
          id={id}
          type="text"
          value={value.startsWith('data:image/') ? '[Gambar Base64 Terunggah]' : value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://... atau unggah gambar"
          className="flex-1 min-w-0 px-2.5 py-1.5 text-xs border border-slate-200 rounded-md focus:border-slate-500 outline-none bg-white"
        />
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          aria-label={`Unggah file untuk ${label}`}
        />
        <button
          type="button"
          disabled={uploading}
          onClick={() => fileRef.current?.click()}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-60 rounded-md transition-colors cursor-pointer shrink-0"
        >
          <Upload className="w-3.5 h-3.5" aria-hidden="true" />
          <span>{uploading ? 'Mengunggah...' : 'Upload'}</span>
        </button>
      </div>
      {uploadHint && (
        <div className="text-[11px] text-emerald-700 font-medium">{uploadHint}</div>
      )}
      {value.startsWith('data:image/') && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="text-[11px] text-rose-600 hover:underline cursor-pointer"
        >
          Hapus gambar terunggah
        </button>
      )}
      {showGalleryPicks && (
        <div className="pt-1">
          <span className="block text-[11px] text-slate-500 mb-1.5">
            Atau pilih foto bawaan studio:
          </span>
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { label: 'Auditorium', src: DEFAULT_GALLERY_IMAGES.heroAuditorium },
              { label: 'Lokakarya', src: DEFAULT_GALLERY_IMAGES.workshopTable },
              { label: 'Atrium', src: DEFAULT_GALLERY_IMAGES.civicAtrium },
            ].map((img) => (
              <button
                key={img.label}
                type="button"
                onClick={() => onChange(img.src)}
                className={`text-[11px] py-1 px-1.5 rounded border text-center transition-colors cursor-pointer ${
                  value === img.src
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800 font-semibold'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                {img.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function BlockPropertiesForm({
  block,
  onChange,
}: BlockPropertiesFormProps) {
  const [activeColTab, setActiveColTab] = useState<'left' | 'right'>('left');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function wrapSelectedText(marker: '**' | '*') {
    if (block.type !== 'text') return;
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = block.content.slice(start, end) || 'teks';
    const nextContent =
      block.content.slice(0, start) +
      `${marker}${selected}${marker}` +
      block.content.slice(end);
    onChange({ ...block, content: nextContent });
  }

  return (
    <div className="space-y-4">
      <div className="pb-2.5 border-b border-slate-100">
        <h3 className="text-xs font-bold text-slate-900">
          Pengaturan: {getBlockLabel(block.type)}
        </h3>
        <p className="text-[11px] text-slate-500 mt-0.5">
          Perubahan langsung terlihat pada kanvas dan kode HTML.
        </p>
      </div>

      {block.type === 'header' && (
        <div className="space-y-3.5">
          <div>
            <FieldLabel htmlFor="prop-header-subtitle">Sub-judul Organisasi</FieldLabel>
            <input
              id="prop-header-subtitle"
              type="text"
              value={block.orgSubtitle}
              onChange={(e) => onChange({ ...block, orgSubtitle: e.target.value })}
              className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md focus:border-slate-500 outline-none"
            />
          </div>
          <div>
            <FieldLabel htmlFor="prop-header-title">Judul Utama</FieldLabel>
            <textarea
              id="prop-header-title"
              rows={2}
              value={block.title}
              onChange={(e) => onChange({ ...block, title: e.target.value })}
              className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md focus:border-slate-500 outline-none resize-y"
            />
          </div>
          <div>
            <FieldLabel htmlFor="prop-header-badge">Badge Kategori (opsional)</FieldLabel>
            <input
              id="prop-header-badge"
              type="text"
              value={block.categoryBadge}
              onChange={(e) => onChange({ ...block, categoryBadge: e.target.value })}
              placeholder="Contoh: Pengumuman Resmi"
              className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md focus:border-slate-500 outline-none"
            />
          </div>
          <ImageUploadRow
            id="prop-header-logo"
            label="Logo Organisasi (opsional)"
            value={block.logoUrl}
            onChange={(url) => onChange({ ...block, logoUrl: url })}
          />
          <div>
            <span className="block text-xs font-semibold text-slate-700 mb-1.5">
              Jenis Latar Header
            </span>
            <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200">
              {(['solid', 'gradient'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => onChange({ ...block, bgType: mode })}
                  className={`py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                    block.bgType === mode
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {mode === 'solid' ? 'Warna Solid' : 'Gradasi'}
                </button>
              ))}
            </div>
          </div>
          <ColorInput
            id="prop-header-bg"
            label={block.bgType === 'gradient' ? 'Warna Awal Latar' : 'Warna Latar'}
            value={block.bgColor}
            onChange={(val) => onChange({ ...block, bgColor: val })}
          />
          {block.bgType === 'gradient' && (
            <ColorInput
              id="prop-header-bg-end"
              label="Warna Akhir Gradasi"
              value={block.gradientEndColor}
              onChange={(val) => onChange({ ...block, gradientEndColor: val })}
            />
          )}
          <ColorInput
            id="prop-header-text"
            label="Warna Teks"
            value={block.textColor}
            onChange={(val) => onChange({ ...block, textColor: val })}
          />
          <AlignControl
            value={block.align}
            onChange={(align) => onChange({ ...block, align })}
          />
          <RangeField
            id="prop-header-pad"
            label="Padding Atas & Bawah"
            value={block.paddingY}
            min={16}
            max={64}
            onChange={(paddingY) => onChange({ ...block, paddingY })}
          />
        </div>
      )}

      {block.type === 'text' && (
        <div className="space-y-3.5">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <FieldLabel htmlFor="prop-text-content">Isi Paragraf</FieldLabel>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => wrapSelectedText('**')}
                  title="Tebalkan teks terpilih (**teks**)"
                  aria-label="Sisipkan format tebal"
                  className="px-1.5 py-1 text-xs border border-slate-200 rounded hover:bg-slate-100 cursor-pointer"
                >
                  <Bold className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => wrapSelectedText('*')}
                  title="Miringkan teks terpilih (*teks*)"
                  aria-label="Sisipkan format miring"
                  className="px-1.5 py-1 text-xs border border-slate-200 rounded hover:bg-slate-100 cursor-pointer"
                >
                  <Italic className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>
            </div>
            <textarea
              ref={textareaRef}
              id="prop-text-content"
              rows={6}
              value={block.content}
              onChange={(e) => onChange({ ...block, content: e.target.value })}
              className="w-full px-2.5 py-2 text-xs leading-relaxed border border-slate-200 rounded-md focus:border-slate-500 outline-none resize-y"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Gunakan **tebal** dan *miring* untuk sorotan kata di dalam paragraf.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onChange({ ...block, isBold: !block.isBold })}
              aria-pressed={block.isBold}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md border transition-colors cursor-pointer ${
                block.isBold
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              Semua Tebal
            </button>
            <button
              type="button"
              onClick={() => onChange({ ...block, isItalic: !block.isItalic })}
              aria-pressed={block.isItalic}
              className={`flex-1 py-1.5 text-xs italic font-medium rounded-md border transition-colors cursor-pointer ${
                block.isItalic
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              Semua Miring
            </button>
          </div>

          <AlignControl
            value={block.align}
            onChange={(align) => onChange({ ...block, align })}
          />
          <RangeField
            id="prop-text-size"
            label="Ukuran Font"
            value={block.fontSize}
            min={12}
            max={24}
            onChange={(fontSize) => onChange({ ...block, fontSize })}
          />
          <ColorInput
            id="prop-text-color"
            label="Warna Teks"
            value={block.textColor}
            onChange={(textColor) => onChange({ ...block, textColor })}
          />
          <ColorInput
            id="prop-text-bg"
            label="Latar Belakang Blok"
            value={block.bgColor}
            allowTransparent
            onChange={(bgColor) => onChange({ ...block, bgColor })}
          />
          <RangeField
            id="prop-text-py"
            label="Padding Atas & Bawah"
            value={block.paddingY}
            min={4}
            max={48}
            onChange={(paddingY) => onChange({ ...block, paddingY })}
          />
        </div>
      )}

      {block.type === 'image' && (
        <div className="space-y-3.5">
          <ImageUploadRow
            id="prop-img-src"
            label="URL Gambar / Unggah File"
            value={block.src}
            onChange={(src) => onChange({ ...block, src })}
            showGalleryPicks
          />
          <div>
            <FieldLabel htmlFor="prop-img-alt">Teks Alternatif (Alt)</FieldLabel>
            <input
              id="prop-img-alt"
              type="text"
              value={block.alt}
              onChange={(e) => onChange({ ...block, alt: e.target.value })}
              className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md focus:border-slate-500 outline-none"
            />
          </div>
          <div>
            <FieldLabel htmlFor="prop-img-caption">Keterangan / Caption</FieldLabel>
            <input
              id="prop-img-caption"
              type="text"
              value={block.caption}
              onChange={(e) => onChange({ ...block, caption: e.target.value })}
              className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md focus:border-slate-500 outline-none"
            />
          </div>
          <div>
            <FieldLabel htmlFor="prop-img-link">Tautan Klik (opsional)</FieldLabel>
            <input
              id="prop-img-link"
              type="url"
              value={block.linkUrl}
              onChange={(e) => onChange({ ...block, linkUrl: e.target.value })}
              placeholder="https://..."
              className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md focus:border-slate-500 outline-none"
            />
          </div>
          <RangeField
            id="prop-img-width"
            label="Lebar Gambar"
            value={block.widthPercent}
            min={30}
            max={100}
            unit="%"
            onChange={(widthPercent) => onChange({ ...block, widthPercent })}
          />
          <RangeField
            id="prop-img-radius"
            label="Sudut Bulat (Border Radius)"
            value={block.borderRadius}
            min={0}
            max={24}
            onChange={(borderRadius) => onChange({ ...block, borderRadius })}
          />
          <AlignControl
            value={block.align}
            onChange={(align) => onChange({ ...block, align })}
          />
          <RangeField
            id="prop-img-py"
            label="Padding Atas & Bawah"
            value={block.paddingY}
            min={4}
            max={48}
            onChange={(paddingY) => onChange({ ...block, paddingY })}
          />
        </div>
      )}

      {block.type === 'button' && (
        <div className="space-y-3.5">
          <div>
            <FieldLabel htmlFor="prop-btn-label">Teks Tombol</FieldLabel>
            <input
              id="prop-btn-label"
              type="text"
              value={block.label}
              onChange={(e) => onChange({ ...block, label: e.target.value })}
              className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md focus:border-slate-500 outline-none"
            />
          </div>
          <div>
            <FieldLabel htmlFor="prop-btn-url">URL Tujuan</FieldLabel>
            <input
              id="prop-btn-url"
              type="url"
              value={block.url}
              onChange={(e) => onChange({ ...block, url: e.target.value })}
              className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md focus:border-slate-500 outline-none"
            />
          </div>
          <ColorInput
            id="prop-btn-color"
            label="Warna Tombol"
            value={block.buttonColor}
            onChange={(buttonColor) => onChange({ ...block, buttonColor })}
          />
          <ColorInput
            id="prop-btn-text"
            label="Warna Teks Tombol"
            value={block.textColor}
            onChange={(textColor) => onChange({ ...block, textColor })}
          />
          <RangeField
            id="prop-btn-radius"
            label="Sudut Bulat"
            value={block.borderRadius}
            min={0}
            max={32}
            onChange={(borderRadius) => onChange({ ...block, borderRadius })}
          />
          <AlignControl
            value={block.align}
            onChange={(align) => onChange({ ...block, align })}
          />
          <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={block.fullWidth}
              onChange={(e) => onChange({ ...block, fullWidth: e.target.checked })}
              className="rounded accent-emerald-600"
            />
            <span>Lebar penuh (Full Width)</span>
          </label>
          <RangeField
            id="prop-btn-py"
            label="Padding Atas & Bawah"
            value={block.paddingY}
            min={8}
            max={48}
            onChange={(paddingY) => onChange({ ...block, paddingY })}
          />
        </div>
      )}

      {block.type === 'callout' && (
        <div className="space-y-3.5">
          <div>
            <FieldLabel htmlFor="prop-callout-title">Judul Kotak</FieldLabel>
            <input
              id="prop-callout-title"
              type="text"
              value={block.title}
              onChange={(e) => onChange({ ...block, title: e.target.value })}
              className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md focus:border-slate-500 outline-none"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-slate-700">
                Daftar Poin Bullet
              </span>
              <button
                type="button"
                onClick={() =>
                  onChange({
                    ...block,
                    items: [...block.items, 'Poin informasi baru'],
                  })
                }
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:underline cursor-pointer"
              >
                <Plus className="w-3 h-3" aria-hidden="true" />
                <span>Tambah Poin</span>
              </button>
            </div>
            <div className="space-y-2">
              {block.items.map((item, idx) => (
                <div key={idx} className="flex items-start gap-1.5">
                  <textarea
                    rows={2}
                    aria-label={`Poin ${idx + 1}`}
                    value={item}
                    onChange={(e) => {
                      const next = [...block.items];
                      next[idx] = e.target.value;
                      onChange({ ...block, items: next });
                    }}
                    className="flex-1 px-2 py-1.5 text-xs border border-slate-200 rounded-md focus:border-slate-500 outline-none resize-y"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      onChange({
                        ...block,
                        items: block.items.filter((_, i) => i !== idx),
                      })
                    }
                    aria-label={`Hapus poin ${idx + 1}`}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </div>
              ))}
            </div>
          </div>
          <ColorInput
            id="prop-callout-accent"
            label="Warna Garis Aksen Kiri"
            value={block.accentColor}
            onChange={(accentColor) => onChange({ ...block, accentColor })}
          />
          <ColorInput
            id="prop-callout-boxbg"
            label="Warna Latar Kotak"
            value={block.boxBgColor}
            onChange={(boxBgColor) => onChange({ ...block, boxBgColor })}
          />
          <ColorInput
            id="prop-callout-text"
            label="Warna Teks"
            value={block.textColor}
            onChange={(textColor) => onChange({ ...block, textColor })}
          />
          <RangeField
            id="prop-callout-py"
            label="Padding Atas & Bawah"
            value={block.paddingY}
            min={8}
            max={40}
            onChange={(paddingY) => onChange({ ...block, paddingY })}
          />
        </div>
      )}

      {block.type === 'kvTable' && (
        <div className="space-y-3.5">
          <div>
            <FieldLabel htmlFor="prop-kv-title">Judul Tabel (opsional)</FieldLabel>
            <input
              id="prop-kv-title"
              type="text"
              value={block.title}
              onChange={(e) => onChange({ ...block, title: e.target.value })}
              className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md focus:border-slate-500 outline-none"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-slate-700">
                Baris Informasi
              </span>
              <button
                type="button"
                onClick={() =>
                  onChange({
                    ...block,
                    rows: [
                      ...block.rows,
                      { id: generateId('row'), key: 'Label Baru', value: 'Isi keterangan' },
                    ],
                  })
                }
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:underline cursor-pointer"
              >
                <Plus className="w-3 h-3" aria-hidden="true" />
                <span>Tambah Baris</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {block.rows.map((row, idx) => (
                <div
                  key={row.id}
                  className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5"
                >
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      aria-label={`Label baris ${idx + 1}`}
                      value={row.key}
                      onChange={(e) => {
                        const next = block.rows.map((r) =>
                          r.id === row.id ? { ...r, key: e.target.value } : r
                        );
                        onChange({ ...block, rows: next });
                      }}
                      placeholder="Contoh: Hari / Tanggal"
                      className="flex-1 px-2 py-1 text-xs font-semibold bg-white border border-slate-200 rounded focus:border-slate-500 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        onChange({
                          ...block,
                          rows: block.rows.filter((r) => r.id !== row.id),
                        })
                      }
                      aria-label={`Hapus baris ${row.key || idx + 1}`}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  </div>
                  <input
                    type="text"
                    aria-label={`Nilai baris ${idx + 1}`}
                    value={row.value}
                    onChange={(e) => {
                      const next = block.rows.map((r) =>
                        r.id === row.id ? { ...r, value: e.target.value } : r
                      );
                      onChange({ ...block, rows: next });
                    }}
                    placeholder="Isi nilai..."
                    className="w-full px-2 py-1 text-xs bg-white border border-slate-200 rounded focus:border-slate-500 outline-none"
                  />
                </div>
              ))}
            </div>
          </div>

          <ColorInput
            id="prop-kv-labelcolor"
            label="Warna Teks Label"
            value={block.labelColor}
            onChange={(labelColor) => onChange({ ...block, labelColor })}
          />
          <ColorInput
            id="prop-kv-stripe"
            label="Warna Baris Selang-seling"
            value={block.stripeBgColor}
            onChange={(stripeBgColor) => onChange({ ...block, stripeBgColor })}
          />
          <ColorInput
            id="prop-kv-border"
            label="Warna Garis Tabel"
            value={block.borderColor}
            onChange={(borderColor) => onChange({ ...block, borderColor })}
          />
          <RangeField
            id="prop-kv-py"
            label="Padding Atas & Bawah"
            value={block.paddingY}
            min={8}
            max={40}
            onChange={(paddingY) => onChange({ ...block, paddingY })}
          />
        </div>
      )}

      {block.type === 'twoColumns' && (
        <div className="space-y-3.5">
          <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200">
            {(['left', 'right'] as const).map((side) => (
              <button
                key={side}
                type="button"
                onClick={() => setActiveColTab(side)}
                className={`py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  activeColTab === side
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {side === 'left' ? 'Kolom Kiri' : 'Kolom Kanan'}
              </button>
            ))}
          </div>

          {(() => {
            const current: ColumnCardItem = block[activeColTab];
            const updateCol = (patch: Partial<ColumnCardItem>) =>
              onChange({
                ...block,
                [activeColTab]: { ...current, ...patch },
              });
            return (
              <div className="space-y-3">
                <ImageUploadRow
                  id={`prop-col-${activeColTab}-img`}
                  label="Gambar Kartu (opsional)"
                  value={current.imageUrl}
                  onChange={(imageUrl) => updateCol({ imageUrl })}
                  showGalleryPicks
                />
                <div>
                  <FieldLabel htmlFor={`prop-col-${activeColTab}-title`}>
                    Judul Kartu
                  </FieldLabel>
                  <input
                    id={`prop-col-${activeColTab}-title`}
                    type="text"
                    value={current.title}
                    onChange={(e) => updateCol({ title: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md focus:border-slate-500 outline-none"
                  />
                </div>
                <div>
                  <FieldLabel htmlFor={`prop-col-${activeColTab}-body`}>
                    Deskripsi Ringkas
                  </FieldLabel>
                  <textarea
                    id={`prop-col-${activeColTab}-body`}
                    rows={3}
                    value={current.body}
                    onChange={(e) => updateCol({ body: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md focus:border-slate-500 outline-none resize-y"
                  />
                </div>
                <div>
                  <FieldLabel htmlFor={`prop-col-${activeColTab}-linktext`}>
                    Teks Tautan
                  </FieldLabel>
                  <input
                    id={`prop-col-${activeColTab}-linktext`}
                    type="text"
                    value={current.linkText}
                    onChange={(e) => updateCol({ linkText: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md focus:border-slate-500 outline-none"
                  />
                </div>
                <div>
                  <FieldLabel htmlFor={`prop-col-${activeColTab}-linkurl`}>
                    URL Tautan
                  </FieldLabel>
                  <input
                    id={`prop-col-${activeColTab}-linkurl`}
                    type="url"
                    value={current.linkUrl}
                    onChange={(e) => updateCol({ linkUrl: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md focus:border-slate-500 outline-none"
                  />
                </div>
              </div>
            );
          })()}

          <div className="pt-2 border-t border-slate-100 space-y-3">
            <ColorInput
              id="prop-col-cardbg"
              label="Latar Kartu"
              value={block.cardBgColor}
              onChange={(cardBgColor) => onChange({ ...block, cardBgColor })}
            />
            <ColorInput
              id="prop-col-accent"
              label="Warna Tautan"
              value={block.accentColor}
              onChange={(accentColor) => onChange({ ...block, accentColor })}
            />
            <RangeField
              id="prop-col-py"
              label="Padding Atas & Bawah"
              value={block.paddingY}
              min={8}
              max={40}
              onChange={(paddingY) => onChange({ ...block, paddingY })}
            />
          </div>
        </div>
      )}

      {block.type === 'divider' && (
        <div className="space-y-3.5">
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={block.showLine}
              onChange={(e) => onChange({ ...block, showLine: e.target.checked })}
              className="rounded accent-emerald-600"
            />
            <span>Tampilkan garis pemisah (jika mati, jadi spacer kosong)</span>
          </label>
          <RangeField
            id="prop-div-height"
            label="Tinggi Ruang Vertikal"
            value={block.spacerHeight}
            min={8}
            max={64}
            onChange={(spacerHeight) => onChange({ ...block, spacerHeight })}
          />
          {block.showLine && (
            <>
              <ColorInput
                id="prop-div-color"
                label="Warna Garis"
                value={block.lineColor}
                onChange={(lineColor) => onChange({ ...block, lineColor })}
              />
              <RangeField
                id="prop-div-thickness"
                label="Ketebalan Garis"
                value={block.lineThickness}
                min={1}
                max={4}
                onChange={(lineThickness) => onChange({ ...block, lineThickness })}
              />
              <div>
                <FieldLabel htmlFor="prop-div-style">Gaya Garis</FieldLabel>
                <select
                  id="prop-div-style"
                  value={block.lineStyle}
                  onChange={(e) =>
                    onChange({
                      ...block,
                      lineStyle: e.target.value as 'solid' | 'dashed' | 'dotted',
                    })
                  }
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md bg-white focus:border-slate-500 outline-none"
                >
                  <option value="solid">Garis Penuh (Solid)</option>
                  <option value="dashed">Garis Putus-putus (Dashed)</option>
                  <option value="dotted">Titik-titik (Dotted)</option>
                </select>
              </div>
            </>
          )}
        </div>
      )}

      {block.type === 'footer' && (
        <div className="space-y-3.5">
          <div>
            <FieldLabel htmlFor="prop-footer-org">Nama Organisasi</FieldLabel>
            <input
              id="prop-footer-org"
              type="text"
              value={block.orgName}
              onChange={(e) => onChange({ ...block, orgName: e.target.value })}
              className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md focus:border-slate-500 outline-none"
            />
          </div>
          <div>
            <FieldLabel htmlFor="prop-footer-addr">Alamat</FieldLabel>
            <input
              id="prop-footer-addr"
              type="text"
              value={block.address}
              onChange={(e) => onChange({ ...block, address: e.target.value })}
              className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md focus:border-slate-500 outline-none"
            />
          </div>
          <div>
            <FieldLabel htmlFor="prop-footer-contact">Kontak / Email / Telepon</FieldLabel>
            <input
              id="prop-footer-contact"
              type="text"
              value={block.contact}
              onChange={(e) => onChange({ ...block, contact: e.target.value })}
              className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md focus:border-slate-500 outline-none"
            />
          </div>
          <div>
            <FieldLabel htmlFor="prop-footer-copy">Catatan Hak Cipta</FieldLabel>
            <input
              id="prop-footer-copy"
              type="text"
              value={block.copyright}
              onChange={(e) => onChange({ ...block, copyright: e.target.value })}
              className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md focus:border-slate-500 outline-none"
            />
          </div>
          <ColorInput
            id="prop-footer-bg"
            label="Warna Latar Footer"
            value={block.bgColor}
            onChange={(bgColor) => onChange({ ...block, bgColor })}
          />
          <ColorInput
            id="prop-footer-text"
            label="Warna Teks"
            value={block.textColor}
            onChange={(textColor) => onChange({ ...block, textColor })}
          />
          <AlignControl
            value={block.align}
            onChange={(align) => onChange({ ...block, align })}
          />
          <RangeField
            id="prop-footer-py"
            label="Padding Atas & Bawah"
            value={block.paddingY}
            min={12}
            max={48}
            onChange={(paddingY) => onChange({ ...block, paddingY })}
          />
        </div>
      )}
    </div>
  );
}
