import { daemonLog } from "../../commands/sessions/daemon/daemonLog";

export function codexRelocate(
	conversationId: string,
	fromCwd: string,
	toCwd: string,
): void {
	daemonLog(
		`Codex conversation ${conversationId} resumes in ${toCwd} from its rollout, which is stored by id rather than under ${fromCwd}`,
	);
}
