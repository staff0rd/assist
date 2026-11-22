import { existsSync } from "node:fs";
import { gitResult } from "./git";

export async function liveItemTreeHead(
	itemTree: string | undefined,
): Promise<string | undefined> {
	if (!itemTree || !existsSync(itemTree)) return undefined;
	const head = await gitResult(itemTree, ["rev-parse", "HEAD"]);
	return head.ok && head.out ? head.out : undefined;
}
