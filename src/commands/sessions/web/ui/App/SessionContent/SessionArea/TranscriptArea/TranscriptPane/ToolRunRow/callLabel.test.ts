import { describe, expect, it } from "vitest";
import { callLabel } from "./callLabel";

describe("callLabel", () => {
	it("prefers the call's description", () => {
		expect(
			callLabel({ tool: "Bash", target: "rm -rf dist", description: "Clean" }),
		).toBe("Clean");
	});

	it("names the file for file tools", () => {
		expect(callLabel({ tool: "Read", target: "src/a/b.ts" })).toBe("b.ts");
		expect(callLabel({ tool: "Edit", target: "src\\c.ts" })).toBe("c.ts");
	});

	it("shortens long or multi-line commands", () => {
		expect(callLabel({ tool: "Grep", target: "foo" })).toBe("foo");
		expect(callLabel({ tool: "Bash", target: "a".repeat(70) })).toBe(
			`${"a".repeat(60)}…`,
		);
		expect(callLabel({ tool: "Bash", target: "echo 1\necho 2" })).toBe(
			"echo 1…",
		);
	});
});
