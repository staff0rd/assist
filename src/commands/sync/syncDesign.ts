import * as fs from "node:fs";
import * as path from "node:path";
import type { SyncFiles } from "./createSyncFiles";

export function syncDesign(
	agentDir: string,
	targetBase: string,
	files: SyncFiles,
): string[] {
	files.write(
		path.join(targetBase, "design-system-prompt.md"),
		fs.readFileSync(path.join(agentDir, "design-system-prompt.md"), "utf8"),
	);
	console.log(
		"Copied design-system-prompt.md to ~/.claude/design-system-prompt.md",
	);

	const skillsSource = path.join(agentDir, "skills");
	const skillsTarget = path.join(targetBase, "skills");

	const entries = fs
		.readdirSync(skillsSource, { withFileTypes: true })
		.filter(
			(entry) =>
				!entry.isDirectory() ||
				fs.existsSync(path.join(skillsSource, entry.name, "SKILL.md")),
		);
	for (const entry of entries) {
		const source = path.join(skillsSource, entry.name);
		const target = path.join(skillsTarget, entry.name);
		if (entry.isDirectory()) {
			files.copyDir(source, target);
		} else {
			files.write(target, fs.readFileSync(source, "utf8"));
		}
	}

	console.log(`Synced ${entries.length} skill(s) to ~/.claude/skills`);

	return entries.map((entry) => entry.name);
}
