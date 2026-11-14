import { Marked, type Tokens } from "marked";
import type { SlashCommand } from "../../../../../../../../slashCommands/readSlashCommands";
import { splitSlashCommands } from "../../../../../../../slashSuggestions/splitSlashCommands";

const escapeHtml = (text: string) =>
	text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const chipText = (text: string, commands: SlashCommand[]) =>
	splitSlashCommands(text, commands)
		.map((s) =>
			s.command
				? `<span class="slash-chip">${escapeHtml(s.text)}</span>`
				: escapeHtml(s.text),
		)
		.join("");

function createMarked(commands: SlashCommand[], breaks: boolean) {
	return new Marked({
		breaks,
		renderer: {
			// Transcript text can quote untrusted content (web pages, files), so raw HTML is shown as text rather than injected.
			html(token: Tokens.HTML | Tokens.Tag) {
				return escapeHtml(token.text);
			},
			text(token: Tokens.Text | Tokens.Escape) {
				if ("tokens" in token && token.tokens) return false;
				if (commands.length === 0 || ("escaped" in token && token.escaped))
					return false;
				return chipText(token.text, commands);
			},
		},
	});
}

const plain = createMarked([], false);

export function renderTranscriptMarkdown(
	text: string,
	options?: { commands: SlashCommand[] },
): string {
	const markdown = options ? createMarked(options.commands, true) : plain;
	return markdown.parse(text) as string;
}
