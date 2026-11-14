import { formatItemId } from "../formatItemId";

type CheckInput = {
	uiStoryIds: number[];
	mappings: Map<number, string[]>;
	declared: Set<string>;
	changed: Set<string>;
};

export function checkStoryScreenshots({
	uiStoryIds,
	mappings,
	declared,
	changed,
}: CheckInput): string[] {
	const problems = [...mappings.keys()]
		.filter((id) => !uiStoryIds.includes(id))
		.map((id) => `${formatItemId(id)} is not a covered UI story`);
	for (const id of uiStoryIds) {
		const files = mappings.get(id) ?? [];
		const story = formatItemId(id);
		if (files.length === 0) {
			problems.push(
				`${story} has no screenshot (pass --story ${story}=<file.png>)`,
			);
			continue;
		}
		for (const file of files) {
			if (!declared.has(file))
				problems.push(
					`${story}: ${file} is not declared in any docs page's screenshots`,
				);
			else if (!changed.has(file))
				problems.push(
					`${story}: ${file} was not added or recaptured (unchanged per git status)`,
				);
		}
	}
	return problems;
}
