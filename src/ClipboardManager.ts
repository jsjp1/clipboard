import type { ClipboardItem } from './types/ClipboardItem';
import { LinkedList } from './LinkedList.js';

export class ClipboardManager {
  private clipboardItems: LinkedList<ClipboardItem>;

  constructor() {
    this.clipboardItems = new LinkedList<ClipboardItem>();
  }

  addItem(item: ClipboardItem): void {
    this.clipboardItems.insertInBegin(item);
  }

  deleteItemByTimestamp(timestamp: number): void {
    const node = this.clipboardItems.matchFind(item => item.timestamp === timestamp);
    
    if(!node) {
      return;
    }
    
    this.clipboardItems.delete(node);
  }

  findItemByTimestamp(timestamp: number): ClipboardItem | null {
    const node = this.clipboardItems.matchFind(item => item.timestamp === timestamp);
    return node ? node.data : null;
  }

  findItemByData(data: string): ClipboardItem | null {
    const node = this.clipboardItems.matchFind(item => item.data === data);
    return node ? node.data : null;
  }
}