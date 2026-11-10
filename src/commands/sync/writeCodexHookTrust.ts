import type { CodexAppServer } from "./createCodexRpcClient";
import type { CodexHookEntry } from "./selectAssistCodexHooks";
import { unsupportedCodexTrust } from "./unsupportedCodexTrust";

export async function writeCodexHookTrust(
	server: CodexAppServer,
	configPath: string,
	hooks: CodexHookEntry[],
): Promise<void> {
	const value = Object.fromEntries(
		hooks.map((hook) => [hook.key, { trusted_hash: hook.currentHash }]),
	);
	try {
		await server.call("config/batchWrite", {
			filePath: configPath,
			edits: [{ keyPath: "hooks.state", mergeStrategy: "upsert", value }],
		});
	} catch (error) {
		throw unsupportedCodexTrust(error);
	}
}
