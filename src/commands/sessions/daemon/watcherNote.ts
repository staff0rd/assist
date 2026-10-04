export function watcherNote(text: string): string {
	return `\r\n\x1b[2m── ${text} ──\x1b[0m\r\n`;
}
