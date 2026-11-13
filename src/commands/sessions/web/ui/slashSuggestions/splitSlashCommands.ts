import type { SlashCommand } from "../../slashCommands/readSlashCommands";

type SlashTextSegment = {
	text: string;
	start: number;
	command: boolean;
};

const slashWord = /(^|\s)(\/[^\s/]+)(?=\s|$)/g;
const trailingPunctuation = /[.,;:!?)]+$/;

export function splitSlashCommands(
	text: string,
	commands: SlashCommand[],
): SlashTextSegment[] {
	const names = new Set(commands.map((c) => c.name.toLowerCase()));
	const segments: SlashTextSegment[] = [];
	let from = 0;
	if (names.size > 0)
		for (const match of text.matchAll(slashWord)) {
			const word = match[2].replace(trailingPunctuation, "");
			if (!names.has(word.slice(1).toLowerCase())) continue;
			const start = match.index + match[1].length;
			if (start > from)
				segments.push({
					text: text.slice(from, start),
					start: from,
					command: false,
				});
			segments.push({ text: word, start, command: true });
			from = start + word.length;
		}
	if (from < text.length || segments.length === 0)
		segments.push({ text: text.slice(from), start: from, command: false });
	return segments;
}
