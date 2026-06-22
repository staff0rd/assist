import { describe, expect, it } from "vitest";
import { findAssistReferences } from "./findAssistReferences";

describe("findAssistReferences", () => {
	describe("when no permission entries reference assist", () => {
		it("returns no references", () => {
			const settings = {
				permissions: {
					allow: ["Bash(git ls-files:*)", "Skill(verify)"],
					deny: ["Bash(npm run:*)"],
				},
			};
			expect(findAssistReferences(settings)).toEqual([]);
		});
	});

	describe("when an allow entry references assist", () => {
		it("flags it", () => {
			const settings = {
				permissions: { allow: ["Bash(assist backup schedule status:*)"] },
			};
			expect(findAssistReferences(settings)).toEqual([
				{ list: "allow", entry: "Bash(assist backup schedule status:*)" },
			]);
		});
	});

	describe("when a deny entry references assist", () => {
		it("flags it", () => {
			const settings = {
				permissions: { deny: ["Bash(npm run:*)", "Bash(npx assist:*)"] },
			};
			expect(findAssistReferences(settings)).toEqual([
				{ list: "deny", entry: "Bash(npx assist:*)" },
			]);
		});
	});

	describe("when both lists reference assist", () => {
		it("flags every entry", () => {
			const settings = {
				permissions: {
					allow: ["Bash(assist verify:*)"],
					deny: ["Bash(npx assist:*)"],
				},
			};
			expect(findAssistReferences(settings)).toEqual([
				{ list: "allow", entry: "Bash(assist verify:*)" },
				{ list: "deny", entry: "Bash(npx assist:*)" },
			]);
		});
	});

	describe("when the permissions block is missing or malformed", () => {
		it("returns no references", () => {
			expect(findAssistReferences({})).toEqual([]);
			expect(findAssistReferences({ permissions: { allow: "nope" } })).toEqual(
				[],
			);
		});
	});

	describe("when an entry contains assist as part of a larger word", () => {
		it("does not flag it", () => {
			const settings = {
				permissions: { allow: ["Bash(assistant-tool:*)"] },
			};
			expect(findAssistReferences(settings)).toEqual([]);
		});
	});
});
