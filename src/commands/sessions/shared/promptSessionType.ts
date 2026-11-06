import { deriveHistoryFields, type SessionType } from "./deriveHistoryFields";

export function promptSessionType(
	prompt: string | undefined,
): SessionType | undefined {
	const match = prompt?.trim().match(/^\/([\w-]+)(?:\s|$)/);
	if (!match) return undefined;
	const { sessionType } = deriveHistoryFields(match[1], "", "");
	return sessionType === "prompt" ? undefined : sessionType;
}
