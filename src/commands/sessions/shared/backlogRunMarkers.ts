// `assist backlog run` sessions carry no command markers; the item id and
// title live in the phase prompt. why: synthesizing a /next marker lets them
// reuse the same next-type + #id chips and title as their live activity card.
export function backlogRunMarkers(text: string): {
	commandName: string;
	commandArgs: string;
} {
	const match = text.match(/backlog item a(\d+):[ \t]*([^\n]*)/);
	if (!match) return { commandName: "", commandArgs: "" };
	const title = match[2].trim();
	return {
		commandName: "next",
		commandArgs: title ? `${match[1]} ${title}` : match[1],
	};
}
