import { describe, expect, it } from "vitest";
import { describeOutcome } from "./describeOutcome";

describe("describeOutcome", () => {
	it("exits 0 with the shortened sha range and commit count when the upstream moved", () => {
		expect(
			describeOutcome({
				kind: "moved",
				upstream: "origin/assist-3",
				from: "4f7f0ac1111111111111111111111111111111111",
				to: "def5678222222222222222222222222222222222",
				count: 3,
			}),
		).toEqual({
			exitCode: 0,
			message: "remote moved: 4f7f0ac..def5678 (3 commits)",
		});
	});

	it("says commit in the singular for a single commit", () => {
		expect(
			describeOutcome({
				kind: "moved",
				upstream: "origin/main",
				from: "aaaaaaa",
				to: "bbbbbbb",
				count: 1,
			}).message,
		).toBe("remote moved: aaaaaaa..bbbbbbb (1 commit)");
	});

	it("exits 2 with a one-line message on timeout", () => {
		expect(
			describeOutcome({
				kind: "timeout",
				upstream: "origin/assist-3",
				timeout: "60m",
			}),
		).toEqual({
			exitCode: 2,
			message: "no movement on origin/assist-3 after 60m",
		});
	});

	it("exits 3 for a simulated divergence, saying nothing really diverged", () => {
		const report = describeOutcome({
			kind: "simulated-divergence",
			upstream: "origin/main",
		});

		expect(report.exitCode).toBe(3);
		expect(report.message).toContain("nothing has actually diverged");
	});

	it("exits 1 with the reason when waiting is impossible", () => {
		expect(
			describeOutcome({
				kind: "unavailable",
				reason: "HEAD is detached — check out a branch",
			}),
		).toEqual({
			exitCode: 1,
			message: "cannot wait: HEAD is detached — check out a branch",
		});
	});

	it("exits 130 when interrupted", () => {
		expect(describeOutcome({ kind: "interrupted" })).toEqual({
			exitCode: 130,
			message: "interrupted",
		});
	});
});
