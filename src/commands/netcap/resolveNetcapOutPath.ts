import { isAbsolute, join, resolve } from "node:path";
import { defaultCapturePath } from "./defaultCapturePath";

/**
 * Resolve the capture file path. `--out` names a directory (relative to cwd or
 * absolute); the capture file is always `capture.jsonl` inside it. Without it,
 * fall back to the default path under the home directory.
 */
export function resolveNetcapOutPath(out: string | undefined): string {
	if (!out) return defaultCapturePath();
	const dir = isAbsolute(out) ? out : resolve(process.cwd(), out);
	return join(dir, "capture.jsonl");
}
