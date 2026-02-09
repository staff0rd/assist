import fs from "node:fs";

const REFACTOR_YML_PATH = "refactor.yml";

type IgnoreEntry = {
	file: string;
	maxLines: number;
};

function parseRefactorYml(): IgnoreEntry[] {
	if (!fs.existsSync(REFACTOR_YML_PATH)) {
		return [];
	}

	const content = fs.readFileSync(REFACTOR_YML_PATH, "utf-8");
	const entries: IgnoreEntry[] = [];

	const lines = content.split("\n");
	let currentEntry: Partial<IgnoreEntry> = {};

	for (const line of lines) {
		const trimmed = line.trim();
		if (trimmed.startsWith("- file:")) {
			if (currentEntry.file) {
				entries.push(currentEntry as IgnoreEntry);
			}
			currentEntry = { file: trimmed.replace("- file:", "").trim() };
		} else if (trimmed.startsWith("maxLines:")) {
			currentEntry.maxLines = parseInt(
				trimmed.replace("maxLines:", "").trim(),
				10,
			);
		}
	}

	if (currentEntry.file) {
		entries.push(currentEntry as IgnoreEntry);
	}

	return entries;
}

export function getIgnoredFiles(): Map<string, number> {
	const entries = parseRefactorYml();
	return new Map(entries.map((e) => [e.file, e.maxLines]));
}
