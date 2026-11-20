import { useState } from 'react';
import { ImageOff } from 'lucide-react';
import type { EmailBlock, PreviewMode } from '../types/email';
import { formatRichTextToHtml, sanitizeUrl } from '../utils/blocks';

interface BlockPreviewProps {
  block: EmailBlock;
  fontFamily: string;
  previewMode: PreviewMode;
}

function SafeEmailImage({
  src,
  alt,
  widthPercent = 100,
  borderRadius = 0,
  align = 'center',
  className = '',
}: {
  src: string;
  alt: string;
  widthPercent?: number;
  borderRadius?: number;
  align?: 'left' | 'center' | 'right';
  className?: string;
}) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const trimmed = src.trim();
  const hasError = !trimmed || failedSrc === trimmed;

  const marginStyle =
    align === 'center'
      ? '0 auto'
      : align === 'right'
        ? '0 0 0 auto'
        : '0';

  if (hasError) {
    return (
      <div
        style={{
          width: `${widthPercent}%`,
          borderRadius: `${borderRadius}px`,
          margin: marginStyle,
        }}
        className="bg-slate-100 border border-dashed border-slate-300 py-8 px-4 flex flex-col items-center justify-center text-slate-500 gap-1.5"
      >
        <ImageOff className="w-5 h-5 text-slate-400" aria-hidden="true" />
        <span className="text-xs font-medium">
          {trimmed ? 'Gambar gagal dimuat' : 'Belum ada gambar'}
        </span>
      </div>
    );
  }

  return (
    <img
      src={sanitizeUrl(trimmed)}
      alt={alt || 'Gambar email'}
      referrerPolicy="no-referrer"
      onError={() => setFailedSrc(trimmed)}
      style={{
        maxWidth: '100%',
        height: 'auto',
        display: 'block',
        width: `${widthPercent}%`,
        borderRadius: `${borderRadius}px`,
        margin: marginStyle,
      }}
      className={className}
    />
  );
}

