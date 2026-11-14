/* why: marks a claude the daemon drives through the SDK, whose next user
 * message the daemon can push, so commands and advice know a preview decision
 * can arrive as the agent's next turn instead of a background task's output. */
export const sdkAgentEnv = "ASSIST_SDK_AGENT";
