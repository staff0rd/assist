import * as fs from "node:fs";
import * as path from "node:path";
import type { Harness } from "../../shared/harnesses";
import { designSkillToNative } from "./designSkillToNative";
import { markdownNames } from "./markdownNames";

export function installDesignResources(
	claudeDir: string,
	harness: Harness,
): string[] {
	const { homeDir, sync } = harness;
	const promptTarget = path.join(homeDir, sync.designPromptDest);
	fs.mkdirSync(path.dirname(promptTarget), { recursive: true });
	fs.copyFileSync(
		path.join(claudeDir, "design-system-prompt.md"),
		promptTarget,
	);

	const skillsSource = path.join(claudeDir, "skills");
	const names = markdownNames(skillsSource);
	for (const name of names) {
		const content = fs.readFileSync(
			path.join(skillsSource, `${name}.md`),
			"utf8",
		);
		const target = path.join(homeDir, sync.designSkillDest(name));
		fs.mkdirSync(path.dirname(target), { recursive: true });
		fs.writeFileSync(
			target,
			sync.nativeDesignSkills ? designSkillToNative(name, content) : content,
		);
	}
	return names;
}
