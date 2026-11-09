import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { claudeConnectorProbe } from "./claudeConnectorProbe";

function withClaudeState(state: unknown): void {
	const dir = mkdtempSync(join(tmpdir(), "claude-probe-"));
	if (state !== undefined)
		writeFileSync(join(dir, ".claude.json"), JSON.stringify(state));
	vi.stubEnv("CLAUDE_CONFIG_DIR", dir);
}

describe("claudeConnectorProbe", () => {
	afterEach(() => {
		vi.unstubAllEnvs();
	});

	it("is supported when the connector has connected", () => {
		withClaudeState({
			claudeAiMcpEverConnected: ["claude.ai Gmail", "claude.ai Slack"],
		});
		expect(claudeConnectorProbe("Gmail")).toEqual({ supported: true });
	});

	it("names the missing connector and how to connect it", () => {
		withClaudeState({ claudeAiMcpEverConnected: ["claude.ai Gmail"] });
		const status = claudeConnectorProbe("Slack");
		expect(status).toMatchObject({
			supported: false,
			reason: "the claude.ai Slack connector has never connected in Claude",
		});
		if (!status.supported)
			expect(status.remediation).toContain(
				"https://claude.ai/settings/connectors",
			);
	});

	it("is supported when Claude's state cannot tell", () => {
		withClaudeState(undefined);
		expect(claudeConnectorProbe("Gmail").supported).toBe(true);
		withClaudeState({ other: true });
		expect(claudeConnectorProbe("Slack").supported).toBe(true);
	});
});