export function BlockPreview({
  block,
  fontFamily,
  previewMode,
}: BlockPreviewProps) {
  const isMobile = previewMode === 'mobile';
  const horizontalPad = isMobile ? 18 : 28;

  switch (block.type) {
    case 'header': {
      const bgStyle =
        block.bgType === 'gradient'
          ? {
              backgroundColor: block.bgColor,
              backgroundImage: `linear-gradient(135deg, ${block.bgColor} 0%, ${block.gradientEndColor} 100%)`,
            }
          : { backgroundColor: block.bgColor };

      const logoMargin =
        block.align === 'center'
          ? '0 auto 14px auto'
          : block.align === 'right'
            ? '0 0 14px auto'
            : '0 0 14px 0';

      return (
        <div
          style={{
            ...bgStyle,
            padding: `${block.paddingY}px ${horizontalPad}px`,
            textAlign: block.align,
            fontFamily,
            color: block.textColor,
          }}
        >
          {block.logoUrl.trim() && (
            <img
              src={sanitizeUrl(block.logoUrl)}
              alt="Logo Organisasi"
              referrerPolicy="no-referrer"
              style={{
                width: '56px',
                maxWidth: '100%',
                height: 'auto',
                display: 'block',
                margin: logoMargin,
                borderRadius: '6px',
              }}
            />
          )}
          {block.categoryBadge.trim() && (
            <div style={{ marginBottom: '12px' }}>
              <span
                style={{
                  display: 'inline-block',
                  padding: '4px 10px',
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  color: block.textColor,
                  backgroundColor: 'rgba(255,255,255,0.16)',
                  border: '1px solid rgba(255,255,255,0.28)',
                  borderRadius: '4px',
                }}
              >
                {block.categoryBadge}
              </span>
            </div>
          )}
          {block.orgSubtitle.trim() && (
            <p
              style={{
                margin: '0 0 8px 0',
                fontSize: '12px',
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: block.textColor,
                opacity: 0.85,
              }}
            >
              {block.orgSubtitle}
            </p>
          )}
          <h1
            style={{
              margin: 0,
              fontSize: isMobile ? '21px' : '24px',
              lineHeight: 1.3,
              fontWeight: 700,
              color: block.textColor,
            }}
          >
            {block.title || 'Judul Pengumuman'}
          </h1>
        </div>
      );
    }

    case 'text':
      return (
        <div
          style={{
            backgroundColor:
              block.bgColor === 'transparent' ? undefined : block.bgColor,
            padding: `${block.paddingY}px ${isMobile ? 18 : block.paddingX}px`,
            textAlign: block.align,
            fontFamily,
            fontSize: `${block.fontSize}px`,
            lineHeight: block.lineHeight,
            fontWeight: block.isBold ? 700 : 400,
            fontStyle: block.isItalic ? 'italic' : 'normal',
            color: block.textColor,
            wordBreak: 'break-word',
          }}
          dangerouslySetInnerHTML={{
            __html: formatRichTextToHtml(block.content),
          }}
        />
      );

    case 'image':
      return (
        <div
          style={{
            backgroundColor:
              block.bgColor === 'transparent' ? undefined : block.bgColor,
            padding: `${block.paddingY}px ${horizontalPad}px`,
            textAlign: block.align,
            fontFamily,
          }}
        >
          <SafeEmailImage
            src={block.src}
            alt={block.alt}
            widthPercent={block.widthPercent}
            borderRadius={block.borderRadius}
            align={block.align}
          />
          {block.caption.trim() && (
            <p
              style={{
                margin: '10px 0 0 0',
                fontSize: '12px',
                lineHeight: 1.5,
                color: '#64748B',
                textAlign: block.align,
              }}
            >
              {block.caption}
            </p>
          )}
        </div>
      );

    case 'button':
      return (
        <div
          style={{
            backgroundColor:
              block.bgColor === 'transparent' ? undefined : block.bgColor,
            padding: `${block.paddingY}px ${horizontalPad}px`,
            textAlign: block.align,
            fontFamily,
          }}
        >
          <span
            style={{
              display: block.fullWidth ? 'block' : 'inline-block',
              width: block.fullWidth ? '100%' : undefined,
              boxSizing: 'border-box',
              padding: '13px 26px',
              backgroundColor: block.buttonColor,
              color: block.textColor,
              borderRadius: `${block.borderRadius}px`,
              fontSize: '14px',
              fontWeight: 700,
              textAlign: 'center',
              textDecoration: 'none',
            }}
          >
            {block.label || 'Tombol CTA'}
          </span>
        </div>
      );

    case 'callout':
      return (
        <div
          style={{
            backgroundColor:
              block.bgColor === 'transparent' ? undefined : block.bgColor,
            padding: `${block.paddingY}px ${horizontalPad}px`,
            fontFamily,
          }}
        >
          <div
            style={{
              backgroundColor: block.boxBgColor,
              borderLeft: `4px solid ${block.accentColor}`,
              borderRadius: '0 6px 6px 0',
              padding: '16px 20px',
              color: block.textColor,
            }}
          >
            {block.title.trim() && (
              <p
                style={{
                  margin: '0 0 10px 0',
                  fontSize: '15px',
                  fontWeight: 700,
                  color: block.textColor,
                }}
              >
                {block.title}
              </p>
            )}
            <ul
              style={{
                margin: 0,
                paddingLeft: '18px',
                fontSize: '14px',
                lineHeight: 1.6,
                listStyleType: 'disc',
              }}
            >
              {block.items
                .filter((i) => i.trim().length > 0)
                .map((item, idx) => (
                  <li
                    key={idx}
                    style={{ marginBottom: '6px' }}
                    dangerouslySetInnerHTML={{
                      __html: formatRichTextToHtml(item),
                    }}
                  />
                ))}
            </ul>
          </div>
        </div>
      );

    case 'kvTable':
      return (
        <div
          style={{
            backgroundColor:
              block.bgColor === 'transparent' ? undefined : block.bgColor,
            padding: `${block.paddingY}px ${horizontalPad}px`,
            fontFamily,
          }}
        >
          {block.title.trim() && (
            <p
              style={{
                margin: '0 0 10px 0',
                fontSize: '15px',
                fontWeight: 700,
                color: block.valueColor,
              }}
            >
              {block.title}
            </p>
          )}
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              border: `1px solid ${block.borderColor}`,
            }}
          >
            <tbody>
              {block.rows.map((row, idx) => (
                <tr
                  key={row.id}
                  style={{
                    backgroundColor:
                      idx % 2 === 0 ? block.stripeBgColor : '#FFFFFF',
                  }}
                >
                  <td
                    style={{
                      width: '36%',
                      verticalAlign: 'top',
                      padding: '10px 14px',
                      borderBottom: `1px solid ${block.borderColor}`,
                      fontSize: '13px',
                      fontWeight: 700,
                      color: block.labelColor,
                    }}
                  >
                    {row.key}
                  </td>
                  <td
                    style={{
                      width: '64%',
                      verticalAlign: 'top',
                      padding: '10px 14px',
                      borderBottom: `1px solid ${block.borderColor}`,
                      fontSize: '14px',
                      lineHeight: 1.5,
                      color: block.valueColor,
                    }}
                    dangerouslySetInnerHTML={{
                      __html: formatRichTextToHtml(row.value),
                    }}
                  />
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    case 'twoColumns': {
      const columns = [block.left, block.right];
      return (
        <div
          style={{
            backgroundColor:
              block.bgColor === 'transparent' ? undefined : block.bgColor,
            padding: `${block.paddingY}px ${horizontalPad}px`,
            fontFamily,
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
              gap: '14px',
            }}
          >
            {columns.map((col, idx) => (
              <div
                key={idx}
                style={{
                  backgroundColor: block.cardBgColor,
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  padding: '14px',
                }}
              >
                {col.imageUrl.trim() && (
                  <div style={{ marginBottom: '12px' }}>
                    <SafeEmailImage
                      src={col.imageUrl}
                      alt={col.imageAlt || col.title}
                      widthPercent={100}
                      borderRadius={6}
                    />
                  </div>
                )}
                <h3
                  style={{
                    margin: '0 0 6px 0',
                    fontSize: '15px',
                    lineHeight: 1.35,
                    fontWeight: 700,
                    color: block.titleColor,
                  }}
                >
                  {col.title}
                </h3>
                <p
                  style={{
                    margin: 0,
                    fontSize: '13px',
                    lineHeight: 1.55,
                    color: block.textColor,
                  }}
                  dangerouslySetInnerHTML={{
                    __html: formatRichTextToHtml(col.body),
                  }}
                />
                {col.linkText.trim() && (
                  <p style={{ margin: '10px 0 0 0' }}>
                    <span
                      style={{
                        fontSize: '13px',
                        fontWeight: 700,
                        color: block.accentColor,
                      }}
                    >
                      {col.linkText}
                    </span>
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    }

    case 'divider': {
      const half = Math.max(4, Math.round(block.spacerHeight / 2));
      if (!block.showLine) {
        return (
          <div
            style={{
              backgroundColor:
                block.bgColor === 'transparent' ? undefined : block.bgColor,
              height: `${block.spacerHeight}px`,
            }}
          />
        );
      }
      return (
        <div
          style={{
            backgroundColor:
              block.bgColor === 'transparent' ? undefined : block.bgColor,
            padding: `${half}px ${horizontalPad}px`,
          }}
        >
          <hr
            style={{
              border: 0,
              borderTop: `${block.lineThickness}px ${block.lineStyle} ${block.lineColor}`,
              margin: 0,
            }}
          />
        </div>
      );
    }

    case 'footer':
      return (
        <div
          style={{
            backgroundColor: block.bgColor,
            padding: `${block.paddingY}px ${horizontalPad}px`,
            textAlign: block.align,
            fontFamily,
            color: block.textColor,
            borderTop: '1px solid #E2E8F0',
          }}
        >
          {block.orgName.trim() && (
            <p
              style={{
                margin: '0 0 6px 0',
                fontSize: '13px',
                fontWeight: 700,
              }}
            >
              {block.orgName}
            </p>
          )}
          {block.address.trim() && (
            <p style={{ margin: '0 0 4px 0', fontSize: '12px', lineHeight: 1.5 }}>
              {block.address}
            </p>
          )}
          {block.contact.trim() && (
            <p style={{ margin: '0 0 10px 0', fontSize: '12px', lineHeight: 1.5 }}>
              {block.contact}
            </p>
          )}
          {block.copyright.trim() && (
            <p
              style={{
                margin: 0,
                fontSize: '11px',
                lineHeight: 1.5,
                opacity: 0.85,
              }}
            >
              {block.copyright}
            </p>
          )}
        </div>
      );
  }
}
