import { describe, expect, it, vi } from "vitest";
import type { MenuItem } from "./menuItems";
import { runRestartItem } from "./runRestartItem";

describe("runRestartItem", () => {
	it("waits for an in-flight build before restarting both", async () => {
		const order: string[] = [];
		vi.spyOn(console, "log").mockImplementation(() => {});

		await runRestartItem({ action: "restart-both" } as MenuItem, {
			waitForBuildFn: async () => {
				order.push("build");
			},
			runRestartDaemon: async () => {
				order.push("daemon");
			},
			reExec: () => order.push("reExec"),
		});

		expect(order).toEqual(["build", "daemon", "reExec"]);
	});
});
