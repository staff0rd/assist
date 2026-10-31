import { describe, expect, it } from "vitest";
import type { NodeUpdateStatus } from "../../../../shared/NodeUpdateStatus";
import type { NodeUpdateEntry } from "../../App/AppShell/NodeUpdateEntry";
import { latestVersion } from "./latestVersion";
import { phoneUpdateState } from "./phoneUpdateState";

function node(
	name: string,
	overrides: Partial<NodeUpdateStatus> = {},
): NodeUpdateEntry {
	return {
		name,
		local: false,
		status: {
			nodeName: name,
			installDir: "/git/assist",
			running: "1.2.0",
			built: "1.2.0",
			restart: [],
			daemonReachable: true,
			loop: { phase: "waiting", since: new Date().toISOString() },
			history: [],
			...overrides,
		},
	};
}

describe("latestVersion", () => {
	it("takes the highest running or built version across nodes", () => {
		expect(
			latestVersion([
				node("mac", { running: "1.10.0" }),
				node("win", { running: "1.9.0", built: "1.11.0" }),
				{ name: "pi", local: false, error: "HTTP 404" },
			]),
		).toBe("1.11.0");
	});
});

describe("phoneUpdateState", () => {
	it("offers an update when a node's build is behind the latest seen", () => {
		expect(phoneUpdateState(node("win"), "1.3.0")).toEqual({
			tone: "warn",
			detail: "v1.2.0 · v1.3.0 available",
			updateAvailable: true,
			restartPending: false,
		});
	});

	it("reports a pending restart when built is ahead of running", () => {
		expect(
			phoneUpdateState(
				node("mac", { built: "1.3.0", restart: ["daemon"] }),
				"1.3.0",
			),
		).toMatchObject({
			detail: "v1.2.0 → v1.3.0 · restart pending",
			updateAvailable: false,
			restartPending: true,
		});
	});

	it("reads an up to date node as ok", () => {
		expect(phoneUpdateState(node("mac"), "1.2.0")).toMatchObject({
			tone: "ok",
			detail: "v1.2.0 · up to date",
		});
	});

	it("marks an unreachable node as an error without an update", () => {
		expect(
			phoneUpdateState(
				{ name: "pi", local: false, error: "HTTP 404" },
				"1.3.0",
			),
		).toMatchObject({ tone: "error", updateAvailable: false });
	});
});
