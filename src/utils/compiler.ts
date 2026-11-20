import type {
  ButtonBlock,
  CalloutBlock,
  ColumnCardItem,
  DividerBlock,
  EmailBlock,
  EmailDocument,
  FooterBlock,
  HeaderBlock,
  ImageBlock,
  KeyValueTableBlock,
  TextBlock,
  TwoColumnsBlock,
} from '../types/email';
import { escapeHtml, formatRichTextToHtml, sanitizeUrl } from './blocks';

function renderHeaderBlock(block: HeaderBlock, fontFamily: string): string {
  const bgStyle =
    block.bgType === 'gradient'
      ? `background-color: ${block.bgColor}; background-image: linear-gradient(135deg, ${block.bgColor} 0%, ${block.gradientEndColor} 100%);`
      : `background-color: ${block.bgColor};`;

  const logoMargin =
    block.align === 'center'
      ? '0 auto 14px auto'
      : block.align === 'right'
        ? '0 0 14px auto'
        : '0 0 14px 0';

  const logoHtml = block.logoUrl.trim()
    ? `<img src="${escapeHtml(sanitizeUrl(block.logoUrl))}" alt="Logo Organisasi" width="56" style="max-width: 100%; width: 56px; height: auto; display: block; margin: ${logoMargin}; border: 0; border-radius: 6px;" />`
    : '';

  const badgeHtml = block.categoryBadge.trim()
    ? `<div style="margin-bottom: 12px;">
        <span style="display: inline-block; padding: 4px 10px; font-size: 11px; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; color: ${block.textColor}; background-color: rgba(255,255,255,0.16); border: 1px solid rgba(255,255,255,0.28); border-radius: 4px; font-family: ${fontFamily};">${escapeHtml(block.categoryBadge)}</span>
      </div>`
    : '';

  const subtitleHtml = block.orgSubtitle.trim()
    ? `<p style="margin: 0 0 8px 0; font-size: 12px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: ${block.textColor}; opacity: 0.85; font-family: ${fontFamily};">${escapeHtml(block.orgSubtitle)}</p>`
    : '';

  return `<tr>
  <td align="${block.align}" bgcolor="${block.bgColor}" class="mobile-padding" style="${bgStyle} padding: ${block.paddingY}px 28px; text-align: ${block.align}; font-family: ${fontFamily};">
    ${logoHtml}
    ${badgeHtml}
    ${subtitleHtml}
    <h1 style="margin: 0; font-size: 24px; line-height: 1.3; font-weight: 700; color: ${block.textColor}; font-family: ${fontFamily};">${escapeHtml(block.title)}</h1>
  </td>
</tr>`;
}

function renderTextBlock(block: TextBlock, fontFamily: string): string {
  const bgStyle =
    block.bgColor && block.bgColor !== 'transparent'
      ? `background-color: ${block.bgColor};`
      : '';
  const fontWeight = block.isBold ? '700' : '400';
  const fontStyle = block.isItalic ? 'italic' : 'normal';

  return `<tr>
  <td align="${block.align}" class="mobile-padding" style="${bgStyle} padding: ${block.paddingY}px ${block.paddingX}px; text-align: ${block.align}; font-family: ${fontFamily}; font-size: ${block.fontSize}px; line-height: ${block.lineHeight}; font-weight: ${fontWeight}; font-style: ${fontStyle}; color: ${block.textColor};">
    ${formatRichTextToHtml(block.content)}
  </td>
</tr>`;
}

