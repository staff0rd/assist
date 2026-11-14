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

	it("names a shell command's programs when it has no description", () => {
		expect(callLabel({ tool: "Bash", target: "cd /r && rg x | head" })).toBe(
			"rg, head",
		);
	});

	it("keeps a URL target whole", () => {
		const url = "https://claude.ai/artifact/Wu4fafVRcMMSRtzq3iUCBF";
		expect(callLabel({ tool: "Artifact", target: url })).toBe(url);
	});

	it("shortens other tools' long or multi-line targets", () => {
		expect(callLabel({ tool: "Grep", target: "foo" })).toBe("foo");
		expect(callLabel({ tool: "WebFetch", target: "a ".repeat(25) })).toBe(
			`${"a ".repeat(20)}…`,
		);
		expect(callLabel({ tool: "Grep", target: "a\nb" })).toBe("a…");
	});
});
