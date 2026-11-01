import { describe, expect, it } from "vitest";
import { getRepoStatus } from "./getRepoStatus";

const today = "2026-11-04";

describe("getRepoStatus", () => {
	it("is missing without any dev entry", () => {
		expect(getRepoStatus("2026-11-03", null, today)).toBe("missing");
	});

	it("is ok when the last push is in the last written week", () => {
		expect(getRepoStatus("2026-10-28", "2026-W44", today)).toBe("ok");
	});

	it("is ok when only the in-progress week has unwritten pushes", () => {
		expect(getRepoStatus("2026-11-03", "2026-W44", today)).toBe("ok");
	});

	it("is outdated when a completed week after the last entry may be unwritten", () => {
		expect(getRepoStatus("2026-10-28", "2026-W43", today)).toBe("outdated");
		expect(getRepoStatus("2026-11-03", "2026-W42", today)).toBe("outdated");
	});
});
