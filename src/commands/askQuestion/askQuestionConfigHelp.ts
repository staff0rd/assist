import type { ConfigHelpEntry } from "../../shared/configHelp";

export const askQuestionConfigHelp: ConfigHelpEntry[] = [
	{
		key: "sessions.askQuestion",
		setter: "assist config set sessions.askQuestion true -g",
		note: "opt in: assist ask-question answers AskUserQuestion questions from the session's web preview pane; when off it exits non-zero so Claude uses the built-in tool (default off)",
	},
];
