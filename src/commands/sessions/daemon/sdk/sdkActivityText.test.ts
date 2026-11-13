import { describe, expect, it } from "vitest";
import { sdkActivityText } from "./sdkActivityText";

describe("sdkActivityText", () => {
	it("names the last tool call and its target", () => {
		expect(
			sdkActivityText([
				{ type: "text" },
				{
					type: "tool_use",
					name: "Bash",
					input: { command: "npm test\nmore" },
				},
			]),
		).toBe("Working · Bash npm test");
	});

	it("uses the file path for file tools", () => {
		expect(
			sdkActivityText([
				{ type: "tool_use", name: "Edit", input: { file_path: "src/a.ts" } },
			]),
		).toBe("Working · Edit src/a.ts");
	});

	it("shortens a long target", () => {
		const text = sdkActivityText([
			{ type: "tool_use", name: "Bash", input: { command: "x".repeat(200) } },
		]);
		expect(text.length).toBeLessThan(100);
		expect(text.endsWith("…")).toBe(true);
	});

	it("says Working for text-only messages", () => {
		expect(sdkActivityText([{ type: "text" }])).toBe("Working");
	});

	it("names a tool without a known target key", () => {
		expect(
			sdkActivityText([{ type: "tool_use", name: "TodoWrite", input: {} }]),
		).toBe("Working · TodoWrite");
	});
});
