import chalk from "chalk";
import type { SeqEvent } from "./types";

function levelColor(level: string): (text: string) => string {
	switch (level) {
		case "Fatal":
			return chalk.bgRed.white;
		case "Error":
			return chalk.red;
		case "Warning":
			return chalk.yellow;
		case "Information":
			return chalk.cyan;
		case "Debug":
			return chalk.gray;
		case "Verbose":
			return chalk.dim;
		default:
			return chalk.white;
	}
}

function levelAbbrev(level: string): string {
	switch (level) {
		case "Fatal":
			return "FTL";
		case "Error":
			return "ERR";
		case "Warning":
			return "WRN";
		case "Information":
			return "INF";
		case "Debug":
			return "DBG";
		case "Verbose":
			return "VRB";
		default:
			return level.slice(0, 3).toUpperCase();
	}
}

function renderMessage(event: SeqEvent): string {
	const props = Object.fromEntries(
		event.Properties.map((p) => [p.Name, p.Value]),
	);
	return event.MessageTemplateTokens.map((t) => {
		if ("Text" in t) return t.Text;
		const val = props[t.PropertyName];
		return val !== undefined ? String(val) : `{${t.PropertyName}}`;
	}).join("");
}

function formatTimestamp(iso: string): string {
	const d = new Date(iso);
	return d.toLocaleTimeString("en-AU", {
		hour12: false,
		fractionalSecondDigits: 3,
	});
}

export function formatEvent(event: SeqEvent): string {
	const color = levelColor(event.Level);
	const abbrev = levelAbbrev(event.Level);
	const ts = chalk.dim(formatTimestamp(event.Timestamp));
	const msg = renderMessage(event);

	const lines = [`${ts} ${color(`[${abbrev}]`)} ${msg}`];

	if (event.Exception) {
		for (const line of event.Exception.split("\n")) {
			lines.push(chalk.red(`  ${line}`));
		}
	}

	return lines.join("\n");
}
