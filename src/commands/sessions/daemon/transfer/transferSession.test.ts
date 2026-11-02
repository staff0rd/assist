import { beforeEach, describe, expect, it, vi } from "vitest";
import { makeSession } from "../../../../test/mothers/makeSession";
import type { SessionClient } from "../broadcast";
import type { Session } from "../createSession";
import { daemonLog } from "../daemonLog";
import { pushTransferSnapshot } from "./pushTransferSnapshot";
import type { TransferDeps } from "./TransferDeps";
import { transferSession } from "./transferSession";

vi.mock("../daemonLog", () => ({ daemonLog: vi.fn() }));
vi.mock("./pushTransferSnapshot", () => ({ pushTransferSnapshot: vi.fn() }));

const snapshot = { ref: "assist/transfer/a1402", branch: "feat/x" };

type Msg = Record<string, unknown>;

function setup(reply: Msg | undefined) {
	const session = makeSession({
		id: "7",
		commandType: "assist",
		assistArgs: ["backlog", "run", "a1402"],
		worktree: { path: "/git/assist-3", clone: "/git/assist" },
		status: "waiting",
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
		discard: vi.fn(),
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
		vi.mocked(pushTransferSnapshot).mockReset();
		vi.mocked(pushTransferSnapshot).mockResolvedValue(snapshot);
		vi.mocked(daemonLog).mockClear();
	});

	it("aborts without stopping and keeps the error when the push fails", async () => {
		vi.mocked(pushTransferSnapshot).mockRejectedValue(
			new Error("remote rejected"),
		);
		const { session, deps, routed, sent, client } = setup(undefined);
		await transferSession(client, deps, request);
		expect(routed).toEqual([]);
		expect(deps.stop).not.toHaveBeenCalled();
		expect(session.transfer).toEqual({
			target: "mac",
			error: "push failed: remote rejected",
		});
		expect(sent[0].type).toBe("error");
		expect(sent[0].message).toMatch(/push failed: remote rejected/);
	});

	it("pushes the tree to the item's transfer ref", async () => {
		const { deps, client } = setup({ type: "created", sessionId: "mac:3" });
		await transferSession(client, deps, request);
		expect(pushTransferSnapshot).toHaveBeenCalledWith(
			"/git/assist-3",
			"a1402",
			"/git/assist-3",
		);
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
			transfer: snapshot,
		});
		const traceId = routed[0].traceId as string;
		expect(traceId).toMatch(/^[0-9a-f]{8}$/);
		const logged = vi.mocked(daemonLog).mock.calls.map(([line]) => line);
		expect(logged.some((line) => line.includes(`trace=${traceId}`))).toBe(true);
		expect(deps.discard).toHaveBeenCalledWith("7");
		expect(sent).toEqual([{ type: "notice", message: "Transferred to mac" }]);
	});

	it("calls route on the links instance so a method using this works", async () => {
		class Router {
			private readonly reply = { type: "created", sessionId: "mac:3" };
			localNode = () => "work-wsl";
			isConnected = (node: string) => node === "mac";
			route(client: SessionClient, _data: Msg): boolean {
				client.send(JSON.stringify(this.reply));
				return true;
			}
		}
		const { deps, sent, client } = setup(undefined);
		deps.links = new Router();
		await transferSession(client, deps, request);
		expect(deps.discard).toHaveBeenCalledWith("7");
		expect(sent).toEqual([{ type: "notice", message: "Transferred to mac" }]);
	});

	it("keeps the source running with the error when the route throws", async () => {
		const { session, deps, sent, client } = setup(undefined);
		deps.links.route = () => {
			throw new Error("link dropped");
		};
		await transferSession(client, deps, request);
		expect(deps.stop).not.toHaveBeenCalled();
		expect(deps.discard).not.toHaveBeenCalled();
		expect(session.transfer).toEqual({ target: "mac", error: "link dropped" });
		expect(sent[0]).toEqual({
			type: "error",
			message: "Transfer to mac failed: link dropped",
		});
	});

	it("keeps the source held with the error when the target start fails", async () => {
		const { session, deps, sent, client } = setup({
			type: "error",
			message: "repo not found",
		});
		await transferSession(client, deps, request);
		expect(deps.stop).not.toHaveBeenCalled();
		expect(deps.discard).not.toHaveBeenCalled();
		expect(session.transfer).toEqual({
			target: "mac",
			error: "repo not found",
		});
		expect(sent[0]).toEqual({
			type: "error",
			message: "Transfer to mac failed: repo not found",
		});
	});

	it("queues the transfer without snapshotting while the agent is mid-turn", async () => {
		const { session, deps, routed, sent, client } = setup(undefined);
		session.status = "running";
		await transferSession(client, deps, request);
		expect(pushTransferSnapshot).not.toHaveBeenCalled();
		expect(deps.stop).not.toHaveBeenCalled();
		expect(routed).toEqual([]);
		expect(session.transfer).toEqual({
			target: "mac",
			queued: { cwd: "/Users/me/assist" },
		});
		expect(deps.notify).toHaveBeenCalled();
		expect(sent[0].type).toBe("notice");
	});

	it("refuses a second transfer while one is pending", async () => {
		const { session, deps, sent, client } = setup(undefined);
		session.transfer = { target: "mac", queued: {} };
		await transferSession(client, deps, request);
		expect(sent[0].message).toMatch(/already pending/);
	});

	it("refuses a target that is not connected without stopping", async () => {
		const { deps, sent, client } = setup(undefined);
		await transferSession(client, deps, { ...request, target: "work-win" });
		expect(deps.stop).not.toHaveBeenCalled();
		expect(sent[0].message).toMatch(/work-win is not connected/);
	});
});
