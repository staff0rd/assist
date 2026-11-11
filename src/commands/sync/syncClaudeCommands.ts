import * as fs from "node:fs";
import * as path from "node:path";
import { harnesses } from "../../shared/harnesses";
import { commandToSkill } from "./commandToSkill";
import type { SyncFiles } from "./createSyncFiles";
import { markdownNames } from "./markdownNames";
import { renderHarnessPaths } from "./renderHarnessPaths";

export function syncClaudeCommands(
	claudeDir: string,
	targetBase: string,
	files: SyncFiles,
): string[] {
	const sourceDir = path.join(claudeDir, "commands");
	const names = markdownNames(sourceDir);

	for (const name of names) {
		const content = fs.readFileSync(path.join(sourceDir, `${name}.md`), "utf8");
		const rendered = renderHarnessPaths(content, harnesses.claude);
		files.write(
			path.join(targetBase, "skills", name, "SKILL.md"),
			commandToSkill(name, rendered),
		);
		files.remove(path.join(targetBase, "commands", `${name}.md`), [
			content,
			rendered,
		]);
	}

	console.log(
		`Synced ${names.length} skill(s) to ${path.join(targetBase, "skills")}`,
	);

	return names;
}
