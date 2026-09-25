import { describe, expect, it } from "vitest";
import { diffEmptyMessage } from "./diffEmptyMessage";

describe("diffEmptyMessage", () => {
	it("reports a failed load ahead of an empty scope", () => {
		expect(diffEmptyMessage(true, 0)).toBe("Failed to load diff.");
	});

	it("reports an empty scope when the diff has no files", () => {
		expect(diffEmptyMessage(false, 0)).toBe("No changes in this scope.");
	});

	it("blames the filter when the scope has files but none are shown", () => {
		expect(diffEmptyMessage(false, 3)).toBe("No files match your filter.");
	});
});
