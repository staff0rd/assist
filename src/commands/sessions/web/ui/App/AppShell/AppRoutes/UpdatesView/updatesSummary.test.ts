import { describe, expect, it } from "vitest";
import type { NodeUpdateStatus } from "../../../../../../shared/NodeUpdateStatus";
import type { NodeUpdateEntry } from "../../NodeUpdateEntry";
import { updateState } from "./updateState";
import { updatesSummary } from "./updatesSummary";

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

describe("updateState", () => {
	it("reads a waiting loop with nothing to restart as up to date", () => {
		expect(updateState(node("wsl")).kind).toBe("ok");
	});

	it("asks for the advised restarts when a build is ahead", () => {
		expect(
			updateState(
				node("win", { built: "1.3.0", restart: ["daemon", "webserver"] }),
			),
		).toMatchObject({
			kind: "ready",
			line: "restart daemon + web server",
		});
	});

	it("puts a divergence ahead of a pending restart", () => {
		expect(
			updateState(
				node("laptop", {
					restart: ["daemon"],
					loop: {
						phase: "diverged",
						since: new Date().toISOString(),
						escalationId: "12",
					},
				}),
			),
		).toMatchObject({
			kind: "diverged",
			line: "diverged just now · session 12",
		});
	});

	it("marks a node it could not reach as unavailable", () => {
		expect(
			updateState({ name: "pi", local: false, error: "HTTP 404" }),
		).toMatchObject({ kind: "unavailable", line: "HTTP 404" });
	});
});

describe("updatesSummary", () => {
	it("counts nodes, ready restarts and divergences", () => {
		expect(
			updatesSummary([
				node("wsl"),
				node("win", { built: "1.3.0", restart: ["daemon"] }),
				node("laptop", {
					loop: { phase: "diverged", since: new Date().toISOString() },
				}),
			]),
		).toBe("3 nodes · 1 ready to restart · 1 diverged");
	});

	it("says every node runs its latest build when none is ready", () => {
		expect(updatesSummary([node("wsl")])).toBe(
			"1 node · all running their latest build",
		);
	});
});
