import { execSync } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("cli-hook check from outside repo", () => {
	it("should approve a known read command when run from a random directory", () => {
		const dir = mkdtempSync(join(tmpdir(), "assist-test-"));
		const result = execSync('assist cli-hook check "assist verify"', {
			cwd: dir,
			encoding: "utf-8",
		});

		expect(result).toContain("approved");
	});
});
