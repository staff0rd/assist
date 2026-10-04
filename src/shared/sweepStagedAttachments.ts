import { readdirSync, rmSync, statSync } from "node:fs";
import { join } from "node:path";
import { stagedAttachmentsDir } from "./stagedAttachmentsDir";

const PANE_PERSIST_TTL_MS = 24 * 60 * 60 * 1000;

export function sweepStagedAttachments(
	dir = stagedAttachmentsDir,
	now = Date.now(),
): void {
	let entries: string[];
	try {
		entries = readdirSync(dir);
	} catch {
		return;
	}
	for (const name of entries) {
		if (!name.startsWith("upload-")) continue;
		const path = join(dir, name);
		try {
			if (now - statSync(path).mtimeMs > PANE_PERSIST_TTL_MS)
				rmSync(path, { recursive: true, force: true });
		} catch {}
	}
}
