import { mkdtempSync, utimesSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parseSessionFile } from "./parseSessionFile";

describe("parseSessionFile", () => {
	it("keeps the start timestamp and records the file mtime as last activity", async () => {
		const file = join(mkdtempSync(join(tmpdir(), "session-")), "s.jsonl");
		writeFileSync(
			file,
			`${JSON.stringify({
				sessionId: "abc12345",
				cwd: "/home/me/assist",
				timestamp: "2026-08-09T11:00:00.000Z",
			})}\n`,
		);
		const modified = new Date("2026-08-09T15:30:00.000Z");
		utimesSync(file, modified, modified);

		const session = await parseSessionFile(file);

		expect(session).toMatchObject({
			timestamp: "2026-08-09T11:00:00.000Z",
			lastActivity: modified.toISOString(),
		});
	});
});
