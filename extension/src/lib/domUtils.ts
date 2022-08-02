import html2canvas from "html2canvas";
import { Canvg } from "canvg";

/* -------------------------------------------------------------------------- */

/**
 * highlights an icon by applying a red background color and box shadow.
 */
export function highlight(el: HTMLElement) {
  el.style.backgroundColor = "#f00";
  // add a drop shadow so non-transparent icons are visible
  el.style.boxShadow = "0px 0px 10px 10px #f00";
}

/* -------------------------------------------------------------------------- */

/**
 * converts an svg element to a svg string.
 *
 * width, height, class and style attributes are removed.
 *
 * @param element svg element
 */
export function serializeSVGElement(element: HTMLElement) {
  const copy = element.cloneNode(true) as HTMLElement;
  copy.removeAttribute("width");
  copy.removeAttribute("height");
  copy.removeAttribute("class");
  copy.removeAttribute("style");
  return new XMLSerializer().serializeToString(copy);
}

/* -------------------------------------------------------------------------- */

type IconElementToCanvasOptions = {
  /**
   * canvas width and height
   */
  resolution: number;
  /**
   * fillColor (for svg elements only) (default: #000)
   */
  fillColor?: string;
  /**
   * background color (for svg elements only) (default: #999)
   */
  backgroundColor?: string;
};

/**
 * renders an icon element to a canvas.
 *
 * @param element icon element
 * @param options options
 */
export async function iconElementToCanvas(
  element: HTMLElement,
  options: IconElementToCanvasOptions
): Promise<HTMLCanvasElement> {
  const { resolution, fillColor = "#000", backgroundColor = "#999" } = options;

  const tagName = element.tagName.toLowerCase();

  // use html2canvas for images and icon fonts
  if (tagName === "img" || tagName === "i") {
    // set the scaling factor so the internal resolution of the canvas matches the given target resolution
    const width = element.clientWidth;
    const height = element.clientHeight;
    const largestDimension = Math.max(width, height);
    const scalingFactor = resolution / largestDimension;

    return await html2canvas(element, {
      // for images
      useCORS: true,
      width,
      height,
      scale: scalingFactor,
    });
  }
  // use canvg over html2canvas if element is an svg as it has better support for the svg standard
  // and allows us to set the fill and background color
  else if (tagName === "svg") {
    const svgString = serializeSVGElement(element);
    const canvas = document.createElement("canvas");
    canvas.width = resolution;
    canvas.height = resolution;

    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("Could not get canvas context.");
    }

    ctx.fillStyle = backgroundColor;
    ctx.rect(0, 0, resolution, resolution);
    ctx.fill();

    ctx.fillStyle = fillColor;

    const v = Canvg.fromString(ctx, svgString, {
      ignoreAnimation: true,
      ignoreDimensions: true,
      ignoreClear: true,
    });
    await v.render();

    return canvas;
  }
  throw new Error(
    `Unsupported element. Only svg, img, and i are supported, got ${tagName}.`
  );
}

/* -------------------------------------------------------------------------- */

/**
 * finds and returns all icons within the document.
 */
export function findAllIcons(): HTMLElement[] {
  const selector = "svg, img, i";

  return [...document.querySelectorAll(selector)].filter((el) => {
    const aspectRatio = el.clientWidth / el.clientHeight;
    return (
      el.clientWidth <= 75 &&
      el.clientHeight <= 75 &&
      (aspectRatio > 0.5 || aspectRatio < 2)
    );
  }) as any;
}
