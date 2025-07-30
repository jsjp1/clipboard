import { ClipboardManager } from './ClipboardManager.js';

const clipboardManager: ClipboardManager = new ClipboardManager();

window.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('clipboard-list');
  if (!container) {
    window.close();
    return;
  }

  const list = document.createElement('div');
  list.className = 'clipboard-container';
  container.appendChild(list);

  window.electronAPI.onClipboardUpdate((item) => {
    if (!item || !item.data) return;
    if (clipboardManager.findItemByData(item.data)) return;

    const entry = document.createElement('div');
    entry.className = 'clipboard-item';

    const content = document.createElement('div');
    content.className = 'clipboard-content';

    const copyButton = document.createElement('button');
    copyButton.className = 'copy-button';
    copyButton.textContent = '📋';

    const deleteButton = document.createElement('button');
    deleteButton.className = 'delete-button';
    deleteButton.textContent = '🗑️';

    if (item.type === 'text') {
      content.textContent = item.data;
      copyButton.addEventListener('click', () => window.electronAPI.copyText(item.data));
    } else if (item.type === 'image') {
      const img = document.createElement('img');
      img.src = item.data;
      content.appendChild(img);
      copyButton.addEventListener('click', () => window.electronAPI.copyImage(item.data));
    }

    deleteButton.addEventListener('click', () => {
      clipboardManager.deleteItemByTimestamp(item.timestamp);
      window.electronAPI.deleteFromRedis(item.timestamp);
      entry.remove();
    });

    copyButton.addEventListener('click', () => {
      const modal = document.createElement('div');
      modal.className = 'modal';

      const modalContent = document.createElement('div');
      modalContent.className = 'modal-content';
      modalContent.textContent = 'Copied to clipboard!';

      modal.appendChild(modalContent);
      document.body.appendChild(modal);

      setTimeout(() => modal.remove(), 750);
    });

    clipboardManager.addItem(item);
    entry.appendChild(content);
    entry.appendChild(copyButton);
    entry.appendChild(deleteButton);
    list.prepend(entry);
  });
});

document.querySelector('.setting-button')?.addEventListener('click', () => {
  window.electronAPI.setting();
});
document.querySelector('.fix-button')?.addEventListener('click', () => {
  window.electronAPI.fixWindowToTopLeft();
});
document.querySelector('.up-button')?.addEventListener('click', () => {
  window.electronAPI.foldWindow();
});
document.querySelector('.down-button')?.addEventListener('click', () => {
  window.electronAPI.outspreadWindow();
});