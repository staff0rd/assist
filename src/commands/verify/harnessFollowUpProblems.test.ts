import { describe, expect, it } from "vitest";
import { harnessCapabilityDeclarations } from "../../shared/harnessAdapters/harnessCapabilityDeclarations";
import {
	supported,
	unsupported,
} from "../../shared/harnessAdapters/unsupported";
import { fakeHarnessCapabilities } from "../../test/mocks/fakeHarnessCapabilities";
import {
	harnessFollowUpCells,
	harnessFollowUpProblems,
} from "./harnessFollowUpProblems";

const declarations = {
	codex: {
		...fakeHarnessCapabilities,
		"oneShot.text": unsupported("no", "pick another", "a10"),
		"tools.restrict": unsupported("no", "pick another", "a11"),
		"intercept.command": () => supported,
	},
	pi: {
		...fakeHarnessCapabilities,
		"oneShot.text": unsupported("no", "pick another", "a10"),
		"usage.rateLimits": unsupported("no", "pick another", "a12"),
	},
};

describe("harnessFollowUpProblems", () => {
	const cells = harnessFollowUpCells(declarations);

	it("groups every unsupported cell under its follow-up item", () => {
		expect(Object.fromEntries(cells)).toEqual({
			a10: ["codex oneShot.text", "pi oneShot.text"],
			a11: ["codex tools.restrict"],
			a12: ["pi usage.rateLimits"],
		});
	});

	it("passes when every follow-up item is open", () => {
		const statuses = new Map([
			["a10", "todo"],
			["a11", "in-progress"],
			["a12", "todo"],
		]);
		expect(harnessFollowUpProblems(cells, statuses).filter(Boolean)).toEqual(
			[],
		);
	});

	it("fails on a missing or closed follow-up item", () => {
		const statuses = new Map([
			["a10", "done"],
			["a12", "wontdo"],
		]);
		const [missing, closed] = harnessFollowUpProblems(cells, statuses);
		expect(missing).toContain("a11 (codex tools.restrict)");
		expect(closed).toContain(
			"a10 (codex oneShot.text, pi oneShot.text) is done",
		);
		expect(closed).toContain("a12 (pi usage.rateLimits) is wontdo");
	});

	it("collects follow-ups from the real declarations", () => {
		expect([
			...harnessFollowUpCells(harnessCapabilityDeclarations).keys(),
		]).toEqual(expect.arrayContaining(["a696", "a1592"]));
	});
});
