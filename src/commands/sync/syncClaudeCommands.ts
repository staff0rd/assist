import * as fs from "node:fs";
import * as path from "node:path";
import { commandToSkill } from "./syncCodex";

function isSkillFlagged(content: string): boolean {
	const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
	return match ? /^skill:\s*true\s*$/m.test(match[1]) : false;
}

function replaceFileWithoutFollowingSymlink(
	file: string,
	content: string,
): void {
	fs.rmSync(file, { force: true });
	fs.writeFileSync(file, content);
}

function writeSkill(targetBase: string, name: string, content: string): void {
	const skillDir = path.join(targetBase, "skills", name);
	fs.mkdirSync(skillDir, { recursive: true });
	replaceFileWithoutFollowingSymlink(
		path.join(skillDir, "SKILL.md"),
		commandToSkill(name, content),
	);
	fs.rmSync(path.join(targetBase, "commands", `${name}.md`), { force: true });
	console.log(`Wrote ${name} as a skill to ${skillDir}`);
}

export function syncClaudeCommands(
	claudeDir: string,
	targetBase: string,
): string[] {
	const sourceDir = path.join(claudeDir, "commands");
	const targetDir = path.join(targetBase, "commands");

	fs.mkdirSync(targetDir, { recursive: true });

	const files = fs.readdirSync(sourceDir);
	for (const file of files) {
		const source = path.join(sourceDir, file);
		if (file.endsWith(".md")) {
			const content = fs.readFileSync(source, "utf8");
			if (isSkillFlagged(content)) {
				writeSkill(targetBase, path.basename(file, ".md"), content);
				continue;
			}
		}
		fs.copyFileSync(source, path.join(targetDir, file));
		console.log(`Copied ${file} to ${targetDir}`);
	}

	console.log(`Synced ${files.length} command(s) to ~/.claude`);

	return files;
}
