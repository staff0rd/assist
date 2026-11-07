import { describe, expect, it } from "vitest";
import { parseCodexRules } from "./parseCodexRules";

describe("parseCodexRules", () => {
	it("maps an allow prefix rule to a wildcard Bash entry", () => {
		const text = `prefix_rule(
    pattern = ["git", "status"],
    decision = "allow",
)`;
		expect(parseCodexRules(text)).toEqual({
			allow: ["Bash(git status:*)"],
			deny: [],
		});
	});

	it("maps forbidden to deny and skips prompt", () => {
		const text = [
			`prefix_rule(pattern=["rm","-rf"], decision="forbidden")`,
			`prefix_rule(pattern=["git","push"], decision="prompt")`,
		].join("\n");
		expect(parseCodexRules(text)).toEqual({
			allow: [],
			deny: ["Bash(rm -rf:*)"],
		});
	});

	it("defaults an omitted decision to allow", () => {
		expect(parseCodexRules(`prefix_rule(pattern=['ls'])`).allow).toEqual([
			"Bash(ls:*)",
		]);
	});

	it("expands alternatives into one entry each", () => {
		const text = `prefix_rule(pattern=["git", ["diff", "log"]], decision="allow", justification="reads (safe)")`;
		expect(parseCodexRules(text).allow).toEqual([
			"Bash(git diff:*)",
			"Bash(git log:*)",
		]);
	});

	it("ignores rules without a pattern", () => {
		expect(parseCodexRules(`prefix_rule(decision="allow")`)).toEqual({
			allow: [],
			deny: [],
		});
	});
});
