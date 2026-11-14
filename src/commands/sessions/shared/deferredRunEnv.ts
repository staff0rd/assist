/* why: set on the daemon's own run of a deferred command so it blocks for the
 * decision instead of handing itself back to the daemon. */
export const deferredRunEnv = "ASSIST_DEFERRED_RUN";
