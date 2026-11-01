import { describe, expect, it } from "vitest";
import { findShownSessionFiles } from "./findShownSessionFiles";

const locations = { home: "/home/u", cwd: "/home/u/git/repo" };
const devEntry = "/home/u/git/blog/src/content/dev/project-switch/2025-w31.md";
const repoFile = "/home/u/git/repo/src/foo.ts";

function shown(body: string, written = [devEntry, repoFile]): string[] {
	return findShownSessionFiles(body, written, locations);
}

describe("findShownSessionFiles", () => {
	it("catches a written file outside the repo in every path form", () => {
		for (const body of [
			`Dev entry: \`${devEntry}\``,
			"`~/git/blog/src/content/dev/project-switch/2025-w31.md`",
			String.raw`\\wsl.localhost\Ubuntu-22.04\home\u\git\blog\src\content\dev\project-switch\2025-w31.md`,
			`[entry](file://${devEntry}).`,
		])
			expect(shown(body)).toEqual([devEntry]);
	});

	it("catches repo-relative references", () => {
		expect(shown("`src/foo.ts`")).toEqual([repoFile]);
		expect(shown("./src/foo.ts")).toEqual([repoFile]);
	});

	it("catches Windows drive forms of /mnt paths", () => {
		const written = ["/mnt/c/git/x/notes.md"];
		expect(shown(String.raw`C:\git\x\notes.md`, written)).toEqual(written);
		expect(shown("/mnt/c/git/x/notes.md", written)).toEqual(written);
	});

	it("ignores folders and look-alike files", () => {
		expect(
			shown(
				[
					"/home/u/git/blog/src/content/dev/project-switch",
					`${devEntry}x`,
					"lib/src/foo.ts",
					"src/foo.tsx",
					"https://example.com/a",
				].join("\n"),
			),
		).toEqual([]);
	});
});
