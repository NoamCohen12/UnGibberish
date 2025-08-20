// Service worker for UnGibberish

const CONTEXT_MENU_FIX_ID = "ug-fix-layout";

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: CONTEXT_MENU_FIX_ID,
    title: "UnGibberish: Fix layout",
    contexts: ["editable"]
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId !== CONTEXT_MENU_FIX_ID || !tab?.id) return;
  await triggerFixInActiveTab(tab.id);
});

chrome.commands.onCommand.addListener(async (command) => {
  if (command !== "fix-layout") return;
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return;
  await triggerFixInActiveTab(tab.id);
});

async function triggerFixInActiveTab(tabId) {
  try {
    await chrome.tabs.sendMessage(tabId, { type: "UG_FIX_LAYOUT" });
  } catch (err) {
    try {
      await chrome.scripting.executeScript({
        target: { tabId },
        files: ["src/mapping.js", "src/content.js"]
      });
      await chrome.tabs.sendMessage(tabId, { type: "UG_FIX_LAYOUT" });
    } catch (e) {
      console.warn("UnGibberish: failed to trigger fix", e);
    }
  }
}


