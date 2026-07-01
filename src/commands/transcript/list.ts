import { existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { getTranscriptConfig } from "../../shared/loadConfig";

export function list(): void {
	const { vttDir } = getTranscriptConfig();
	if (!existsSync(vttDir)) return;

	for (const entry of readdirSync(vttDir)) {
		if (!entry.endsWith(".vtt")) continue;
		if (statSync(join(vttDir, entry)).isDirectory()) continue;
		console.log(entry);
	}
}
