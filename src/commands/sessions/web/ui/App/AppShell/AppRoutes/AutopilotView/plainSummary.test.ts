import { describe, expect, it } from "vitest";
import { plainSummary } from "./plainSummary";

describe("plainSummary", () => {
	it("drops markdown markers and table rows", () => {
		expect(
			plainSummary(
				"**Where things stand:** healthy.\n\n| Agent | Credits |\n|---|---|\n| TUSK-1 | 0.7M |\n\nRun `/helm` later.",
			),
		).toBe("Where things stand: healthy. Run /helm later.");
	});
});
