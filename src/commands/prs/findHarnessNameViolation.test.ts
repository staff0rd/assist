import { describe, expect, it } from "vitest";
import { findHarnessNameViolation } from "./findHarnessNameViolation";

describe("findHarnessNameViolation", () => {
	it("allows an identifier that contains claude as part of a larger word", () => {
		expect(
			findHarnessNameViolation(
				"Body",
				"Setting `harness.claudeSdkChrome` to false may not disable Chrome",
			),
		).toBeUndefined();
	});

	it("allows opus inside a larger word", () => {
		expect(
			findHarnessNameViolation("Body", "see magnumopus.ts"),
		).toBeUndefined();
	});

	it("rejects claude as a standalone word", () => {
		expect(findHarnessNameViolation("Body", "Fixed by Claude")).toBe(
			'Body must not contain "claude" or "opus"',
		);
	});

	it("rejects opus as a standalone word", () => {
		expect(findHarnessNameViolation("Reason", "per OPUS")).toBe(
			'Reason must not contain "claude" or "opus"',
		);
	});

	it("rejects coding-agent attribution", () => {
		expect(findHarnessNameViolation("Body", "Co-Authored-By: Codex")).toContain(
			"coding-agent attribution",
		);
	});
});
