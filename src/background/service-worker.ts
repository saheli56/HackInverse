chrome.runtime.onInstalled.addListener(() => {
  console.log("PlainTerms installed");
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "SCAN_PAGE") {
    handleScanRequest(sender.tab?.id);
  }

  if (message.type === "GET_API_KEYS") {
    chrome.storage.sync.get(["groqApiKey", "geminiApiKey"], (result) => {
      sendResponse({
        groqApiKey: result.groqApiKey || "",
        geminiApiKey: result.geminiApiKey || "",
      });
    });
    return true;
  }

  if (message.type === "SAVE_API_KEYS") {
    chrome.storage.sync.set({
      groqApiKey: message.groqApiKey,
      geminiApiKey: message.geminiApiKey,
    });
    sendResponse({ success: true });
  }
});

function handleScanRequest(tabId: number | undefined) {
  if (!tabId) return;

  chrome.tabs.sendMessage(tabId, {
    type: "START_SCAN",
  });
}

chrome.action.onClicked.addListener((tab) => {
  if (tab.id) {
    chrome.tabs.sendMessage(tab.id, {
      type: "TOGGLE_UI",
    });
  }
});
