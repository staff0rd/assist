import type { SessionInfo } from "../../../../types";
import { useRunShellCommand } from "../TranscriptArea/useRunShellCommand";
import { useShellMode } from "./useShellMode";
import { useStopRunningShell } from "./useStopRunningShell";

export function useComposerShell(session: SessionInfo) {
	const runShell = useRunShellCommand();
	const mode = useShellMode(Boolean(runShell));
	return {
		...mode,
		stopRunning: useStopRunningShell(session),
		run: (command: string) => {
			runShell?.(session.id, command);
			mode.leave();
		},
	};
}
