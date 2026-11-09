import { harnessAdapter } from "../../../shared/harnessAdapters/harnessAdapter";
import { claimedByOthers } from "./claimedByOthers";
import { completeBinding } from "./completeBinding";
import type { Session } from "./createSession";
import { daemonLog } from "./daemonLog";

const POLL_MS = 1000;
const MAX_ATTEMPTS = 120;
const START_SLACK_MS = 5000;

const latestBind = new WeakMap<Session, number>();

export function bindConversation(
	session: Session,
	notify: () => void,
	launchedAt: number = session.startedAt,
	onBound?: (session: Session) => void,
): void {
	const cwd = session.cwd;
	const adapter = harnessAdapter(session.harness);
	const discover = adapter.conversation.discover;
	if (!discover || !cwd || adapter.conversation.boundId(session)) return;

	const bind = (latestBind.get(session) ?? 0) + 1;
	latestBind.set(session, bind);
	const superseded = () =>
		!!adapter.conversation.boundId(session) || latestBind.get(session) !== bind;
	const sinceMs = launchedAt - START_SLACK_MS;
	let attemptsLeft = MAX_ATTEMPTS;

	const schedule = () => setTimeout(() => void poll(), POLL_MS).unref();
	const poll = async () => {
		if (superseded()) return;
		const conversationId = await discover({
			cwd,
			launchedAt,
			sinceMs,
			claimed: claimedByOthers(session),
		});
		if (superseded()) return;
		if (conversationId && !claimedByOthers(session).has(conversationId)) {
			const bound = { conversationId, harnessLabel: adapter.label };
			completeBinding(session, bound, notify, onBound);
		} else if (--attemptsLeft > 0) schedule();
		else
			daemonLog(
				`session ${session.id} found no ${adapter.label} conversation to bind`,
			);
	};

	schedule();
}
