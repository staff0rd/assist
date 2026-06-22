import { describe, expect, it } from "vitest";
import type { ForbiddenStringsRule } from "../../../shared/types";
import {
	findForbiddenStrings,
	findRuleViolations,
	resolveStringsAtPath,
} from "./findForbiddenStrings";

describe("resolveStringsAtPath", () => {
	describe("when the path resolves to a string", () => {
		it("returns it as a single-element array", () => {
			expect(resolveStringsAtPath({ a: { b: "value" } }, "a.b")).toEqual([
				"value",
			]);
		});
	});

	describe("when the path resolves to an array of strings", () => {
		it("returns every string", () => {
			expect(
				resolveStringsAtPath(
					{ permissions: { allow: ["x", "y"] } },
					"permissions.allow",
				),
			).toEqual(["x", "y"]);
		});
	});

	describe("when the array mixes strings and other types", () => {
		it("returns only the strings", () => {
			expect(
				resolveStringsAtPath({ a: ["x", 1, null, { n: 1 }, "y"] }, "a"),
			).toEqual(["x", "y"]);
		});
	});

	describe("when the value is a non-string scalar or object", () => {
		it("returns an empty array", () => {
			expect(resolveStringsAtPath({ a: 5 }, "a")).toEqual([]);
			expect(resolveStringsAtPath({ a: { b: 1 } }, "a")).toEqual([]);
		});
	});

	describe("when the path does not exist", () => {
		it("returns an empty array", () => {
			expect(resolveStringsAtPath({ a: {} }, "a.b.c")).toEqual([]);
			expect(resolveStringsAtPath({}, "missing")).toEqual([]);
		});
	});
});

describe("findRuleViolations", () => {
	const rule: ForbiddenStringsRule = {
		file: "claude/settings.json",
		paths: ["permissions.allow", "permissions.deny"],
		disallowed: "*assist*",
	};

	describe("when a value matches the disallowed wildcard", () => {
		it("flags it with its file and path", () => {
			const data = {
				permissions: {
					allow: ["Bash(assist verify:*)", "Skill(verify)"],
					deny: ["Bash(npm run:*)"],
				},
			};
			expect(findRuleViolations(data, rule)).toEqual([
				{
					file: "claude/settings.json",
					path: "permissions.allow",
					value: "Bash(assist verify:*)",
				},
			]);
		});
	});

	describe("when no value matches", () => {
		it("returns no violations", () => {
			const data = { permissions: { allow: ["Skill(verify)"], deny: [] } };
			expect(findRuleViolations(data, rule)).toEqual([]);
		});
	});

	describe("when matching across multiple paths", () => {
		it("flags violations from each path", () => {
			const data = {
				permissions: {
					allow: ["Bash(assist verify:*)"],
					deny: ["Bash(npx assist:*)"],
				},
			};
			expect(findRuleViolations(data, rule)).toEqual([
				{
					file: "claude/settings.json",
					path: "permissions.allow",
					value: "Bash(assist verify:*)",
				},
				{
					file: "claude/settings.json",
					path: "permissions.deny",
					value: "Bash(npx assist:*)",
				},
			]);
		});
	});
});

describe("findForbiddenStrings", () => {
	describe("when there are no rules", () => {
		it("returns no violations", () => {
			expect(findForbiddenStrings([], () => ({}))).toEqual([]);
		});
	});

	describe("when multiple rules span multiple files", () => {
		it("aggregates violations from every rule", () => {
			const files: Record<string, unknown> = {
				"a.json": { list: ["bad-one", "ok"] },
				"b.json": { nested: { values: ["ok", "bad-two"] } },
			};
			const rules: ForbiddenStringsRule[] = [
				{ file: "a.json", paths: ["list"], disallowed: "bad-*" },
				{ file: "b.json", paths: ["nested.values"], disallowed: "bad-*" },
			];
			expect(findForbiddenStrings(rules, (file) => files[file])).toEqual([
				{ file: "a.json", path: "list", value: "bad-one" },
				{ file: "b.json", path: "nested.values", value: "bad-two" },
			]);
		});
	});
});
