import { useRunShellCommand } from "../TranscriptArea/useRunShellCommand";
import { useShellMode } from "./useShellMode";

export function useComposerShell(sessionId: string) {
	const runShell = useRunShellCommand();
	const mode = useShellMode(Boolean(runShell));
	return {
		...mode,
		run: (command: string) => {
			runShell?.(sessionId, command);
			mode.leave();
		},
	};
}