function renderImageBlock(block: ImageBlock, fontFamily: string): string {
  const bgStyle =
    block.bgColor && block.bgColor !== 'transparent'
      ? `background-color: ${block.bgColor};`
      : '';
  const imgMargin =
    block.align === 'center'
      ? '0 auto'
      : block.align === 'right'
        ? '0 0 0 auto'
        : '0';

  const imgTag = block.src.trim()
    ? `<img src="${escapeHtml(sanitizeUrl(block.src))}" alt="${escapeHtml(block.alt || 'Gambar')}" style="max-width: 100%; height: auto; display: block; width: ${block.widthPercent}%; border-radius: ${block.borderRadius}px; margin: ${imgMargin}; border: 0;" />`
    : '';

  const linkedImg =
    imgTag && block.linkUrl.trim()
      ? `<a href="${escapeHtml(sanitizeUrl(block.linkUrl))}" target="_blank" rel="noopener noreferrer" style="text-decoration: none; display: block;">${imgTag}</a>`
      : imgTag;

  const captionHtml = block.caption.trim()
    ? `<p style="margin: 10px 0 0 0; font-size: 12px; line-height: 1.5; color: #64748B; text-align: ${block.align}; font-family: ${fontFamily};">${escapeHtml(block.caption)}</p>`
    : '';

  return `<tr>
  <td align="${block.align}" class="mobile-padding" style="${bgStyle} padding: ${block.paddingY}px 28px; text-align: ${block.align};">
    ${linkedImg}
    ${captionHtml}
  </td>
</tr>`;
}

function renderButtonBlock(block: ButtonBlock, fontFamily: string): string {
  const bgStyle =
    block.bgColor && block.bgColor !== 'transparent'
      ? `background-color: ${block.bgColor};`
      : '';
  const widthAttr = block.fullWidth ? ' width="100%"' : '';
  const linkWidthStyle = block.fullWidth ? 'width: 100%; box-sizing: border-box;' : '';

  return `<tr>
  <td align="${block.align}" class="mobile-padding" style="${bgStyle} padding: ${block.paddingY}px 28px; text-align: ${block.align};">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="${block.align}"${widthAttr} style="border-collapse: separate;${block.fullWidth ? ' width: 100%;' : ''}">
      <tr>
        <td align="center" bgcolor="${block.buttonColor}" style="border-radius: ${block.borderRadius}px; background-color: ${block.buttonColor};">
          <a href="${escapeHtml(sanitizeUrl(block.url))}" target="_blank" rel="noopener noreferrer" style="display: inline-block; ${linkWidthStyle} padding: 13px 26px; font-family: ${fontFamily}; font-size: 14px; font-weight: 700; color: ${block.textColor}; text-decoration: none; border-radius: ${block.borderRadius}px; text-align: center;">${escapeHtml(block.label)}</a>
        </td>
      </tr>
    </table>
  </td>
</tr>`;
}

function renderCalloutBlock(block: CalloutBlock, fontFamily: string): string {
  const bgStyle =
    block.bgColor && block.bgColor !== 'transparent'
      ? `background-color: ${block.bgColor};`
      : '';
  const itemsHtml = block.items
    .filter((item) => item.trim().length > 0)
    .map(
      (item) =>
        `<li style="margin: 0 0 6px 0; padding: 0;">${formatRichTextToHtml(item)}</li>`
    )
    .join('\n          ');

  return `<tr>
  <td class="mobile-padding" style="${bgStyle} padding: ${block.paddingY}px 28px;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse: collapse; background-color: ${block.boxBgColor}; border-left: 4px solid ${block.accentColor}; border-radius: 0 6px 6px 0;">
      <tr>
        <td style="padding: 16px 20px; font-family: ${fontFamily}; color: ${block.textColor};">
          ${block.title.trim() ? `<p style="margin: 0 0 10px 0; font-size: 15px; font-weight: 700; color: ${block.textColor}; font-family: ${fontFamily};">${escapeHtml(block.title)}</p>` : ''}
          <ul style="margin: 0; padding-left: 18px; font-size: 14px; line-height: 1.6; color: ${block.textColor}; font-family: ${fontFamily};">
          ${itemsHtml}
          </ul>
        </td>
      </tr>
    </table>
  </td>
</tr>`;
}

