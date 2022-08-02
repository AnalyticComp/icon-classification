/**
 * async version of setTimeout.
 *
 * @param ms the delay in milliseconds
 */
export async function timeout(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
