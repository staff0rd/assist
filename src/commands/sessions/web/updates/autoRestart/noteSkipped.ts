import type { AutoRestartTarget } from "./autoRestartTarget";

type Note = (message: string | undefined, wait?: string) => void;

export function noteSkipped(
	note: Note,
	target: AutoRestartTarget,
	built: string,
	blocker: string | undefined,
): boolean {
	if (!blocker) return false;
	note(`skipped ${target} restart for v${built}: ${blocker}`, blocker);
	return true;
}
