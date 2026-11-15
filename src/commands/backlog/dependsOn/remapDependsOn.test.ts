import { describe, expect, it } from "vitest";
import { remapDependsOn } from "./remapDependsOn";

describe("remapDependsOn", () => {
	it("keeps phases on the default dependency on the default", () => {
		expect(
			remapDependsOn({
				before: [null, null, null],
				order: [0, undefined, 1, 2],
			}),
		).toEqual([null, null, null, null]);
	});

	it("shifts explicit references past an inserted phase", () => {
		expect(
			remapDependsOn({
				before: [null, null, [0], [0]],
				order: [0, undefined, 1, 2, 3],
			}),
		).toEqual([null, null, null, [0], [0]]);
	});

	it("stores the inserted phase's own dependencies", () => {
		expect(
			remapDependsOn({
				before: [null, null],
				order: [0, 1, undefined],
				inserted: [0],
			}),
		).toEqual([null, null, [0]]);
	});

	it("replaces a reference to a removed phase with that phase's dependencies", () => {
		expect(
			remapDependsOn({ before: [null, null, [1], [1]], order: [0, 2, 3] }),
		).toEqual([null, null, [0]]);
	});

	it("renumbers references when a phase moves and drops ones no longer earlier", () => {
		// Phases 3 and 4 depend on phase 2; phase 2 moves to the end.
		expect(
			remapDependsOn({ before: [null, null, [1], [1]], order: [0, 2, 3, 1] }),
		).toEqual([null, null, [0], null]);
	});

	it("collapses to the default when the remapped list is just the previous phase", () => {
		expect(
			remapDependsOn({ before: [null, [], [0]], order: [1, 0, 2] }),
		).toEqual([null, null, null]);
	});
});
