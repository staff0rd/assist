import { requestDaemonReply } from "../daemon/requestDaemonReply";
import { capturedStdin } from "./capturedStdin";
import { deferredRunEnv } from "./deferredRunEnv";
import { defersPreviewWait } from "./defersPreviewWait";

type DeferReply = { accepted?: boolean };

/* why: a Claude (SDK) or daemon-hosted Codex session takes the decision as its
 * next user turn, so the daemon blocks on the preview in place of this process
 * and the agent ends its turn instead of waiting on a background task. */
export async function deferToDaemon(
	stdin: string | undefined = capturedStdin.text,
): Promise<boolean> {
	const sessionId = process.env.ASSIST_SESSION_ID;
	if (!sessionId || !defersPreviewWait() || process.env[deferredRunEnv] === "1")
		return false;
	const reply = await requestDaemonReply<DeferReply>(
		{
			type: "defer-command",
			sessionId,
			argv: process.argv.slice(2),
			stdin,
			cwd: process.cwd(),
			env: process.env,
		},
		"defer-command-result",
	);
	if (!reply?.accepted) return false;
	console.log(
		"The preview is open in the session's web preview pane. End your turn now and do nothing else: the user's decision will arrive as your next message.",
	);
	return true;
}
