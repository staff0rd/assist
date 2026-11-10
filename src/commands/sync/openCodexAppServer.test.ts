import { describe, expect, it, vi } from "vitest";

vi.mock("../../shared/harnesses", () => ({
	harnesses: { codex: { command: process.execPath } },
}));

import { CodexRpcError } from "./CodexRpcError";
import { openCodexAppServer } from "./openCodexAppServer";
import { unsupportedCodexTrust } from "./unsupportedCodexTrust";

describe("openCodexAppServer", () => {
	it("reports a codex that exits at startup as unable to grant trust", async () => {
		const failure = await openCodexAppServer("/nonexistent-codex-home").catch(
			(error: unknown) => error,
		);

		expect(failure).toBeInstanceOf(CodexRpcError);
		expect((failure as Error).message).toMatch(/codex app-server exited \(1\)/);
		expect(unsupportedCodexTrust(failure).message).toMatch(
			/codex update.*Review hooks/,
		);
	});
});
