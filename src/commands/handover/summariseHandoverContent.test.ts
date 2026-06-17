import { describe, expect, it } from "vitest";
import { summariseHandoverContent } from "./summariseHandoverContent";

describe("summariseHandoverContent", () => {
	it("uses the first non-heading body line", () => {
		expect(
			summariseHandoverContent(
				"# Handover\n\n## Current Task\n\nShip the DB migration",
			),
		).toBe("Ship the DB migration");
	});

	it("strips leading bullet markers", () => {
		expect(summariseHandoverContent("# Handover\n\n- did the thing")).toBe(
			"did the thing",
		);
	});

	it("caps long lines", () => {
		const long = "x".repeat(200);
		const result = summariseHandoverContent(long);
		expect(result).toHaveLength(100);
		expect(result.endsWith("…")).toBe(true);
	});

	it("falls back to a generic label when there is no body text", () => {
		expect(summariseHandoverContent("# Handover\n\n## Current Task")).toBe(
			"Migrated handover",
		);
	});
});
