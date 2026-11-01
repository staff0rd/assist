import { beforeEach, describe, expect, it, vi } from "vitest";
import { makeSession } from "../../../../test/mothers/makeSession";
import type { SessionClient } from "../broadcast";
import type { Session } from "../createSession";
import { daemonLog } from "../daemonLog";
import { checkDurability } from "../worktree/treeDurability";
import type { TransferDeps } from "./TransferDeps";
import { transferSession } from "./transferSession";

vi.mock("../daemonLog", () => ({ daemonLog: vi.fn() }));
vi.mock("../worktree/treeDurability", () => ({ checkDurability: vi.fn() }));
vi.mock("../worktree/describeHeldWork", () => ({
	describeHeldWork: vi.fn(async () => ({
		summary: "2 uncommitted files",
		items: [],
	})),
}));

type Msg = Record<string, unknown>;

function setup(reply: Msg | undefined) {
	const session = makeSession({
		id: "7",
		commandType: "assist",
		assistArgs: ["backlog", "run", "a1402"],
		worktree: { path: "/git/assist-3", clone: "/git/assist" },
	});
	const sessions = new Map<string, Session>([["7", session]]);
	const routed: Msg[] = [];
	const deps: TransferDeps = {
		session: (id) => sessions.get(id),
		links: {
			localNode: () => "work-wsl",
			isConnected: (node) => node === "mac",
			route: (client, data) => {
				routed.push(data);
				if (reply) client.send(JSON.stringify(reply));
				return true;
			},
		},
		stop: vi.fn(),
		dismiss: vi.fn(),
		notify: vi.fn(),
	};
	const sent: Msg[] = [];
	const client: SessionClient = {
		send: (raw) => sent.push(JSON.parse(raw)),
	};
	return { session, deps, routed, sent, client };
}

const request = { sessionId: "7", target: "mac", cwd: "/Users/me/assist" };

describe("transferSession", () => {
	beforeEach(() => {
		vi.mocked(checkDurability).mockResolvedValue({ durable: true });
		vi.mocked(daemonLog).mockClear();
	});

	it("refuses with the held-work summary when the tree is dirty", async () => {
		vi.mocked(checkDurability).mockResolvedValue({
			durable: false,
			reason: "uncommitted changes",
		});
		const { deps, routed, sent, client } = setup(undefined);
		await transferSession(client, deps, request);
		expect(routed).toEqual([]);
		expect(deps.stop).not.toHaveBeenCalled();
		expect(sent[0].type).toBe("error");
		expect(sent[0].message).toMatch(/2 uncommitted files/);
	});

	it("refuses sessions that are not backlog runs", async () => {
		const { session, deps, routed, sent, client } = setup(undefined);
		session.assistArgs = ["draft"];
		await transferSession(client, deps, request);
		expect(routed).toEqual([]);
		expect(sent[0].message).toMatch(/only backlog run/);
	});

	it("routes create-assist to the target link with a trace id and closes the source", async () => {
		const { deps, routed, sent, client } = setup({
			type: "created",
			sessionId: "mac:3",
		});
		await transferSession(client, deps, request);
		expect(deps.stop).toHaveBeenCalledWith("7");
		expect(routed).toHaveLength(1);
		expect(routed[0]).toMatchObject({
			type: "create-assist",
			assistArgs: ["backlog", "run", "a1402"],
			cwd: "/Users/me/assist",
			node: "mac",
		});
		const traceId = routed[0].traceId as string;
		expect(traceId).toMatch(/^[0-9a-f]{8}$/);
		const logged = vi.mocked(daemonLog).mock.calls.map(([line]) => line);
		expect(logged.some((line) => line.includes(`trace=${traceId}`))).toBe(true);
		expect(deps.dismiss).toHaveBeenCalledWith("7");
		expect(sent).toEqual([{ type: "notice", message: "Transferred to mac" }]);
	});

	it("keeps the source held with the error when the target start fails", async () => {
		const { session, deps, sent, client } = setup({
			type: "error",
			message: "repo not found",
		});
		await transferSession(client, deps, request);
		expect(deps.dismiss).not.toHaveBeenCalled();
		expect(session.transfer).toEqual({
			target: "mac",
			error: "repo not found",
		});
		expect(sent[0]).toEqual({
			type: "error",
			message: "Transfer to mac failed: repo not found",
		});
	});

	it("refuses a target that is not connected without stopping", async () => {
		const { deps, sent, client } = setup(undefined);
		await transferSession(client, deps, { ...request, target: "work-win" });
		expect(deps.stop).not.toHaveBeenCalled();
		expect(sent[0].message).toMatch(/work-win is not connected/);
	});
});