function renderKeyValueTableBlock(
  block: KeyValueTableBlock,
  fontFamily: string
): string {
  const bgStyle =
    block.bgColor && block.bgColor !== 'transparent'
      ? `background-color: ${block.bgColor};`
      : '';

  const rowsHtml = block.rows
    .map((row, idx) => {
      const rowBg = idx % 2 === 0 ? block.stripeBgColor : '#FFFFFF';
      return `<tr style="background-color: ${rowBg};">
        <td valign="top" width="36%" style="padding: 10px 14px; border-bottom: 1px solid ${block.borderColor}; font-family: ${fontFamily}; font-size: 13px; font-weight: 700; color: ${block.labelColor};">${escapeHtml(row.key)}</td>
        <td valign="top" width="64%" style="padding: 10px 14px; border-bottom: 1px solid ${block.borderColor}; font-family: ${fontFamily}; font-size: 14px; line-height: 1.5; color: ${block.valueColor};">${formatRichTextToHtml(row.value)}</td>
      </tr>`;
    })
    .join('\n      ');

  return `<tr>
  <td class="mobile-padding" style="${bgStyle} padding: ${block.paddingY}px 28px;">
    ${block.title.trim() ? `<p style="margin: 0 0 10px 0; font-size: 15px; font-weight: 700; color: ${block.valueColor}; font-family: ${fontFamily};">${escapeHtml(block.title)}</p>` : ''}
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse: collapse; border: 1px solid ${block.borderColor};">
      ${rowsHtml}
    </table>
  </td>
</tr>`;
}

