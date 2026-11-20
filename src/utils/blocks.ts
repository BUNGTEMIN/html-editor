import type { BlockType, EmailBlock, EmailDocument, PageStyle } from '../types/email';

const PUBLIC_ORIGIN =
  typeof window !== 'undefined' && /^https?:\/\//i.test(window.location.origin)
    ? window.location.origin
    : 'https://html-editor-sable.vercel.app';

export const DEFAULT_GALLERY_IMAGES = {
  heroAuditorium: `${PUBLIC_ORIGIN}/images/hero-banner.jpg`,
  workshopTable: `${PUBLIC_ORIGIN}/images/card-program.jpg`,
  civicAtrium: `${PUBLIC_ORIGIN}/images/card-community.jpg`,
} as const;

const LEGACY_ASSET_MAP: Record<string, string> = {
  '/src/assets/images/newsletter_hero_banner_1795191613405.jpg': DEFAULT_GALLERY_IMAGES.heroAuditorium,
  '/src/assets/images/newsletter_card_program_1795191614549.jpg': DEFAULT_GALLERY_IMAGES.workshopTable,
  '/src/assets/images/newsletter_card_community_1795191615366.jpg': DEFAULT_GALLERY_IMAGES.civicAtrium,
};

export const FONT_FAMILY_OPTIONS = [
  { label: 'Arial / Helvetica (Standar Email)', value: 'Arial, Helvetica, sans-serif' },
  { label: 'Segoe UI / System Sans', value: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif" },
  { label: 'Verdana / Geneva', value: 'Verdana, Geneva, sans-serif' },
  { label: 'Tahoma / Sans-Serif', value: 'Tahoma, Geneva, sans-serif' },
  { label: 'Georgia / Serif Editorial', value: "Georgia, 'Times New Roman', serif" },
];

export const DEFAULT_PAGE_STYLE: PageStyle = {
  containerWidth: 600,
  outerBgColor: '#F1F5F9',
  contentBgColor: '#FFFFFF',
  fontFamily: 'Arial, Helvetica, sans-serif',
  containerRadius: 12,
};

export interface BlockMeta {
  type: BlockType;
  label: string;
  shortDesc: string;
}

export const BLOCK_CATALOG: BlockMeta[] = [
  {
    type: 'header',
    label: 'Header Banner',
    shortDesc: 'Judul utama, sub-judul organisasi, badge & logo',
  },
  {
    type: 'text',
    label: 'Text / Paragraf',
    shortDesc: 'Paragraf dengan bold, italic, ukuran & perataan',
  },
  {
    type: 'image',
    label: 'Image / Poster',
    shortDesc: 'Gambar dari URL atau upload, caption & tautan',
  },
  {
    type: 'button',
    label: 'Button CTA',
    shortDesc: 'Tombol aksi klik dengan warna & radius kustom',
  },
  {
    type: 'callout',
    label: 'Callout / Info Box',
    shortDesc: 'Kotak sorotan beraksen kiri dengan poin bullet',
  },
  {
    type: 'kvTable',
    label: 'Key-Value Table',
    shortDesc: 'Tabel rapi Hari/Tanggal, Waktu, Tempat & PIC',
  },
  {
    type: 'twoColumns',
    label: '2 Columns',
    shortDesc: '2 kartu sejajar yang otomatis menumpuk di HP',
  },
  {
    type: 'divider',
    label: 'Divider & Spacer',
    shortDesc: 'Garis pemisah & pengatur ruang vertikal',
  },
  {
    type: 'footer',
    label: 'Footer Organisasi',
    shortDesc: 'Nama organisasi, alamat, kontak & hak cipta',
  },
];

export function getBlockLabel(type: BlockType): string {
  return BLOCK_CATALOG.find((b) => b.type === type)?.label ?? type;
}

let idCounter = 0;

export function generateId(prefix = 'blk'): string {
  idCounter += 1;
  return `${prefix}_${Date.now().toString(36)}_${idCounter.toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 6)}`;
}

export function createDefaultBlock(type: BlockType): EmailBlock {
  const id = generateId(type);
  switch (type) {
    case 'header':
      return {
        id,
        type: 'header',
        orgSubtitle: 'SEKRETARIAT ORGANISASI',
        title: 'Judul Pengumuman Utama',
        categoryBadge: 'Informasi Resmi',
        logoUrl: '',
        bgType: 'gradient',
        bgColor: '#0F2942',
        gradientEndColor: '#1E4E79',
        textColor: '#FFFFFF',
        align: 'left',
        paddingY: 32,
      };
    case 'text':
      return {
        id,
        type: 'text',
        content:
          'Yth. Bapak/Ibu Anggota,\n\nDengan hormat, kami sampaikan informasi terbaru terkait agenda kegiatan organisasi pada bulan ini. Mohon perhatikan **jadwal pelaksanaan** dan *ketentuan administrasi* yang berlaku.',
        align: 'left',
        fontSize: 15,
        lineHeight: 1.65,
        textColor: '#334155',
        bgColor: 'transparent',
        paddingY: 16,
        paddingX: 28,
        isBold: false,
        isItalic: false,
      };
    case 'image':
      return {
        id,
        type: 'image',
        src: DEFAULT_GALLERY_IMAGES.heroAuditorium,
        alt: 'Dokumentasi kegiatan organisasi',
        widthPercent: 100,
        borderRadius: 8,
        caption: 'Dokumentasi kegiatan forum tahunan organisasi.',
        linkUrl: '',
        align: 'center',
        bgColor: 'transparent',
        paddingY: 16,
      };
    case 'button':
      return {
        id,
        type: 'button',
        label: 'Konfirmasi Kehadiran',
        url: 'https://contoh-organisasi.or.id/konfirmasi',
        buttonColor: '#16A34A',
        textColor: '#FFFFFF',
        borderRadius: 8,
        align: 'center',
        fullWidth: false,
        bgColor: 'transparent',
        paddingY: 20,
      };
    case 'callout':
      return {
        id,
        type: 'callout',
        title: 'Poin Penting yang Perlu Diperhatikan',
        items: [
          'Batas akhir pendaftaran peserta adalah hari Jumat pukul 16.00 WIB.',
          'Harap membawa kartu anggota atau bukti registrasi digital saat hadir.',
          'Materi lengkap dapat diunduh melalui portal anggota sebelum acara dimulai.',
        ],
        accentColor: '#1D4ED8',
        boxBgColor: '#F8FAFC',
        textColor: '#1E293B',
        bgColor: 'transparent',
        paddingY: 16,
      };
    case 'kvTable':
      return {
        id,
        type: 'kvTable',
        title: 'Detail Pelaksanaan',
        rows: [
          { id: generateId('row'), key: 'Hari / Tanggal', value: 'Sabtu, 28 November 2026' },
          { id: generateId('row'), key: 'Waktu', value: '09.00 – 12.00 WIB' },
          { id: generateId('row'), key: 'Tempat', value: 'Aula Utama Gedung Sekretariat Lt. 3' },
          { id: generateId('row'), key: 'PIC / Narahubung', value: 'Sdri. Nadya Pratama (0812-3456-7890)' },
        ],
        labelColor: '#475569',
        valueColor: '#0F172A',
        borderColor: '#E2E8F0',
        stripeBgColor: '#F8FAFC',
        bgColor: 'transparent',
        paddingY: 16,
      };
    case 'twoColumns':
      return {
        id,
        type: 'twoColumns',
        left: {
          imageUrl: DEFAULT_GALLERY_IMAGES.workshopTable,
          imageAlt: 'Workshop penyusunan program kerja',
          title: 'Lokakarya Program Kerja 2027',
          body: 'Ringkasan hasil diskusi lintas divisi untuk memperkuat layanan anggota sepanjang tahun depan.',
          linkText: 'Baca selengkapnya →',
          linkUrl: 'https://contoh-organisasi.or.id/program-2027',
        },
        right: {
          imageUrl: DEFAULT_GALLERY_IMAGES.civicAtrium,
          imageAlt: 'Gedung pusat komunitas anggota',
          title: 'Peresmian Ruang Kolaborasi Baru',
          body: 'Fasilitas ruang rapat dan perpustakaan terbuka kini siap digunakan oleh seluruh anggota aktif.',
          linkText: 'Lihat jadwal akses →',
          linkUrl: 'https://contoh-organisasi.or.id/ruang-kolaborasi',
        },
        cardBgColor: '#F8FAFC',
        titleColor: '#0F172A',
        textColor: '#475569',
        accentColor: '#0F766E',
        bgColor: 'transparent',
        paddingY: 16,
      };
    case 'divider':
      return {
        id,
        type: 'divider',
        showLine: true,
        lineColor: '#E2E8F0',
        lineThickness: 1,
        lineStyle: 'solid',
        spacerHeight: 20,
        bgColor: 'transparent',
      };
    case 'footer':
      return {
        id,
        type: 'footer',
        orgName: 'Pengurus Pusat Komunitas Bungtemin',
        address: 'Jl. Merdeka Selatan No. 45, Jakarta Pusat 10110',
        contact: 'sekretariat@bungtemin.or.id  •  (021) 555-0192',
        copyright: '© 2026 Komunitas Bungtemin. Seluruh hak cipta dilindungi.',
        bgColor: '#F8FAFC',
        textColor: '#64748B',
        align: 'center',
        paddingY: 24,
      };
  }
}

export function duplicateBlock(block: EmailBlock): EmailBlock {
  const cloned = JSON.parse(JSON.stringify(block)) as EmailBlock;
  cloned.id = generateId(block.type);
  if (cloned.type === 'kvTable') {
    cloned.rows = cloned.rows.map((r) => ({ ...r, id: generateId('row') }));
  }
  return cloned;
}

export function moveBlock(
  blocks: EmailBlock[],
  index: number,
  direction: 'up' | 'down'
): EmailBlock[] {
  const targetIndex = direction === 'up' ? index - 1 : index + 1;
  if (index < 0 || index >= blocks.length || targetIndex < 0 || targetIndex >= blocks.length) {
    return blocks;
  }
  const next = [...blocks];
  const [item] = next.splice(index, 1);
  next.splice(targetIndex, 0, item);
  return next;
}

export function reorderBlocks(
  blocks: EmailBlock[],
  fromIndex: number,
  toIndex: number
): EmailBlock[] {
  if (
    fromIndex < 0 ||
    fromIndex >= blocks.length ||
    toIndex < 0 ||
    toIndex > blocks.length ||
    fromIndex === toIndex
  ) {
    return blocks;
  }
  const next = [...blocks];
  const [moved] = next.splice(fromIndex, 1);
  const adjustedTarget = fromIndex < toIndex ? toIndex - 1 : toIndex;
  next.splice(adjustedTarget, 0, moved);
  return next;
}

export function insertBlockAt(
  blocks: EmailBlock[],
  block: EmailBlock,
  index: number
): EmailBlock[] {
  const clamped = Math.max(0, Math.min(index, blocks.length));
  const next = [...blocks];
  next.splice(clamped, 0, block);
  return next;
}

export function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function sanitizeUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return '#';
  if (LEGACY_ASSET_MAP[trimmed]) return LEGACY_ASSET_MAP[trimmed];
  if (trimmed.startsWith('/images/')) return `${PUBLIC_ORIGIN}${trimmed}`;
  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith('http://') ||
    lower.startsWith('https://') ||
    lower.startsWith('mailto:') ||
    lower.startsWith('tel:') ||
    lower.startsWith('#') ||
    lower.startsWith('/') ||
    lower.startsWith('data:image/')
  ) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

