import { describe, expect, it } from "vitest";
import { summariseChecks } from "./summariseChecks";

describe("summariseChecks", () => {
	it("names failing and pending check runs", () => {
		expect(
			summariseChecks([
				{ name: "build", status: "COMPLETED", conclusion: "SUCCESS" },
				{ name: "lint", status: "COMPLETED", conclusion: "FAILURE" },
				{ name: "e2e", status: "IN_PROGRESS", conclusion: "" },
				{ name: "deploy", status: "QUEUED", conclusion: "" },
			]),
		).toEqual({ failing: ["lint"], pending: ["e2e", "deploy"] });
	});

	it("treats neutral and skipped runs as passing", () => {
		expect(
			summariseChecks([
				{ name: "optional", status: "COMPLETED", conclusion: "NEUTRAL" },
				{ name: "skipped", status: "COMPLETED", conclusion: "SKIPPED" },
			]),
		).toEqual({ failing: [], pending: [] });
	});

	it("treats a cancelled or timed-out run as failing", () => {
		expect(
			summariseChecks([
				{ name: "slow", status: "COMPLETED", conclusion: "TIMED_OUT" },
				{ name: "stopped", status: "COMPLETED", conclusion: "CANCELLED" },
			]),
		).toEqual({ failing: ["slow", "stopped"], pending: [] });
	});

	it("reads status contexts by their state and context name", () => {
		expect(
			summariseChecks([
				{ context: "ci/circle", state: "FAILURE" },
				{ context: "ci/deploy", state: "PENDING" },
				{ context: "ci/unit", state: "SUCCESS" },
				{ context: "ci/legal", state: "ERROR" },
			]),
		).toEqual({
			failing: ["ci/circle", "ci/legal"],
			pending: ["ci/deploy"],
		});
	});

	it("labels a check with neither name nor context", () => {
		expect(
			summariseChecks([{ status: "COMPLETED", conclusion: "FAILURE" }]),
		).toEqual({ failing: ["unnamed check"], pending: [] });
	});

	describe("when there is no rollup", () => {
		it.each([null, undefined, []])("returns empty lists for %j", (rollup) => {
			expect(summariseChecks(rollup)).toEqual({ failing: [], pending: [] });
		});
	});
});
