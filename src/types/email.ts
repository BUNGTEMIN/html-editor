export type TextAlign = 'left' | 'center' | 'right';

export type BlockType =
  | 'header'
  | 'text'
  | 'image'
  | 'button'
  | 'callout'
  | 'kvTable'
  | 'twoColumns'
  | 'divider'
  | 'footer';

export interface BaseBlock {
  id: string;
  type: BlockType;
}

export interface HeaderBlock extends BaseBlock {
  type: 'header';
  orgSubtitle: string;
  title: string;
  categoryBadge: string;
  logoUrl: string;
  bgType: 'solid' | 'gradient';
  bgColor: string;
  gradientEndColor: string;
  textColor: string;
  align: TextAlign;
  paddingY: number;
}

export interface TextBlock extends BaseBlock {
  type: 'text';
  content: string;
  align: TextAlign;
  fontSize: number;
  lineHeight: number;
  textColor: string;
  bgColor: string;
  paddingY: number;
  paddingX: number;
  isBold: boolean;
  isItalic: boolean;
}

export interface ImageBlock extends BaseBlock {
  type: 'image';
  src: string;
  alt: string;
  widthPercent: number;
  borderRadius: number;
  caption: string;
  linkUrl: string;
  align: TextAlign;
  bgColor: string;
  paddingY: number;
}

export interface ButtonBlock extends BaseBlock {
  type: 'button';
  label: string;
  url: string;
  buttonColor: string;
  textColor: string;
  borderRadius: number;
  align: TextAlign;
  fullWidth: boolean;
  bgColor: string;
  paddingY: number;
}

export interface CalloutBlock extends BaseBlock {
  type: 'callout';
  title: string;
  items: string[];
  accentColor: string;
  boxBgColor: string;
  textColor: string;
  bgColor: string;
  paddingY: number;
}

export interface KeyValueRow {
  id: string;
  key: string;
  value: string;
}

export interface KeyValueTableBlock extends BaseBlock {
  type: 'kvTable';
  title: string;
  rows: KeyValueRow[];
  labelColor: string;
  valueColor: string;
  borderColor: string;
  stripeBgColor: string;
  bgColor: string;
  paddingY: number;
}

export interface ColumnCardItem {
  imageUrl: string;
  imageAlt: string;
  title: string;
  body: string;
  linkText: string;
  linkUrl: string;
}

export interface TwoColumnsBlock extends BaseBlock {
  type: 'twoColumns';
  left: ColumnCardItem;
  right: ColumnCardItem;
  cardBgColor: string;
  titleColor: string;
  textColor: string;
  accentColor: string;
  bgColor: string;
  paddingY: number;
}

export interface DividerBlock extends BaseBlock {
  type: 'divider';
  showLine: boolean;
  lineColor: string;
  lineThickness: number;
  lineStyle: 'solid' | 'dashed' | 'dotted';
  spacerHeight: number;
  bgColor: string;
}

export interface FooterBlock extends BaseBlock {
  type: 'footer';
  orgName: string;
  address: string;
  contact: string;
  copyright: string;
  bgColor: string;
  textColor: string;
  align: TextAlign;
  paddingY: number;
}

export type EmailBlock =
  | HeaderBlock
  | TextBlock
  | ImageBlock
  | ButtonBlock
  | CalloutBlock
  | KeyValueTableBlock
  | TwoColumnsBlock
  | DividerBlock
  | FooterBlock;

export interface PageStyle {
  containerWidth: number;
  outerBgColor: string;
  contentBgColor: string;
  fontFamily: string;
  containerRadius: number;
}

export interface EmailDocument {
  id: string;
  title: string;
  updatedAt: string;
  pageStyle: PageStyle;
  blocks: EmailBlock[];
}

export interface TemplatePreset {
  id: string;
  name: string;
  category: string;
  description: string;
  accentColor: string;
  document: Omit<EmailDocument, 'id' | 'updatedAt'>;
}

export type PreviewMode = 'desktop' | 'mobile';
export type InspectorTab = 'blocks' | 'properties' | 'pageStyle' | 'code';
