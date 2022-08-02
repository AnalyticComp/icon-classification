import { injectContentScript } from "../lib/inject";

// register keyboard shortcut listener
chrome.commands.onCommand.addListener((command) => {
  console.log(`received command: "${command}"`);
  if (command === "highlightIcons") {
    injectContentScript("content-scripts/highlightIcons.js");
  }
  if (command === "classifyIcons") {
    injectContentScript("content-scripts/classifyIcons.js");
  }
});

console.log("background script registered");
