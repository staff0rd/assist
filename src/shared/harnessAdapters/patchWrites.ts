import { parseApplyPatch } from "./parseApplyPatch";
import type { ToolOperation } from "./types";

export function patchWrites(tool: string, patch: string): ToolOperation[] {
	return parseApplyPatch(patch).map(({ path, contents }) => ({
		kind: "fileWrite",
		tool,
		path,
		contents,
	}));
}