function renderColumnCard(
  item: ColumnCardItem,
  block: TwoColumnsBlock,
  fontFamily: string
): string {
  const imgHtml = item.imageUrl.trim()
    ? `<img src="${escapeHtml(sanitizeUrl(item.imageUrl))}" alt="${escapeHtml(item.imageAlt || item.title)}" style="max-width: 100%; height: auto; display: block; width: 100%; border-radius: 6px; margin-bottom: 12px; border: 0;" />`
    : '';
  const linkHtml =
    item.linkText.trim() && item.linkUrl.trim()
      ? `<p style="margin: 10px 0 0 0;"><a href="${escapeHtml(sanitizeUrl(item.linkUrl))}" target="_blank" rel="noopener noreferrer" style="font-family: ${fontFamily}; font-size: 13px; font-weight: 700; color: ${block.accentColor}; text-decoration: none;">${escapeHtml(item.linkText)}</a></p>`
      : '';

  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse: collapse; background-color: ${block.cardBgColor}; border: 1px solid #E2E8F0; border-radius: 8px;">
    <tr>
      <td style="padding: 14px; font-family: ${fontFamily};">
        ${imgHtml}
        <h3 style="margin: 0 0 6px 0; font-size: 15px; line-height: 1.35; font-weight: 700; color: ${block.titleColor}; font-family: ${fontFamily};">${escapeHtml(item.title)}</h3>
        <p style="margin: 0; font-size: 13px; line-height: 1.55; color: ${block.textColor}; font-family: ${fontFamily};">${formatRichTextToHtml(item.body)}</p>
        ${linkHtml}
      </td>
    </tr>
  </table>`;
}

function renderTwoColumnsBlock(
  block: TwoColumnsBlock,
  fontFamily: string
): string {
  const bgStyle =
    block.bgColor && block.bgColor !== 'transparent'
      ? `background-color: ${block.bgColor};`
      : '';

  return `<tr>
  <td class="mobile-padding" style="${bgStyle} padding: ${block.paddingY}px 28px;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse: collapse;">
      <tr>
        <td class="stack-column" valign="top" width="50%" style="padding-right: 8px;">
          ${renderColumnCard(block.left, block, fontFamily)}
        </td>
        <td class="stack-column" valign="top" width="50%" style="padding-left: 8px;">
          ${renderColumnCard(block.right, block, fontFamily)}
        </td>
      </tr>
    </table>
  </td>
</tr>`;
}

function renderDividerBlock(block: DividerBlock): string {
  const bgStyle =
    block.bgColor && block.bgColor !== 'transparent'
      ? `background-color: ${block.bgColor};`
      : '';
  const halfHeight = Math.max(4, Math.round(block.spacerHeight / 2));

  if (!block.showLine) {
    return `<tr>
  <td style="${bgStyle} height: ${block.spacerHeight}px; line-height: ${block.spacerHeight}px; font-size: 1px;">&nbsp;</td>
</tr>`;
  }

  return `<tr>
  <td class="mobile-padding" style="${bgStyle} padding: ${halfHeight}px 28px;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse: collapse;">
      <tr>
        <td style="border-top: ${block.lineThickness}px ${block.lineStyle} ${block.lineColor}; font-size: 1px; line-height: 1px;">&nbsp;</td>
      </tr>
    </table>
  </td>
</tr>`;
}

function renderFooterBlock(block: FooterBlock, fontFamily: string): string {
  return `<tr>
  <td align="${block.align}" bgcolor="${block.bgColor}" class="mobile-padding" style="background-color: ${block.bgColor}; padding: ${block.paddingY}px 28px; text-align: ${block.align}; font-family: ${fontFamily}; border-top: 1px solid #E2E8F0;">
    ${block.orgName.trim() ? `<p style="margin: 0 0 6px 0; font-size: 13px; font-weight: 700; color: ${block.textColor}; font-family: ${fontFamily};">${escapeHtml(block.orgName)}</p>` : ''}
    ${block.address.trim() ? `<p style="margin: 0 0 4px 0; font-size: 12px; line-height: 1.5; color: ${block.textColor}; font-family: ${fontFamily};">${escapeHtml(block.address)}</p>` : ''}
    ${block.contact.trim() ? `<p style="margin: 0 0 10px 0; font-size: 12px; line-height: 1.5; color: ${block.textColor}; font-family: ${fontFamily};">${escapeHtml(block.contact)}</p>` : ''}
    ${block.copyright.trim() ? `<p style="margin: 0; font-size: 11px; line-height: 1.5; color: ${block.textColor}; opacity: 0.85; font-family: ${fontFamily};">${escapeHtml(block.copyright)}</p>` : ''}
  </td>
</tr>`;
}

function renderBlock(block: EmailBlock, fontFamily: string): string {
  switch (block.type) {
    case 'header':
      return renderHeaderBlock(block, fontFamily);
    case 'text':
      return renderTextBlock(block, fontFamily);
    case 'image':
      return renderImageBlock(block, fontFamily);
    case 'button':
      return renderButtonBlock(block, fontFamily);
    case 'callout':
      return renderCalloutBlock(block, fontFamily);
    case 'kvTable':
      return renderKeyValueTableBlock(block, fontFamily);
    case 'twoColumns':
      return renderTwoColumnsBlock(block, fontFamily);
    case 'divider':
      return renderDividerBlock(block);
    case 'footer':
      return renderFooterBlock(block, fontFamily);
  }
}

/**
 * Compiles an EmailDocument into a standalone, email-client & mobile-friendly
 * HTML string with inline CSS, table layout, and responsive @media rules.
 */
export function compileToEmailHtml(doc: EmailDocument): string {
  const { pageStyle, blocks, title } = doc;
  const width = pageStyle.containerWidth || 600;
  const fontFamily = pageStyle.fontFamily || 'Arial, Helvetica, sans-serif';
  const radius = pageStyle.containerRadius ?? 12;

  const renderedBlocks = blocks
    .map((block) => renderBlock(block, fontFamily))
    .join('\n');

  return `<!DOCTYPE html>
<html lang="id" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>${escapeHtml(title)}</title>
  <style type="text/css">
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; max-width: 100%; height: auto; display: block; }
    body { margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: ${pageStyle.outerBgColor}; }
    @media (max-width: 600px) {
      .email-container {
        width: 100% !important;
        max-width: 100% !important;
        border-radius: 0 !important;
      }
      .outer-wrapper {
        padding: 12px 8px !important;
      }
      .mobile-padding {
        padding-left: 18px !important;
        padding-right: 18px !important;
      }
      .stack-column {
        display: block !important;
        width: 100% !important;
        max-width: 100% !important;
        padding-left: 0 !important;
        padding-right: 0 !important;
        padding-bottom: 14px !important;
        box-sizing: border-box !important;
      }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: ${pageStyle.outerBgColor}; font-family: ${fontFamily};">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="${pageStyle.outerBgColor}" style="background-color: ${pageStyle.outerBgColor}; border-collapse: collapse;">
    <tr>
      <td align="center" class="outer-wrapper" style="padding: 24px 12px;">
        <table role="presentation" class="email-container" width="${width}" cellspacing="0" cellpadding="0" border="0" bgcolor="${pageStyle.contentBgColor}" style="width: 100%; max-width: ${width}px; background-color: ${pageStyle.contentBgColor}; border-collapse: separate; border-radius: ${radius}px; overflow: hidden; border: 1px solid #E2E8F0;">
${renderedBlocks}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
