import { parseItemId } from "./formatItemId";

export function refineItemId(
	assistArgs: string[] | undefined,
): number | undefined {
	if (assistArgs?.[0] !== "refine") return;
	const target = assistArgs.at(-1);
	if (!target || target === "refine" || target.startsWith("-")) return;
	try {
		return parseItemId(target);
	} catch {
		return undefined;
	}
}
