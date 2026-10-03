import { describe, expect, it } from "vitest";
import { makeSessionInfo } from "../../../../../test/mothers/makeSessionInfo";
import { runInFlightSession } from "./runInFlightSession";

const liveRun = makeSessionInfo({
	id: "4",
	commandType: "assist",
	status: "running",
	assistArgs: ["backlog", "run", "a775"],
});

describe("runInFlightSession", () => {
	it("finds a live run from its launch args before any activity is reported", () => {
		expect(runInFlightSession([liveRun], 775)?.id).toBe("4");
	});

	it("finds a run whose card was reused by an auto-run chain", () => {
		const chained = makeSessionInfo({
			...liveRun,
			assistArgs: ["draft", "--once", "something"],
			activity: { kind: "backlog", itemId: 775, startedAt: 1 },
		});

		expect(runInFlightSession([chained], 775)?.id).toBe("4");
	});

	it("ignores a run of a different item", () => {
		expect(runInFlightSession([liveRun], 772)).toBeUndefined();
	});

	it("ignores finished cards so the item can be run again", () => {
		expect(
			runInFlightSession(
				[makeSessionInfo({ ...liveRun, status: "done" })],
				775,
			),
		).toBeUndefined();
		expect(
			runInFlightSession(
				[makeSessionInfo({ ...liveRun, status: "error" })],
				775,
			),
		).toBeUndefined();
	});

	it("treats a stopped card as still holding the item", () => {
		expect(
			runInFlightSession(
				[makeSessionInfo({ ...liveRun, status: "stopped" })],
				775,
			)?.id,
		).toBe("4");
	});

	it("ignores sessions that are not backlog runs", () => {
		const refine = makeSessionInfo({
			...liveRun,
			assistArgs: ["refine", "--once", "a775"],
		});

		expect(runInFlightSession([refine], 775)).toBeUndefined();
	});
});
