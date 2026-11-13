import { mkdtempSync, utimesSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parseCodexSessionFile } from "./parseCodexSessionFile";

function rolloutFile(lines: unknown[]): string {
	const dir = mkdtempSync(join(tmpdir(), "codex-rollout-"));
	const file = join(dir, "rollout-2026-08-09T21-13-54-019fe63a.jsonl");
	writeFileSync(file, `${lines.map((l) => JSON.stringify(l)).join("\n")}\n`);
	return file;
}

const sessionMeta = {
	type: "session_meta",
	payload: {
		session_id: "019fe63a",
		cwd: "/home/me/assist",
		timestamp: "2026-08-09T11:13:54.257Z",
	},
};

describe("parseCodexSessionFile", () => {
	it("reads a codex rollout as a codex history entry", async () => {
		const session = await parseCodexSessionFile(
			rolloutFile([
				sessionMeta,
				{
					type: "event_msg",
					payload: { type: "user_message", message: "refine a667" },
				},
			]),
		);

		expect(session).toMatchObject({
			sessionId: "019fe63a",
			name: "refine a667",
			project: "assist",
			cwd: "/home/me/assist",
			timestamp: "2026-08-09T11:13:54.257Z",
			origin: "wsl",
			harness: "codex",
		});
	});

	it("reuses the backlog run chips when the prompt names an item", async () => {
		const session = await parseCodexSessionFile(
			rolloutFile([
				sessionMeta,
				{
					type: "event_msg",
					payload: {
						type: "user_message",
						message:
							"You are working on backlog item a667: Make Codex first-class",
					},
				},
			]),
		);

		expect(session).toMatchObject({ sessionType: "next", itemId: 667 });
	});

	it("ignores a file with no session_meta", async () => {
		expect(
			await parseCodexSessionFile(rolloutFile([{ type: "event_msg" }])),
		).toBeNull();
	});

	it("records the rollout's mtime as last activity", async () => {
		const file = rolloutFile([sessionMeta]);
		const modified = new Date("2026-08-10T02:00:00.000Z");
		utimesSync(file, modified, modified);

		const session = await parseCodexSessionFile(file);

		expect(session?.lastActivity).toBe(modified.toISOString());
	});
});
