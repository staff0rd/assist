import fs from "node:fs";

const REFACTOR_YML_PATH = "refactor.yml";

type IgnoreEntry = {
	file: string;
	commit: string;
	reason: string;
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
		} else if (trimmed.startsWith("commit:")) {
			currentEntry.commit = trimmed.replace("commit:", "").trim();
		} else if (trimmed.startsWith("reason:")) {
			currentEntry.reason = trimmed.replace("reason:", "").trim();
		}
	}

	if (currentEntry.file) {
		entries.push(currentEntry as IgnoreEntry);
	}

	return entries;
}

export function getIgnoredFiles(): Set<string> {
	const entries = parseRefactorYml();
	return new Set(entries.map((e) => e.file));
}
