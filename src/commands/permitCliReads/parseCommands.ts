// Matches section headers like "Commands:", "CORE COMMANDS", "Subgroups:", etc.
const COMMAND_SECTION_RE =
	/^((?:core |general |available |additional |other |management |targeted |alias |github actions )?(?:commands|subgroups)):?$/i;

function isSkippable(name: string): boolean {
	return name.startsWith("-") || name.startsWith("<") || name.startsWith("[");
}

function parseCommandLine(
	trimmed: string,
): { name: string; description: string } | undefined {
	// Format: "name  [tag] : description" (az-style, tag + colon-space)
	const azMatch = trimmed.match(/^(\S+)\s+(?:\[.*?]\s+)?:\s*(.+)/);
	if (azMatch && !isSkippable(azMatch[1])) {
		return { name: azMatch[1], description: azMatch[2].trim() };
	}
	// Format: "name:  Description" (gh-style, colon after name)
	const colonMatch = trimmed.match(/^(\S+?):\s{2,}(.+)/);
	if (colonMatch && !isSkippable(colonMatch[1])) {
		return { name: colonMatch[1], description: colonMatch[2].trim() };
	}
	// Format: "name    Description" (standard, space-separated)
	const spaceMatch = trimmed.match(/^(\S+)(?:,\s*\S+)?\s{2,}(.+)/);
	if (spaceMatch && !isSkippable(spaceMatch[1])) {
		return { name: spaceMatch[1], description: spaceMatch[2].trim() };
	}
	// Bare command name with no description
	if (/^\S+$/.test(trimmed) && !isSkippable(trimmed)) {
		return { name: trimmed, description: "" };
	}
	return undefined;
}

export function parseCommands(
	helpText: string,
): { name: string; description: string }[] {
	const commands: { name: string; description: string }[] = [];
	let inCommandSection = false;

	for (const line of helpText.split("\n")) {
		const trimmed = line.trim();

		if (COMMAND_SECTION_RE.test(trimmed)) {
			inCommandSection = true;
			continue;
		}

		if (
			inCommandSection &&
			trimmed &&
			!line.startsWith(" ") &&
			!line.startsWith("\t")
		) {
			inCommandSection = false;
			continue;
		}

		if (!inCommandSection || !trimmed) continue;
		if (trimmed.startsWith("-") || trimmed.startsWith("=")) continue;

		const parsed = parseCommandLine(trimmed);
		if (parsed) commands.push(parsed);
	}

	return commands;
}

const COMMAND_SECTION_MULTILINE_RE = new RegExp(
	COMMAND_SECTION_RE.source,
	"im",
);

export function hasSubcommands(helpText: string): boolean {
	return COMMAND_SECTION_MULTILINE_RE.test(helpText);
}
