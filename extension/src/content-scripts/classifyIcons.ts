import { CNN } from "../lib/cnn";
import { findAllIcons, iconElementToCanvas } from "../lib/domUtils";
import classNames from "../lib/classNames.json";
import * as tf from "@tensorflow/tfjs";
import ProgressBar from "@badrap/bar-of-progress";
import { timeout } from "../lib/timeout";

const INPUT_SHAPE = [96, 96, 3] as [number, number, number];

// progress bar at the top of the screen
const progress = new ProgressBar({
  color: "#4f46e5",
  delay: 0,
});

async function main() {
  const cnnPrimary = new CNN(
    chrome.runtime.getURL("/assets/isc_cnn_primary/model.json"),
    INPUT_SHAPE,
    classNames.primary
  );

  const cnnSecondary = new CNN(
    chrome.runtime.getURL("/assets/isc_cnn_secondary/model.json"),
    INPUT_SHAPE,
    classNames.secondary
  );

  await Promise.all([cnnPrimary.loadModel(), cnnSecondary.loadModel()]);

  const icons = findAllIcons();
  console.log(`classifying ${icons.length} icons`);

  progress.start();
  // give the progress bar some time to animate before the main thread is blocked by html2canvas, canvg and tensorflow
  await timeout(200);

  const tStart = Date.now();

  await Promise.all(
    icons.map(async (icon) => {
      // skip labeling if accessibility label is already set
      if (icon.getAttribute("aria-label") !== null) {
        console.log(`skipping icon ${icon} as it already has an aria-label`);
        return;
      }

      // convert icon to tensor
      const canvas = await iconElementToCanvas(icon, {
        resolution: INPUT_SHAPE[0],
      });
      const image = tf.browser.fromPixels(canvas);

      const [
        {
          probabilities: [primaryPrediction],
        },
        {
          probabilities: [secondaryPrediction],
        },
      ] = await Promise.all([
        cnnPrimary.classify(image),
        cnnSecondary.classify(image),
      ]);

      const primaryLabel = primaryPrediction.className;
      const secondaryLabel = secondaryPrediction.className;

      let label: string;
      if (primaryLabel === secondaryLabel || secondaryLabel === "other") {
        label = primaryLabel;
      } else {
        label = `${secondaryLabel} ${primaryLabel}`;
      }
      icon.setAttribute("aria-label", label);

      // attach a more detailed label as a data attribute including the prediction probabilities
      const detailedLabel = `PRIMARY ${
        primaryPrediction.className
      }[${primaryPrediction.probability.toFixed(2)}]; SECONDARY ${
        secondaryPrediction.className
      }[${secondaryPrediction.probability.toFixed(2)}]`;
      icon.setAttribute("data-isc", detailedLabel);
    })
  );

  progress.finish();
  const tEnd = Date.now();
  const duration = (tEnd - tStart) / 1000;
  console.log(
    `finished classifying ${icons.length} icons in ${duration.toFixed(2)}s`
  );
}

main().catch((error) => console.error(error));
