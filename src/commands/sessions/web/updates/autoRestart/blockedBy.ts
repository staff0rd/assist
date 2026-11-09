import {
	type AutoRestartInput,
	autoRestartBlocker,
} from "./autoRestartBlocker";

export function blockedBy(
	snap: AutoRestartInput & { built: string },
	attempted: string | undefined,
	now: number,
): string | undefined {
	if (attempted === snap.built) return "already attempted";
	return autoRestartBlocker(snap, now);
}
