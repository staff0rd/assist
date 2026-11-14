import { describe, expect, it } from "vitest";
import { findUiStories } from "./findUiStories";

const FILES: Record<string, string[]> = {
	ui1: ["src/web/ui/Panel.tsx", "src/web/ui/panel.css", "src/api.ts"],
	ui2: ["src/web/ui/Panel.tsx", "ios/App/Screen.swift"],
	cli: ["src/commands/registerFoo.ts", "src/shared/types.ts"],
	config: ["assist.yml", "package.json", "README.md"],
	tests: ["src/web/ui/Panel.test.tsx", "src/web/ui/Panel.spec.jsx"],
};

const filesFor = (sha: string) => FILES[sha] ?? [];

describe("findUiStories", () => {
	it("lists a story whose commits touch UI files, with only those files", () => {
		const result = findUiStories(
			[{ id: 1, name: "Panel", commits: ["ui1", "ui2"] }],
			filesFor,
		);

		expect(result).toEqual([
			{
				id: 1,
				name: "Panel",
				files: [
					"ios/App/Screen.swift",
					"src/web/ui/Panel.tsx",
					"src/web/ui/panel.css",
				],
			},
		]);
	});

	it("omits stories with only CLI, config or UI test commits", () => {
		const result = findUiStories(
			[
				{ id: 1, name: "CLI flag", commits: ["cli", "config"] },
				{ id: 2, name: "Panel", commits: ["cli", "ui1"] },
				{ id: 3, name: "No commits", commits: [] },
				{ id: 4, name: "UI tests only", commits: ["tests"] },
			],
			filesFor,
		);

		expect(result.map((s) => s.id)).toEqual([2]);
	});

	it("recognises every UI extension", () => {
		const exts = [".tsx", ".jsx", ".css", ".html", ".swift", ".vue", ".svelte"];
		const result = findUiStories(
			exts.map((ext, i) => ({ id: i, name: ext, commits: [ext] })),
			(sha) => [`a/file${sha}`],
		);

		expect(result).toHaveLength(exts.length);
	});
});
