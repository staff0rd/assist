import * as fs from "node:fs";

export type CodexHookEntry = {
	key: string;
	handlerType: string;
	command?: string;
	source: string;
	sourcePath: string;
	pluginId?: string | null;
	isManaged: boolean;
	currentHash: string;
	trustStatus: "managed" | "untrusted" | "trusted" | "modified";
};

export type HooksListResult = {
	data: {
		hooks: CodexHookEntry[];
		errors: { path: string; message: string }[];
		warnings: string[];
	}[];
};

function samePath(a: string, b: string): boolean {
	if (a === b) return true;
	try {
		return fs.realpathSync(a) === fs.realpathSync(b);
	} catch {
		return false;
	}
}

export function selectAssistCodexHooks(
	hooks: CodexHookEntry[],
	configPath: string,
	expected: Map<string, string>,
): CodexHookEntry[] {
	return hooks.filter((hook) => {
		if (hook.source !== "user" || hook.pluginId || hook.isManaged) return false;
		if (hook.handlerType !== "command") return false;
		if (!samePath(hook.sourcePath, configPath)) return false;
		const prefix = `${hook.sourcePath}:`;
		if (!hook.key.startsWith(prefix)) return false;
		const command = expected.get(hook.key.slice(prefix.length));
		return command !== undefined && hook.command === command;
	});
}
