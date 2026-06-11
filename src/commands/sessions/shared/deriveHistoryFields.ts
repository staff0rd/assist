export type SessionType =
	| "draft"
	| "next"
	| "bug"
	| "refine"
	| "prompt"
	| "run";

type HistoryFields = {
	sessionType?: SessionType;
	itemId?: number;
	prompt?: string;
};

const KNOWN: SessionType[] = ["draft", "next", "bug", "refine", "run"];

/**
 * Reconstruct an active card's session-type/item-id/title hints from the
 * <command-name>/<command-args> markers in a session's first user message.
 * Everything is optional: older sessions without markers degrade to just a name.
 */
export function deriveHistoryFields(
	commandName: string,
	commandArgs: string,
	name: string,
): HistoryFields {
	const fields: HistoryFields = {};

	const sessionType = deriveSessionType(commandName, name);
	if (sessionType) fields.sessionType = sessionType;

	const itemMatch = commandArgs.match(/^(\d+)\b\s*/);
	if (itemMatch) fields.itemId = Number(itemMatch[1]);

	const prompt = commandArgs.slice(itemMatch?.[0].length ?? 0).trim();
	if (prompt) fields.prompt = prompt;

	return fields;
}

function deriveSessionType(
	commandName: string,
	name: string,
): SessionType | undefined {
	if (KNOWN.includes(commandName as SessionType))
		return commandName as SessionType;
	if (commandName || name) return "prompt";
	return undefined;
}
