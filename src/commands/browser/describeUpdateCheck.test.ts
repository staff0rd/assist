import { describe, expect, it } from "vitest";
import { describeUpdateCheck } from "./describeUpdateCheck";

describe("describeUpdateCheck", () => {
	it("prints old → new when an update is available", () => {
		expect(
			describeUpdateCheck({
				ok: true,
				result: { status: "update_available", available: "1.0.1" },
				version: "1.0.0",
			}),
		).toEqual({ outcome: "updating", message: "updating v1.0.0 → v1.0.1…" });
	});

	it("says already up to date", () => {
		expect(
			describeUpdateCheck({
				ok: true,
				result: { status: "no_update" },
				version: "1.0.0",
			}),
		).toEqual({ outcome: "current", message: "already up to date (v1.0.0)" });
	});

	it("fails with Firefox's status when throttled", () => {
		expect(
			describeUpdateCheck({
				ok: true,
				result: { status: "throttled" },
				version: "1.0.0",
			}),
		).toEqual({
			outcome: "failed",
			message:
				"Firefox did not check for an update (status: throttled); still v1.0.0",
		});
	});

	it("fails with the extension's error", () => {
		expect(
			describeUpdateCheck({ ok: false, error: "boom", version: "1.0.0" }),
		).toEqual({ outcome: "failed", message: "boom" });
	});
});
