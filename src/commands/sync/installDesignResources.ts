import * as fs from "node:fs";
import * as path from "node:path";
import type { Harness } from "../../shared/harnesses";
import type { SyncFiles } from "./createSyncFiles";
import { designSkillToNative } from "./designSkillToNative";
import { markdownNames } from "./markdownNames";

export function installDesignResources(
	claudeDir: string,
	harness: Harness,
	files: SyncFiles,
): string[] {
	const { homeDir, sync } = harness;
	files.write(
		path.join(homeDir, sync.designPromptDest),
		fs.readFileSync(path.join(claudeDir, "design-system-prompt.md"), "utf8"),
	);

	const skillsSource = path.join(claudeDir, "skills");
	const names = markdownNames(skillsSource);
	for (const name of names) {
		const content = fs.readFileSync(
			path.join(skillsSource, `${name}.md`),
			"utf8",
		);
		files.write(
			path.join(homeDir, sync.designSkillDest(name)),
			sync.nativeDesignSkills ? designSkillToNative(name, content) : content,
		);
	}
	return names;
}
