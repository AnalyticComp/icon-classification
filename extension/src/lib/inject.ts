import invariant from "tiny-invariant";

/**
 * injects a content script into the current tab.
 *
 * @param path to content script
 */
export async function injectContentScript(file: string) {
  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });

  invariant(tab.id, "tab.id is undefined");

  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: [file],
  });
}
