import * as fs from "node:fs";
import * as path from "node:path";

export function syncDesign(claudeDir: string, targetBase: string): void {
	const systemPromptSource = path.join(claudeDir, "system-prompt.md");
	const systemPromptTarget = path.join(targetBase, "system-prompt.md");
	fs.copyFileSync(systemPromptSource, systemPromptTarget);
	console.log("Copied system-prompt.md to ~/.claude/system-prompt.md");

	const skillsSource = path.join(claudeDir, "skills");
	const skillsTarget = path.join(targetBase, "skills");
	fs.mkdirSync(skillsTarget, { recursive: true });

	const files = fs.readdirSync(skillsSource);
	for (const file of files) {
		fs.copyFileSync(
			path.join(skillsSource, file),
			path.join(skillsTarget, file),
		);
	}

	console.log(`Synced ${files.length} design skill(s) to ~/.claude/skills`);
}
