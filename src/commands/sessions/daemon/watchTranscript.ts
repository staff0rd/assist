import { watch } from "node:fs";
import type { Session } from "./createSession";
import { daemonLog } from "./daemonLog";
import { ensureProjectDirExists } from "./ensureProjectDirExists";
import { reconcileTranscriptStatus } from "./reconcileTranscriptStatus";
import { startTranscriptTitleGeneration } from "./startTranscriptTitleGeneration";
import type { OnStatusChange } from "./types";
import { unwatchTranscript } from "./unwatchTranscript";
import { watchedConversation } from "./watchedConversation";

const DEBOUNCE_MS = 100;

export function watchTranscript(
	session: Session,
	notify: () => void,
	onStatusChange: OnStatusChange,
): void {
	if (!session.cwd) return;
	const conversation = watchedConversation(session);
	if (!conversation || session.watchedTranscriptId === conversation.key) return;

	const target = conversation.reader.watchTarget(conversation.ref);
	if (!target || !ensureProjectDirExists(target.dir, session.id)) return;

	unwatchTranscript(session);

	let timer: ReturnType<typeof setTimeout> | null = null;
	const run = () => {
		timer = null;
		void reconcileTranscriptStatus(session, onStatusChange, notify);
		startTranscriptTitleGeneration(session, notify);
	};

	try {
		session.transcriptWatcher = watch(target.dir, (_event, changed) => {
			if (changed && changed !== target.file) return;
			if (timer) clearTimeout(timer);
			timer = setTimeout(run, DEBOUNCE_MS);
		});
	} catch (error) {
		daemonLog(
			`session ${session.id} transcript watch failed: ${error instanceof Error ? error.message : String(error)}`,
		);
		return;
	}
	session.watchedTranscriptId = conversation.key;
	daemonLog(`session ${session.id} watching transcript ${target.file}`);
	run();
}
