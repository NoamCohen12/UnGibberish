document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('fixBtn');
  btn?.addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) return;
    try {
      await chrome.tabs.sendMessage(tab.id, { type: 'UG_FIX_LAYOUT' });
    } catch (e) {
      try {
        await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: [
          'src/mapping.js', 'src/content.js'
        ]});
        await chrome.tabs.sendMessage(tab.id, { type: 'UG_FIX_LAYOUT' });
      } catch (err) {
        console.warn('UnGibberish: could not trigger fix', err);
      }
    }
    window.close();
  });
});


