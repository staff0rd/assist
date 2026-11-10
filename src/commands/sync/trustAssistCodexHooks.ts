import * as path from "node:path";
import { listCodexHooks } from "./listCodexHooks";
import type { CodexAppServer } from "./createCodexRpcClient";
import { openCodexAppServer } from "./openCodexAppServer";
import { selectAssistCodexHooks } from "./selectAssistCodexHooks";
import {
	describeMissingCodexHooks,
	unsupportedCodexTrust,
} from "./unsupportedCodexTrust";
import { writeCodexHookTrust } from "./writeCodexHookTrust";

export async function trustAssistCodexHooks(
	configPath: string,
	expected: Map<string, string>,
): Promise<number> {
	const homeDir = path.dirname(configPath);
	let server: CodexAppServer;
	try {
		server = await openCodexAppServer(homeDir);
	} catch (error) {
		throw unsupportedCodexTrust(error);
	}
	try {
		const data = await listCodexHooks(server, homeDir);
		const owned = selectAssistCodexHooks(
			data.flatMap((entry) => entry.hooks),
			configPath,
			expected,
		);
		if (owned.length < expected.size)
			throw new Error(
				`Codex reported ${owned.length} of Assist's ${expected.size} hooks in ${configPath}.${describeMissingCodexHooks(data)}`,
			);
		const pending = owned.filter(
			(hook) =>
				hook.trustStatus === "untrusted" || hook.trustStatus === "modified",
		);
		if (pending.length) await writeCodexHookTrust(server, configPath, pending);
		return pending.length;
	} finally {
		server.close();
	}
}
