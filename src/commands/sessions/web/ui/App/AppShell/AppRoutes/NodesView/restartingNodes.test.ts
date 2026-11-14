import { describe, expect, it } from "vitest";
import { RESTART_GRACE_MS, restartingNodes } from "./restartingNodes";

describe("restartingNodes", () => {
	const busy = { win: "Restarting", mac: "Pausing" };
	const busySince = { win: 1_000, mac: 1_000 };

	it("includes a restarting node within the grace period", () => {
		expect(
			restartingNodes(busy, busySince, 1_000 + RESTART_GRACE_MS - 1),
		).toEqual(new Set(["win"]));
	});

	it("drops a restarting node once the grace period has passed", () => {
		expect(restartingNodes(busy, busySince, 1_000 + RESTART_GRACE_MS)).toEqual(
			new Set(),
		);
	});
});
