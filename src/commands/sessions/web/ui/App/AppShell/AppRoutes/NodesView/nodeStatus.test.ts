import { describe, expect, it } from "vitest";
import type { LinkStatus } from "../../../../../../daemon/links/LinkStatus";
import type { NodeUpdateStatus } from "../../../../../../shared/NodeUpdateStatus";
import type { NodeUpdateEntry } from "../../NodeUpdateEntry";
import { nodeRows } from "./nodeRows";
import { needsAttention, nodeStatus } from "./nodeStatus";

function entry(overrides: Partial<NodeUpdateStatus> = {}): NodeUpdateEntry {
	return {
		name: "win",
		local: false,
		status: {
			nodeName: "win",
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

const ready = entry({ built: "1.3.0", restart: ["daemon"] });

function link(state: LinkStatus["state"], extra: Partial<LinkStatus> = {}) {
	return { name: "win", url: "http://win:3100", state, ...extra };
}

describe("nodeStatus", () => {
	it("puts a disconnected link ahead of a ready update", () => {
		const status = nodeStatus(link("disconnected"), ready);
		expect(status).toMatchObject({ kind: "disconnected", attention: "error" });
		expect(status.action).toBeUndefined();
	});

	it("puts a version-blocked link ahead of the update state and names the direction", () => {
		expect(
			nodeStatus(
				link("version-blocked", { peerProtocol: 3, protocol: 4 }),
				ready,
			),
		).toMatchObject({
			kind: "blocked",
			line: "older link protocol · update it",
		});
	});

	it("shows connecting without asking for attention", () => {
		expect(needsAttention(nodeStatus(link("connecting"), ready))).toBe(false);
	});

	it("offers a restart when a connected node has a build ready", () => {
		expect(nodeStatus(link("connected"), ready)).toMatchObject({
			kind: "ready",
			action: "restart",
		});
	});

	it("offers the fix session for a diverged node with one", () => {
		expect(
			nodeStatus(
				undefined,
				entry({
					loop: {
						phase: "diverged",
						since: new Date().toISOString(),
						escalationId: "12",
					},
				}),
			),
		).toMatchObject({ kind: "diverged", action: "fix" });
	});

	it("reads an up-to-date node as needing nothing", () => {
		const status = nodeStatus(link("connected"), entry());
		expect(status.kind).toBe("ok");
		expect(needsAttention(status)).toBe(false);
	});

	it("shows a node this tab is restarting as restarting rather than disconnected", () => {
		const status = nodeStatus(link("disconnected"), undefined, true);
		expect(status).toMatchObject({
			kind: "restarting",
			label: "Restarting…",
			line: "waiting for win to come back",
		});
		expect(needsAttention(status)).toBe(false);
	});
});

describe("nodeRows", () => {
	const nodes = {
		local: "wsl",
		links: [link("disconnected"), { ...link("connected"), name: "mac" }],
	};

	it("marks each restarting node", () => {
		const rows = nodeRows(
			nodes,
			[],
			new Set(),
			"http://wsl:3100",
			new Set(["wsl", "win"]),
		);
		expect(rows.map((r) => r.status.kind)).toEqual([
			"restarting",
			"restarting",
			"loading",
		]);
	});

	it("keeps the real status when nothing is restarting", () => {
		const rows = nodeRows(nodes, [], new Set(), "http://wsl:3100");
		expect(rows.map((r) => r.status.kind)).toEqual([
			"loading",
			"disconnected",
			"loading",
		]);
	});
});