/**
 * Converts plain text with lightweight markdown (**bold**, *italic*) and newlines
 * into XSS-safe HTML suitable for email bodies.
 */
export function formatRichTextToHtml(text: string): string {
  let safe = escapeHtml(text);
  // Bold: **text**
  safe = safe.replace(/\*\*([\s\S]+?)\*\*/g, '<strong>$1</strong>');
  // Italic: *text* (avoid matching inside already converted tags)
  safe = safe.replace(/(^|[^*])\*([^*\n]+?)\*(?!\*)/g, '$1<em>$2</em>');
  // Line breaks
  safe = safe.replace(/\r?\n/g, '<br />');
  return safe;
}

const VALID_BLOCK_TYPES = new Set<BlockType>([
  'header',
  'text',
  'image',
  'button',
  'callout',
  'kvTable',
  'twoColumns',
  'divider',
  'footer',
]);

export function validateImportedDocument(
  raw: unknown
): { ok: true; document: EmailDocument } | { ok: false; error: string } {
  if (!raw || typeof raw !== 'object') {
    return { ok: false, error: 'Format JSON tidak valid. Harus berupa objek dokumen.' };
  }
  const obj = raw as Record<string, unknown>;
  if (typeof obj.title !== 'string' || !obj.title.trim()) {
    return { ok: false, error: 'Properti "title" wajib diisi dan berupa teks.' };
  }
  if (!Array.isArray(obj.blocks)) {
    return { ok: false, error: 'Properti "blocks" harus berupa array blok konten.' };
  }
  for (let i = 0; i < obj.blocks.length; i++) {
    const b = obj.blocks[i] as Record<string, unknown>;
    if (!b || typeof b !== 'object' || typeof b.type !== 'string') {
      return { ok: false, error: `Blok ke-${i + 1} tidak memiliki tipe yang valid.` };
    }
    if (!VALID_BLOCK_TYPES.has(b.type as BlockType)) {
      return { ok: false, error: `Tipe blok "${b.type}" pada blok ke-${i + 1} tidak dikenali.` };
    }
  }

  const rawStyle = (obj.pageStyle && typeof obj.pageStyle === 'object'
    ? obj.pageStyle
    : {}) as Partial<PageStyle>;

  const pageStyle: PageStyle = {
    containerWidth:
      typeof rawStyle.containerWidth === 'number' &&
      rawStyle.containerWidth >= 400 &&
      rawStyle.containerWidth <= 800
        ? rawStyle.containerWidth
        : DEFAULT_PAGE_STYLE.containerWidth,
    outerBgColor:
      typeof rawStyle.outerBgColor === 'string'
        ? rawStyle.outerBgColor
        : DEFAULT_PAGE_STYLE.outerBgColor,
    contentBgColor:
      typeof rawStyle.contentBgColor === 'string'
        ? rawStyle.contentBgColor
        : DEFAULT_PAGE_STYLE.contentBgColor,
    fontFamily:
      typeof rawStyle.fontFamily === 'string'
        ? rawStyle.fontFamily
        : DEFAULT_PAGE_STYLE.fontFamily,
    containerRadius:
      typeof rawStyle.containerRadius === 'number'
        ? rawStyle.containerRadius
        : DEFAULT_PAGE_STYLE.containerRadius,
  };

  const blocks: EmailBlock[] = obj.blocks.map((b) => {
    const rec = b as Record<string, unknown>;
    const defaults = createDefaultBlock(rec.type as BlockType);
    return {
      ...defaults,
      ...rec,
      id: typeof rec.id === 'string' && rec.id.trim() ? rec.id : generateId(rec.type as string),
    } as EmailBlock;
  });

  return {
    ok: true,
    document: {
      id: typeof obj.id === 'string' && obj.id.trim() ? obj.id : generateId('doc'),
      title: obj.title.trim(),
      updatedAt: new Date().toISOString(),
      pageStyle,
      blocks,
    },
  };
}

export async function copyTextToClipboard(text: string): Promise<boolean> {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fallback for iframe / restricted clipboard permissions
    }
  }
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.top = '-9999px';
    textarea.style.left = '-9999px';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}

