import path from "node:path";
import type { Anchoring, AnchorMode } from "./types";

export function anchored(
	files: string[],
	mode: AnchorMode,
	reasonPrefix: string,
): Anchoring {
	return {
		root: false,
		anchors: files.map((file) => ({ file, mode })),
		reason: `${reasonPrefix} ${files.map((f) => path.basename(f)).join(", ")}`,
	};
}
