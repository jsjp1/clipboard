export type ClipboardContentType = 'text' | 'image';

export interface ClipboardItem {
  type: ClipboardContentType;
  timestamp: number;
  data: string;
}