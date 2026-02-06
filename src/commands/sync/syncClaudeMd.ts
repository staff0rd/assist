import * as fs from "node:fs";
import * as path from "node:path";
import chalk from "chalk";
import { promptConfirm } from "../../shared/promptConfirm";
import { printDiff } from "../../utils/printDiff";

export async function syncClaudeMd(
	claudeDir: string,
	targetBase: string,
): Promise<void> {
	const source = path.join(claudeDir, "CLAUDE.md");
	const target = path.join(targetBase, "CLAUDE.md");
	const sourceContent = fs.readFileSync(source, "utf-8");

	if (fs.existsSync(target)) {
		const targetContent = fs.readFileSync(target, "utf-8");
		if (sourceContent !== targetContent) {
			console.log(
				chalk.yellow("\n⚠️  Warning: CLAUDE.md differs from existing file"),
			);
			console.log();
			printDiff(targetContent, sourceContent);

			const confirm = await promptConfirm(
				chalk.red("Overwrite existing CLAUDE.md?"),
				false,
			);

			if (!confirm) {
				console.log("Skipped CLAUDE.md");
				return;
			}
		}
	}

	fs.copyFileSync(source, target);
	console.log("Copied CLAUDE.md to ~/.claude/CLAUDE.md");
}
