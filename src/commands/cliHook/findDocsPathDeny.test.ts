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
		"echo hi > docs/src/content/docs/notes.md",
		"cp shot.png docs/public/screenshots/shot.png",
		"cp README.md ./docs/src/content/docs/readme.md",
		"cp README.md /repo/docs/src/content/docs/readme.md",
		"cd /repo && rm docs/public/screenshots/old.png",
		"rm -rf docs/public/screenshots",
	])("denies %s", (command) => {
		const decision = findDocsPathDeny("Bash", command, ROOT);

		expect(decision?.permissionDecision).toBe("deny");
		expect(decision?.permissionDecisionReason).toContain("Refresh docs");
	});

	it.each([
		"cat docs/src/content/docs/index.md",
		"grep -rn covers docs/src/content/docs",
		"cat /repo/docs/src/content/docs/index.md",
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

	it.each([
		"echo hi > docs/notes.md",
		"sed -i 's/a/b/' docs/astro.config.ts",
		"cp a.css docs/src/styles/diff.css",
		"cp a.ts /repo/docs/src/previewReload.ts",
		"cp a.md docs/src/content/docs-old/a.md",
	])("allows %s, outside the docs pages and screenshots", (command) => {
		expect(findDocsPathDeny("Bash", command, ROOT)).toBeUndefined();
	});
});
