import { PLACEHOLDER, type SessionMode } from "../../../dispatchMode";

export const newSessionModes = {
	draft: {
		placeholder: "Describe the backlog item to draft...",
		submitLabel: "Start draft",
		sessionMode: "assist-draft",
	},
	bug: {
		placeholder: "Describe the bug: what happened, what you expected...",
		submitLabel: "File bug",
		sessionMode: "assist-bug",
	},
	prompt: {
		placeholder: PLACEHOLDER,
		submitLabel: "Start session",
	},
	design: {
		placeholder: "Describe the design task...",
		submitLabel: "Start design",
	},
} satisfies Record<
	string,
	{ placeholder: string; submitLabel: string; sessionMode?: SessionMode }
>;

export type NewSessionMode = keyof typeof newSessionModes;

export const newSessionModeOrder = Object.keys(
	newSessionModes,
) as NewSessionMode[];
