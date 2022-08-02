import * as tf from "@tensorflow/tfjs";
import { rgbToGrayscale } from "../lib/mlUtils";

export type ClassificationResults = {
  /**
   * probabilities for each class (sorted in descending order)
   */
  probabilities: {
    className: string;
    classIndex: number;
    probability: number;
  }[];
  /**
   * inference statistics
   */
  statistics: {
    inferenceTime: number;
  };
};

/**
 * A Convolutional Neural Network (CNN) model for image classification.
 */
export class CNN {
  private readonly url: string;
  private model: tf.LayersModel | null = null;
  private readonly inputeShape: [number, number, number];
  private readonly classNames: string[];

  /**
   * @param url url to a `model.json` file of a layers model
   * @param inputShape the required input shape of the model. must be [height, width, channels].
   * @param classNames the display names for the classes
   */
  constructor(
    url: string,
    inputShape: [number, number, number],
    classNames: string[]
  ) {
    this.url = url;
    this.inputeShape = inputShape;
    this.classNames = classNames;
  }

  /**
   * downloads and caches the model.
   */
  async loadModel() {
    if (this.model) {
      return;
    }

    console.log(`downloading model from ${this.url}`);
    const tStart = Date.now();
    this.model = await tf.loadLayersModel(this.url);
    const tEnd = Date.now();
    const duration = tEnd - tStart;
    console.log(`model downloaded in ${duration}ms`);
  }

  /**
   * classifies an image.
   *
   * @param image image as a 3D tensor. must have values in [0, 255] and have either 1 or 3 color channels.
   * the image will be resized to fit the model's input shape including conversion from grayscale to rgb and vice versa.
   * @param debugCanvas if provided, the image tensor will be drawn on this canvas right before inference.
   */
  async classify(
    image: tf.Tensor3D,
    debugCanvas?: HTMLCanvasElement
  ): Promise<ClassificationResults> {
    if (!this.model) {
      await this.loadModel();
    }

    // if the image size is not the same as the model's input shape, resize it
    if (
      image.shape[0] !== this.inputeShape[0] ||
      image.shape[1] !== this.inputeShape[1]
    ) {
      console.warn(
        `expected image to have size ${this.inputeShape[0]}x${this.inputeShape[1]} but got ${image.shape[0]}x${image.shape[1]}, resizing`
      );
      image = tf.image.resizeBilinear(image, [
        this.inputeShape[0],
        this.inputeShape[1],
      ]);
    }

    // if cnn needs grayscale input but image is rgb, convert it
    if (this.inputeShape[2] === 1 && image.shape[2] === 3) {
      console.warn(
        "expected image to have 1 color channel but got 3, converting to grayscale"
      );
      image = rgbToGrayscale(image);
    }
    // if cnn needs color input but image is grayscale, convert it
    else if (this.inputeShape[2] === 3 && image.shape[2] === 1) {
      console.warn(
        "expected image to have 3 color channels but got 1, converting to rgb"
      );
      image = tf.image.grayscaleToRGB(image);
    }

    // if debug canvas is provided, draw the final tensor on it
    if (debugCanvas) {
      tf.browser.toPixels(image, debugCanvas);
    }

    // rescale image from [0,255] to [-1, 1] and add a batch dimension
    const batch = image
      .mul(1 / 127.5)
      .sub(1)
      .expandDims(0);

    // run inference
    const tStart = Date.now();
    const logits = (await this.model!.predict(batch)) as tf.Tensor2D;
    const tEnd = Date.now();
    const inferenceTime = tEnd - tStart;

    // the network returns logits so we need to manually apply a softmax activation function to obtain probabilities
    const softmax = await tf.softmax(logits).data();

    // format results
    const probabilities = Array.from(softmax)
      .map((p, i) => ({
        classIndex: i,
        className: this.classNames[i],
        probability: p,
      }))
      .sort((a, b) => b.probability - a.probability);

    const statistics = {
      inferenceTime,
    };

    return { statistics, probabilities };
  }
}
