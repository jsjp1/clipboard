window.addEventListener('DOMContentLoaded', () => {
  const saveButton = document.querySelector('.save-button');
  const hostInput = document.getElementById('redis-host') as HTMLInputElement;
  const portInput = document.getElementById('redis-port') as HTMLInputElement;

  if (saveButton && hostInput && portInput) {
    saveButton.addEventListener('click', async () => {
      const host = hostInput.value;
      const port = parseInt(portInput.value);
      const isConnect: boolean = await window.electronAPI.saveSetting(host, port);

      const modal = document.createElement('div');
      modal.className = 'modal';

      const modalContent = document.createElement('div');
      modalContent.className = 'modal-content';
      modalContent.textContent = isConnect ? 'Settings saved successfully!' : 'Failed to save settings.';

      modal.appendChild(modalContent);
      document.body.appendChild(modal);

      setTimeout(() => modal.remove(), 750);
    });
  }
});