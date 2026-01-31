export async function getApiKeys(): Promise<{
  groqApiKey: string;
  geminiApiKey: string;
}> {
  return new Promise((resolve) => {
    chrome.storage.sync.get(["groqApiKey", "geminiApiKey"], (result) => {
      resolve({
        groqApiKey: result.groqApiKey || import.meta.env.VITE_GROQ_API_KEY || "",
        geminiApiKey: result.geminiApiKey || import.meta.env.VITE_GEMINI_API_KEY || "",
      });
    });
  });
}

export async function saveApiKeys(
  groqApiKey: string,
  geminiApiKey: string
): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.sync.set({ groqApiKey, geminiApiKey }, () => {
      resolve();
    });
  });
}
