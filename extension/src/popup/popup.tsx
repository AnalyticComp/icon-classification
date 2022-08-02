import React from "react";
import { createRoot } from "react-dom/client";
import clsx from "clsx";
import { injectContentScript } from "../lib/inject";

/**
 * Popup.
 */
function Popup() {
  const handleClickHighlight = () => {
    injectContentScript("content-scripts/highlightIcons.js");
  };

  const handleClickClassify = () => {
    injectContentScript("content-scripts/classifyIcons.js");
  };

  return (
    <div>
      <div className="py-4 px-4 border-b border-gray-700">
        <h1 className="text-base font-bold text-white">ISC</h1>
        <p className="text-xs mt-1">Extension (0.1.0)</p>
      </div>
      <div className="py-4 px-4">
        <div className="flex flex-col gap-4">
          <div>
            <h2 className="text-sm text-white font-bold">Actions</h2>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <Button className="col-span-2" onClick={handleClickHighlight}>
                Highlight Icons
              </Button>
              <Button onClick={handleClickClassify} className="col-span-2">
                Classify Icons
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * A styled button.
 */
function Button({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"button">) {
  return (
    <button
      {...props}
      className={clsx(
        "items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500",
        className
      )}
    />
  );
}

// mount the react app
const container = document.getElementById("app");
const root = createRoot(container as HTMLElement);
root.render(<Popup />);
