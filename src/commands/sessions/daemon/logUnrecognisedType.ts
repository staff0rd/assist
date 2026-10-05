import { daemonLog } from "./daemonLog";

export function logUnrecognisedType(
	seen: Set<string>,
	prefix: string,
	type: unknown,
): void {
	const key = String(type);
	if (seen.has(key)) return;
	seen.add(key);
	daemonLog(`${prefix}ignoring unrecognised message type ${key} (logged once)`);
}
