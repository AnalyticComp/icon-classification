import * as tf from "@tensorflow/tfjs";

/**
 * converts an image tensor [height, width, 3] to [height, width, 1].
 *
 * @param image image tensor
 */
export function rgbToGrayscale(image: tf.Tensor3D): tf.Tensor3D {
  const [height, width, channels] = image.shape;
  if (channels !== 3) {
    throw new Error(
      `Expected image tensor to have 3 channels but got ${channels}.`
    );
  }
  return tf.tidy(() => {
    const [r, g, b] = image.split(3, 2);
    return tf
      .mul(r, tf.scalar(0.299))
      .add(tf.mul(g, tf.scalar(0.587)))
      .add(tf.mul(b, tf.scalar(0.114)))
      .reshape([height, width, 1]);
  });
}
