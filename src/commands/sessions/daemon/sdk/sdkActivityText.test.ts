import { describe, expect, it } from "vitest";
import { sdkActivityText } from "./sdkActivityText";

describe("sdkActivityText", () => {
	it("names the last tool call without its command or target", () => {
		expect(
			sdkActivityText([
				{ type: "text" },
				{ type: "tool_use", name: "Edit" },
				{ type: "tool_use", name: "Bash" },
			]),
		).toBe("Working · Bash");
	});

	it("says Working for text-only messages", () => {
		expect(sdkActivityText([{ type: "text" }])).toBe("Working");
	});
});
