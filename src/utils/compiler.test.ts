import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createDefaultBlock,
  duplicateBlock,
  formatRichTextToHtml,
  insertBlockAt,
  moveBlock,
  reorderBlocks,
  validateImportedDocument,
} from './blocks';
import { compileToEmailHtml } from './compiler';
import { cloneTemplateToDocument, TEMPLATE_PRESETS } from './templates';
import type { EmailDocument } from '../types/email';

test('TEMPLATE_PRESETS includes at least 4 required starter templates', () => {
  assert.ok(TEMPLATE_PRESETS.length >= 4);
  const ids = TEMPLATE_PRESETS.map((t) => t.id);
  assert.ok(ids.includes('pengumuman-resmi'));
  assert.ok(ids.includes('undangan-rapat'));
  assert.ok(ids.includes('newsletter-buletin'));
  assert.ok(ids.includes('kanvas-kosong'));
});

test('compileToEmailHtml produces complete responsive email-safe HTML', () => {
  const doc = cloneTemplateToDocument('newsletter-buletin');
  const html = compileToEmailHtml(doc);

  assert.ok(html.startsWith('<!DOCTYPE html>'), 'Must start with DOCTYPE');
  assert.ok(html.includes('<meta name="viewport"'), 'Must contain viewport meta');
  assert.ok(html.includes('@media (max-width: 600px)'), 'Must contain mobile media query');
  assert.ok(html.includes('<table role="presentation"'), 'Must use email table layout');
  assert.ok(
    html.includes('max-width: 100%; height: auto; display: block;'),
    'Must enforce responsive image CSS on images'
  );
  assert.ok(html.includes('class="stack-column"'), 'Must include responsive 2-column stacking class');
});

test('compileToEmailHtml renders all 9 block types and escapes unsafe HTML', () => {
  const allBlocks = [
    createDefaultBlock('header'),
    createDefaultBlock('text'),
    createDefaultBlock('image'),
    createDefaultBlock('button'),
    createDefaultBlock('callout'),
    createDefaultBlock('kvTable'),
    createDefaultBlock('twoColumns'),
    createDefaultBlock('divider'),
    createDefaultBlock('footer'),
  ];

  // Inject script tag to verify XSS escaping
  if (allBlocks[1].type === 'text') {
    allBlocks[1].content = 'Halo **Bungtemin** *resmi* <script>alert(1)</script>';
  }

  const doc: EmailDocument = {
    id: 'test_doc',
    title: 'Uji <Kompilasi>',
    updatedAt: new Date().toISOString(),
    pageStyle: {
      containerWidth: 600,
      outerBgColor: '#F1F5F9',
      contentBgColor: '#FFFFFF',
      fontFamily: 'Arial, Helvetica, sans-serif',
      containerRadius: 12,
    },
    blocks: allBlocks,
  };

  const html = compileToEmailHtml(doc);
  assert.ok(html.includes('<title>Uji &lt;Kompilasi&gt;</title>'));
  assert.ok(html.includes('<strong>Bungtemin</strong>'));
  assert.ok(html.includes('<em>resmi</em>'));
  assert.ok(!html.includes('<script>alert(1)</script>'), 'Must escape script tags');
  assert.ok(html.includes('&lt;script&gt;alert(1)&lt;/script&gt;'));
  assert.ok(html.includes('border-left: 4px solid'), 'Callout block must render accent border');
  assert.ok(html.includes('Hari / Tanggal'), 'Key-Value Table must render rows');
});

test('formatRichTextToHtml handles bold, italic, newlines, and HTML escaping', () => {
  const out = formatRichTextToHtml('Baris 1 **Tebal** & *Miring*\nBaris 2 <b>raw</b>');
  assert.equal(
    out,
    'Baris 1 <strong>Tebal</strong> &amp; <em>Miring</em><br />Baris 2 &lt;b&gt;raw&lt;/b&gt;'
  );
});

test('block list operations: moveBlock, reorderBlocks, insertBlockAt, duplicateBlock', () => {
  const b1 = createDefaultBlock('header');
  const b2 = createDefaultBlock('text');
  const b3 = createDefaultBlock('footer');
  const list = [b1, b2, b3];

  const movedUp = moveBlock(list, 1, 'up');
  assert.deepEqual(
    movedUp.map((b) => b.id),
    [b2.id, b1.id, b3.id]
  );

  const movedDown = moveBlock(list, 1, 'down');
  assert.deepEqual(
    movedDown.map((b) => b.id),
    [b1.id, b3.id, b2.id]
  );

  const reordered = reorderBlocks(list, 0, 3);
  assert.deepEqual(
    reordered.map((b) => b.id),
    [b2.id, b3.id, b1.id]
  );

  const dup = duplicateBlock(b2);
  assert.notEqual(dup.id, b2.id);
  assert.equal(dup.type, b2.type);

  const inserted = insertBlockAt(list, dup, 1);
  assert.equal(inserted.length, 4);
  assert.equal(inserted[1].id, dup.id);
});

test('validateImportedDocument accepts valid JSON and rejects malformed JSON', () => {
  const validDoc = cloneTemplateToDocument('undangan-rapat');
  const okResult = validateImportedDocument(validDoc);
  assert.equal(okResult.ok, true);
  if (okResult.ok) {
    assert.equal(okResult.document.title, validDoc.title);
    assert.equal(okResult.document.blocks.length, validDoc.blocks.length);
  }

  const badNoTitle = validateImportedDocument({ blocks: [] });
  assert.equal(badNoTitle.ok, false);

  const badType = validateImportedDocument({
    title: 'Test',
    blocks: [{ id: '1', type: 'unknownBlock' }],
  });
  assert.equal(badType.ok, false);
});
