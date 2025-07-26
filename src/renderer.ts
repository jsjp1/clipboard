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
    const entry = document.createElement('div');
    entry.className = 'clipboard-item';

    const content = document.createElement('div');
    content.className = 'clipboard-content';

    const copyButton = document.createElement('button');
    copyButton.className = 'copy-button';
    copyButton.textContent = '📋';

    if (item.type === 'text') {
      content.textContent = item.data;

      copyButton.addEventListener('click', () => {
        window.electronAPI.copyText(item.data);
      });
    } else if (item.type === 'image') {
      const img = document.createElement('img');
      img.src = item.data;
      content.appendChild(img);

      copyButton.addEventListener('click', () => {
        window.electronAPI.copyImage(item.data);
      });
    }

    entry.appendChild(content);
    entry.appendChild(copyButton);
    list.prepend(entry);
  });
});

