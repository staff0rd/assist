import { describe, expect, it } from "vitest";
import { findAssistClone } from "./findAssistClone";

const origins: Record<string, string> = {
	"/git/other": "github.com/staff0rd/other",
	"/git/assist": "github.com/Staff0rd/Assist",
};

describe("findAssistClone", () => {
	it("finds the clone whose origin is staff0rd/assist, ignoring case", () => {
		expect(findAssistClone(Object.keys(origins), (cwd) => origins[cwd])).toBe(
			"/git/assist",
		);
	});

	it("returns undefined when no clone has assist's origin", () => {
		expect(
			findAssistClone(["/git/other", "/git/none"], (cwd) => origins[cwd]),
		).toBeUndefined();
	});
});
