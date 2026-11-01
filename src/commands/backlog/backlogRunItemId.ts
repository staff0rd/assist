import { parseItemId } from "./formatItemId";

export function backlogRunItemId(
	assistArgs: string[] | undefined,
): number | undefined {
	if (assistArgs?.[0] !== "backlog" || assistArgs[1] !== "run") return;
	if (!assistArgs[2]) return;
	try {
		return parseItemId(assistArgs[2]);
	} catch {
		return undefined;
	}
}
