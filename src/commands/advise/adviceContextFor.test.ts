import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { adviceContextFor } from "./adviceContextFor";

function makeRepo(): string {
	const dir = mkdtempSync(join(tmpdir(), "advice-context-"));
	writeFileSync(join(dir, "assist.yml"), "notify:\n  enabled: false\n");
	return dir;
}

describe("adviceContextFor", () => {
	it("marks the session assist-launched when ASSIST_SESSION is 1", () => {
		expect(
			adviceContextFor(makeRepo(), { ASSIST_SESSION: "1" }).assistSession,
		).toBe(true);
	});

	it("marks the session not assist-launched without ASSIST_SESSION", () => {
		expect(adviceContextFor(makeRepo(), {}).assistSession).toBe(false);
	});
});
