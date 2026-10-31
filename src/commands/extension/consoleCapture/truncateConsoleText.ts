import { CONSOLE_MAX_TEXT_LENGTH } from "./types";

export function truncateConsoleText(text: string): string {
	if (text.length <= CONSOLE_MAX_TEXT_LENGTH) return text;
	return `${text.slice(0, CONSOLE_MAX_TEXT_LENGTH - 1)}…`;
}
