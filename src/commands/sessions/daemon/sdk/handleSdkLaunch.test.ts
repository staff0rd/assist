import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { makeSession } from "../../../../test/mothers/makeSession";
import type { SessionClient } from "../broadcast";
import type { Session } from "../createSession";
import type { SessionManager } from "../SessionManager";
import { transferSession } from "../transfer/transferSession";
import { handleSdkLaunch } from "./handleSdkLaunch";

vi.mock("../daemonLog", () => ({ daemonLog: vi.fn() }));
vi.mock("../transfer/transferSession", () => ({ transferSession: vi.fn() }));

const exits: ((e: { exitCode: number }) => void)[] = [];
const drivenSession = vi.fn(() => ({
	onExit: (cb: (e: { exitCode: number }) => void) => exits.push(cb),
	kill: vi.fn(),
}));
vi.mock("./drivenLaunchTarget", () => ({
	drivenLaunchTarget: () => ({
		harness: "claude-sdk",
		label: "Claude SDK",
		drivenSession,
	}),
}));

const sessions = new Map<string, Session>();
const m = {
	clients: { delete: vi.fn(), viewers: () => new Set() },
	session: (id: string) => sessions.get(id),
	links: {},
	update: vi.fn(),
	stopSession: vi.fn(),
	discardSession: vi.fn(),
	dismissSession: vi.fn(),
} as unknown as SessionManager;

function phaseClient() {
	const send = vi.fn();
	const client: SessionClient = { send };
	const sent = () =>
		send.mock.calls.map(([raw]) => JSON.parse(String(raw)) as unknown);
	return { client, sent };
}

function launchPhase() {
	const phase = phaseClient();
	handleSdkLaunch(phase.client, m, {
		sessionId: "14",
		harness: "claude-sdk",
		prompt: "run phase",
	});
	return phase;
}

const flush = () => new Promise((r) => setTimeout(r, 0));

let settle = () => {};

describe("handleSdkLaunch phase-boundary transfer", () => {
	beforeEach(() => {
		exits.length = 0;
		drivenSession.mockClear();
		vi.mocked(transferSession).mockReset();
		vi.mocked(transferSession).mockImplementation(
			() => new Promise<void>((r) => (settle = r)),
		);
		sessions.clear();
		sessions.set(
			"14",
			makeSession({
				id: "14",
				status: "running",
				pty: { sdk: { attach: vi.fn() } } as unknown as Session["pty"],
				transfer: { target: "mac", queued: { cwd: "/Users/me/assist" } },
			}),
		);
	});

	afterEach(async () => {
		settle();
		await flush();
	});

	it("runs a queued transfer when the phase query ends, though still running", () => {
		const phase1 = launchPhase();
		exits[0]({ exitCode: 0 });
		expect(transferSession).toHaveBeenCalledWith(
			expect.anything(),
			expect.anything(),
			{
				sessionId: "14",
				target: "mac",
				cwd: "/Users/me/assist",
				phaseEnded: true,
			},
		);
		expect(phase1.sent()).toContainEqual({
			type: "sdk-exit",
			sessionId: "14",
			exitCode: 0,
		});
	});

	it("holds the next phase launch and refuses it once the source is handed off", async () => {
		launchPhase();
		exits[0]({ exitCode: 0 });
		const phase2 = launchPhase();
		await flush();
		expect(drivenSession).toHaveBeenCalledTimes(1);
		sessions.delete("14");
		settle();
		await flush();
		expect(drivenSession).toHaveBeenCalledTimes(1);
		expect(phase2.sent()).toContainEqual(
			expect.objectContaining({ type: "sdk-exit", exitCode: 1 }),
		);
	});

	it("releases the held launch on the source when the transfer fails", async () => {
		launchPhase();
		exits[0]({ exitCode: 0 });
		launchPhase();
		settle();
		await flush();
		expect(drivenSession).toHaveBeenCalledTimes(2);
	});

	it("launches the next phase at once when no transfer is queued", () => {
		const s = sessions.get("14");
		if (s) s.transfer = undefined;
		launchPhase();
		exits[0]({ exitCode: 0 });
		launchPhase();
		expect(transferSession).not.toHaveBeenCalled();
		expect(drivenSession).toHaveBeenCalledTimes(2);
	});
});
