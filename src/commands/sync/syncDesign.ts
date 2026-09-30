import * as fs from "node:fs";
import * as path from "node:path";

export function syncDesign(claudeDir: string, targetBase: string): void {
	const systemPromptSource = path.join(claudeDir, "design-system-prompt.md");
	const systemPromptTarget = path.join(targetBase, "design-system-prompt.md");
	fs.copyFileSync(systemPromptSource, systemPromptTarget);
	console.log(
		"Copied design-system-prompt.md to ~/.claude/design-system-prompt.md",
	);

	const skillsSource = path.join(claudeDir, "skills");
	const skillsTarget = path.join(targetBase, "skills");
	fs.mkdirSync(skillsTarget, { recursive: true });

	const entries = fs.readdirSync(skillsSource, { withFileTypes: true });
	for (const entry of entries) {
		const source = path.join(skillsSource, entry.name);
		const target = path.join(skillsTarget, entry.name);
		if (entry.isDirectory()) {
			fs.rmSync(target, { recursive: true, force: true });
			fs.cpSync(source, target, { recursive: true });
		} else {
			fs.copyFileSync(source, target);
		}
	}

	console.log(`Synced ${entries.length} skill(s) to ~/.claude/skills`);
}
