import type { BaseRepoMode } from "./resolveBaseRepo";
import { viewCurrentPr } from "./shared";

export function findCurrentPr(baseRepo?: BaseRepoMode): {
	number: number;
	state: "OPEN" | "CLOSED" | "MERGED";
} | null {
	try {
		return viewCurrentPr("number,state", baseRepo);
	} catch (error) {
		if (error instanceof Error && error.message.includes("no pull requests")) {
			return null;
		}
		throw error;
	}
}
