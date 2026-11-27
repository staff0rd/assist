import { describe, expect, it } from "vitest";
import { createLogRules } from "./createLogRules";
import { createStepErrorLog } from "./createStepErrorLog";

const rules = createLogRules({
	services: { api: { ignore: ["noisy"] } },
	browser: { ignore: [] },
});

describe("createStepErrorLog", () => {
	it("attributes each error to the step whose window holds its timestamp", () => {
		const log = createStepErrorLog(rules);
		log.startStep(1, 1_000);
		log.startStep(2, 2_000);
		log.endStep(3_000);
		log.record("api", "Error: late line from step 1", 1_500);
		log.record("api", "Error: during step 2", 2_500);
		expect(log.errorsFor(1)).toEqual([
			{
				source: "api",
				message: "Error: late line from step 1",
				at: new Date(1_500).toISOString(),
			},
		]);
		expect(log.errorsFor(2).map((e) => e.message)).toEqual([
			"Error: during step 2",
		]);
	});

	it("drops lines logged outside every step", () => {
		const log = createStepErrorLog(rules);
		log.record("api", "Error: during startup", 500);
		log.startStep(1, 1_000);
		log.endStep(2_000);
		log.record("api", "Error: after the run", 2_500);
		expect(log.errorsFor(1)).toEqual([]);
		expect(log.ignored).toBe(0);
	});

	it("tags lines with the open step using the current time by default", () => {
		let now = 1_000;
		const log = createStepErrorLog(rules, () => now);
		log.startStep(1);
		now = 1_200;
		log.record("browser", "pageerror: x is undefined");
		expect(log.errorsFor(1)).toHaveLength(1);
	});

	it("counts ignored matches without listing them", () => {
		const log = createStepErrorLog(rules);
		log.startStep(1, 0);
		log.record("api", "Error: noisy retry", 10);
		log.record("api", "Error: noisy retry", 20);
		log.record("api", "GET / 200", 30);
		expect(log.errorsFor(1)).toEqual([]);
		expect(log.ignored).toBe(2);
	});
});
