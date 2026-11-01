import type { ConfigHelpEntry } from "../../shared/configHelp";

export const askQuestionConfigHelp: ConfigHelpEntry[] = [
	{
		key: "sessions.askQuestion",
		setter: "assist config set sessions.askQuestion true --node",
		note: "opt in: assist ask-question answers AskUserQuestion questions from the session's web preview pane; when on, assist cli-hook denies AskUserQuestion in assist sessions and an advice fragment points Claude at assist ask-question; when off it exits non-zero so Claude uses the built-in tool (default off)",
	},
	{
		key: "sessions.askQuestionAutoApprove",
		setter: "assist config set sessions.askQuestionAutoApprove true --node",
		note: "when on, the question pane submits a form of single-select questions as soon as the completing option is picked, without pressing Answer; toggled from the pane's Auto approve switch (default off)",
	},
];
