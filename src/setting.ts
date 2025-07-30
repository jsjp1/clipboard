window.addEventListener('DOMContentLoaded', () => {
  const saveButton = document.querySelector('.save-button');
  const hostInput = document.getElementById('redis-host') as HTMLInputElement;
  const portInput = document.getElementById('redis-port') as HTMLInputElement;

  if (saveButton && hostInput && portInput) {
    saveButton.addEventListener('click', () => {
      const host = hostInput.value;
      const port = parseInt(portInput.value);
      window.electronAPI.saveSetting(host, port);
    });
  }
});