import type { ConfigHelpEntry } from "../../shared/configHelp";

export const adviceConfigHelp: ConfigHelpEntry[] = [
	{
		key: "advice.sections",
		setter: "assist config set advice.sections.verify false",
		note: "force a section on (true) or off (false) whatever its condition says; 'assist advise --explain' lists every name",
	},
	{
		key: "advice.extra",
		setter: 'assist config set advice.extra "Deploy from main only"',
		note: 'free text appended as a "Repo notes" section',
	},
	{
		key: "advice.verify",
		setter: 'assist config set advice.verify "Run make check"',
		note: "replaces the verify fragment's text and forces it in",
	},
];
