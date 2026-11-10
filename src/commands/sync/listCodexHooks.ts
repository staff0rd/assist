import type { CodexAppServer } from "./createCodexRpcClient";
import type { HooksListResult } from "./selectAssistCodexHooks";
import { unsupportedCodexTrust } from "./unsupportedCodexTrust";

export async function listCodexHooks(
	server: CodexAppServer,
	cwd: string,
): Promise<HooksListResult["data"]> {
	try {
		return (await server.call<HooksListResult>("hooks/list", { cwds: [cwd] }))
			.data;
	} catch (error) {
		throw unsupportedCodexTrust(error);
	}
}
