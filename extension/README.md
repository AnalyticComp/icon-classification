# Web Extension

## Project Overview

```
.
├── README.md
├── assets           # assets are copied to the dist folder during build
├── manifest.json    # web extension manifest v3
├── package.json     # javascript module dependencies
└── src
    ├── background         # background service worker that listens for keyboard shortcuts
    ├── content-scripts    # content scripts that are injected into the webpage and highlight or classify icons
    ├── lib                # shared code
    └── popup              # extension control pane that can be used to trigger icon classification
```

## Prerequisites

- Google Chrome 103 or higher
- Node.JS 16 or higher

## Installation

Install required dependencies:

```sh
npm install
```

Transpile source code, bundle dependencies and copy necessary files:

```sh
npm run build

# Optionally, the watch mode can be used to automatically rerun esbuild when a TypeScript file changes:
npm run build:watch
```

The output of the above is a `dist` directory with all necessary files to install the extension.

Now the extension can be loaded in the Chrome developer settings:

1. Visit `chrome://extensions`.
2. Enable "Developer Mode" using the toggle in the top right corner.
3. Load the `dist` directory via the "Load unpacked" button in the top left corner.

Further information on how to load browser extensions in development mode is available at [https://developer.chrome.com/docs/extensions/mv3/getstarted/#unpacked](https://developer.chrome.com/docs/extensions/mv3/getstarted/#unpacked).

## Known Limitations

- The extension currently works best on sites that use svg or image based icons. Font-based icons are supported, but may not be recognized as reliably.
- The main thread is blocked while icons are rendered to canvas and converted to tensors. This can cause the website to be unresponsive for a few seconds.
