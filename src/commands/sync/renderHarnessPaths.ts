import * as os from "node:os";
import * as path from "node:path";
import type { Harness } from "../../shared/harnesses";

function homePath(harness: Harness, dest: string): string {
	const relative = path.relative(
		os.homedir(),
		path.join(harness.homeDir, dest),
	);
	return `~/${relative.split(path.sep).join("/")}`;
}

export function renderHarnessPaths(content: string, harness: Harness): string {
	const { sync } = harness;
	return content
		.replaceAll(
			"{{design.systemPrompt}}",
			homePath(harness, sync.designPromptDest),
		)
		.replaceAll(
			"{{design.skill}}",
			homePath(harness, sync.designSkillDest("<name>")),
		)
		.replace(/\{\{skill:([a-z0-9-]+)\}\}/g, (_match, name: string) =>
			homePath(harness, sync.commandDest(name)),
		);
}
