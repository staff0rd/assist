import { InvalidArgumentError } from "commander";

const MESSAGE_TS = /^\d{10}\.\d{6}$/;
const PERMALINK_TS = /\/archives\/[^/?#]+\/p(\d{10})(\d{6})\b/;
const PERMALINK_THREAD_TS = /[?&]thread_ts=(\d{10}\.\d{6})\b/;

export function parseSlackThreadRef(value: string): string {
	const trimmed = value.trim();
	if (MESSAGE_TS.test(trimmed)) return trimmed;

	const thread = PERMALINK_THREAD_TS.exec(trimmed);
	if (thread) return thread[1];

	const permalink = PERMALINK_TS.exec(trimmed);
	if (permalink) return `${permalink[1]}.${permalink[2]}`;

	throw new InvalidArgumentError(
		"Expected a message ts (1712345678.123456) or a Slack archives permalink (https://<workspace>.slack.com/archives/<channel>/p1712345678123456).",
	);
}
