import type { EmailDocument } from '../types/email';
import { validateImportedDocument } from './blocks';
import { cloneTemplateToDocument } from './templates';

const ACTIVE_DOC_KEY = 'bungtemin_mail_studio_active_v1';
const SAVED_DESIGNS_KEY = 'bungtemin_mail_studio_saved_v1';

export function loadSavedDesigns(): EmailDocument[] {
  try {
    const raw = window.localStorage.getItem(SAVED_DESIGNS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const valid: EmailDocument[] = [];
    for (const item of parsed) {
      const check = validateImportedDocument(item);
      if (check.ok) {
        valid.push({
          ...check.document,
          updatedAt:
            typeof item?.updatedAt === 'string'
              ? item.updatedAt
              : check.document.updatedAt,
        });
      }
    }
    return valid;
  } catch {
    return [];
  }
}

export function persistSavedDesigns(designs: EmailDocument[]): void {
  try {
    window.localStorage.setItem(SAVED_DESIGNS_KEY, JSON.stringify(designs));
  } catch {
    // Ignore quota errors gracefully
  }
}

export function loadActiveDocument(): EmailDocument {
  try {
    const raw = window.localStorage.getItem(ACTIVE_DOC_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const check = validateImportedDocument(parsed);
      if (check.ok) {
        return {
          ...check.document,
          updatedAt:
            typeof parsed?.updatedAt === 'string'
              ? parsed.updatedAt
              : check.document.updatedAt,
        };
      }
    }
  } catch {
    // Fallback to default template
  }
  return cloneTemplateToDocument('pengumuman-resmi');
}

export function persistActiveDocument(doc: EmailDocument): void {
  try {
    window.localStorage.setItem(ACTIVE_DOC_KEY, JSON.stringify(doc));
  } catch {
    // Ignore storage errors gracefully
  }
}

export function upsertSavedDesign(
  existing: EmailDocument[],
  doc: EmailDocument
): EmailDocument[] {
  const stamped: EmailDocument = {
    ...doc,
    updatedAt: new Date().toISOString(),
  };
  const filtered = existing.filter((d) => d.id !== stamped.id);
  return [stamped, ...filtered].slice(0, 30);
}

export function formatIndonesianTimestamp(iso: string): string {
  try {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return 'Baru saja';
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return 'Baru saja';
  }
}
