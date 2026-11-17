import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { parseSessionFile } from "./parseSessionFile";
import { readSessionMeta } from "./readSessionMeta";

let dir: string;

beforeEach(() => {
	dir = fs.mkdtempSync(path.join(os.tmpdir(), "parse-session-file-"));
});

afterEach(() => {
	fs.rmSync(dir, { recursive: true, force: true });
});

function writeSession(entries: unknown[]): string {
	const filePath = path.join(dir, "session.jsonl");
	fs.writeFileSync(
		filePath,
		entries.map((entry) => JSON.stringify(entry)).join("\n"),
	);
	return filePath;
}

describe("parseSessionFile", () => {
	it("keeps the start timestamp and records the file mtime as last activity", async () => {
		const filePath = writeSession([
			{
				sessionId: "abc12345",
				cwd: "/home/me/assist",
				timestamp: "2026-08-09T11:00:00.000Z",
			},
		]);
		const modified = new Date("2026-08-09T15:30:00.000Z");
		fs.utimesSync(filePath, modified, modified);

		const session = await parseSessionFile(filePath);

		expect(session).toMatchObject({
			timestamp: "2026-08-09T11:00:00.000Z",
			lastActivity: modified.toISOString(),
		});
	});

	it("reads cwd and the first prompt from past a hook line larger than the initial head", async () => {
		const filePath = writeSession([
			{ type: "mode", mode: "normal", sessionId: "abc" },
			{
				attachment: { type: "hook_success", stdout: "x".repeat(40_000) },
				sessionId: "abc",
				cwd: "/home/me/git/repo",
				timestamp: "2026-11-13T00:00:00.000Z",
			},
			{
				type: "user",
				sessionId: "abc",
				cwd: "/home/me/git/repo",
				message: { role: "user", content: "does this work?" },
			},
		]);

		const session = await parseSessionFile(filePath);

		expect(session?.cwd).toBe("/home/me/git/repo");
		expect(session?.name).toBe("does this work?");
		expect(session?.timestamp).toBe("2026-11-13T00:00:00.000Z");
	});

	it("reads only the first head when the first prompt has no text", async () => {
		const filePath = writeSession([
			{
				type: "user",
				sessionId: "abc",
				cwd: "/home/me/git/repo",
				message: {
					role: "user",
					content: [{ type: "image", source: { data: "aGVsbG8=" } }],
				},
			},
			{
				type: "assistant",
				sessionId: "abc",
				message: { role: "assistant", content: "y".repeat(40_000) },
			},
		]);
		const handle = await fs.promises.open(filePath, "r");
		const read = vi.spyOn(handle, "read");

		try {
			const meta = await readSessionMeta(handle);

			expect(meta.cwd).toBe("/home/me/git/repo");
			expect(meta.name).toBe("");
			expect(read).toHaveBeenCalledTimes(1);
		} finally {
			await handle.close();
		}
	});
});
