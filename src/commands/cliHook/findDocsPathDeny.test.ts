import { describe, expect, it, vi } from "vitest";

vi.mock("../../shared/isApprovedRead", () => ({
	isApprovedRead: (cmd: string) =>
		/^(cat|grep) /.test(cmd) ? "Read-only CLI command" : undefined,
}));

import { findDocsPathDeny } from "./findDocsPathDeny";

const ROOT = "/repo";

describe("findDocsPathDeny", () => {
	it.each([
		"sed -i 's/a/b/' docs/src/content/docs/index.md",
		"echo hi > docs/notes.md",
		"cp README.md docs/readme.md",
		"cp README.md ./docs/readme.md",
		"cp README.md /repo/docs/readme.md",
		"cd /repo && rm docs/old.md",
	])("denies %s", (command) => {
		const decision = findDocsPathDeny("Bash", command, ROOT);

		expect(decision?.permissionDecision).toBe("deny");
		expect(decision?.permissionDecisionReason).toContain("Refresh docs");
	});

	it.each([
		"cat docs/CLAUDE.md",
		"grep -rn covers docs/src",
		"cat /repo/docs/CLAUDE.md",
	])("allows the read-only %s", (command) => {
		expect(findDocsPathDeny("Bash", command, ROOT)).toBeUndefined();
	});

	it.each([
		"sed -i 's/a/b/' src/docs/index.ts",
		"cp a.md mydocs/a.md",
		"rm -rf dist",
	])("ignores %s, which names no repo docs path", (command) => {
		expect(findDocsPathDeny("Bash", command, ROOT)).toBeUndefined();
	});
});
