/* why: a preview command hands its stdin payload to the daemon's re-run, but by
 * the time it reaches the preview the command has already drained stdin. */
export const capturedStdin: { text?: string } = {};
