/** A run's closing message as plain text: no markdown markers or table rows. */
export function plainSummary(message: string): string {
	return message
		.split("\n")
		.filter((line) => !line.trim().startsWith("|"))
		.join(" ")
		.replace(/\*\*|`/g, "")
		.replace(/\s+/g, " ")
		.trim();
}
