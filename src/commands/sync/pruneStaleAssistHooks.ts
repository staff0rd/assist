import { canonical } from "./canonical";
import { isPlainObject } from "./isPlainObject";

type Settings = Record<string, unknown>;

type HookEntry = { hooks?: { command?: unknown }[] };

function entryCommands(entry: unknown): string[] {
	const hooks = (entry as HookEntry | null)?.hooks;
	if (!Array.isArray(hooks)) return [];
	return hooks
		.map((hook) => hook?.command)
		.filter((command): command is string => typeof command === "string");
}

function isStale(
	entry: unknown,
	assistCommands: Set<string>,
	assistEntries: Set<string>,
): boolean {
	const commands = entryCommands(entry);
	return (
		commands.length > 0 &&
		commands.every((command) => assistCommands.has(command)) &&
		!assistEntries.has(canonical(entry))
	);
}

function pruneEvent(user: unknown, assist: unknown): unknown {
	if (!Array.isArray(user) || !Array.isArray(assist)) return user;
	const assistCommands = new Set(assist.flatMap(entryCommands));
	const assistEntries = new Set(assist.map(canonical));
	return user.filter((entry) => !isStale(entry, assistCommands, assistEntries));
}

export function pruneStaleAssistHooks(
	user: Settings,
	assist: Settings,
): Settings {
	const userHooks = user.hooks;
	const assistHooks = assist.hooks;
	if (!isPlainObject(userHooks) || !isPlainObject(assistHooks)) return user;
	const hooks: Settings = { ...userHooks };
	for (const event of Object.keys(assistHooks))
		if (event in hooks)
			hooks[event] = pruneEvent(hooks[event], assistHooks[event]);
	return { ...user, hooks };
}
