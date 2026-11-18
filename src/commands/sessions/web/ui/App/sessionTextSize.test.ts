import { describe, expect, it } from "vitest";
import { sessionTextSize } from "./sessionTextSize";

describe("sessionTextSize", () => {
	it("adds the offset variable to px and string bases", () => {
		expect(sessionTextSize(13)).toBe(
			"calc(13px + var(--session-text-offset, 0px))",
		);
		expect(sessionTextSize("0.875rem")).toBe(
			"calc(0.875rem + var(--session-text-offset, 0px))",
		);
	});

	it("leaves an already offset size unchanged", () => {
		const once = sessionTextSize("0.75rem");
		expect(sessionTextSize(once)).toBe(once);
	});
});
