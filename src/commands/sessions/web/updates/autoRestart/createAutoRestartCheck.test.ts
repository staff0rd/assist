import { describe, expect, it, vi } from "vitest";
import {
	AUTO_RESTART_SETTLE_MS,
	type AutoRestartSnapshot,
	type AutoRestartSessions,
	createAutoRestartCheck,
} from "./createAutoRestartCheck";

function setup(initial: Partial<AutoRestartSnapshot> = {}, enabled = true) {
	let snap: AutoRestartSnapshot = {
		built: "1.2.0",
		restart: ["daemon", "webserver"],
		buildPending: false,
		loop: { phase: "waiting", since: "2026-01-01T00:00:00Z" },
		sessions: [],
		...initial,
	};
	let attempted: string | undefined;
	let clock = 0;
	const restart = vi.fn(async () => {});
	const log = vi.fn();
	const report = vi.fn();
	const freshSessions = vi.fn(
		async (): Promise<AutoRestartSessions | undefined> => ({
			sessions: snap.sessions,
			restartActivity: snap.restartActivity,
		}),
	);
	const tick = createAutoRestartCheck({
		report,
		freshSessions,
		enabled: () => enabled,
		snapshot: async () => snap,
		attempted: {
			get: () => attempted,
			set: (v) => {
				attempted = v;
			},
		},
		restart,
		log,
		now: () => clock,
	});
	return {
		freshSessions,
		tick,
		restart,
		log,
		report,
		advance: (ms: number) => {
			clock += ms;
		},
		update: (next: Partial<AutoRestartSnapshot>) => {
			snap = { ...snap, ...next };
		},
	};
}

describe("createAutoRestartCheck", () => {
	it("skips session 4 starting at T+59s before the T+65s restart check", async () => {
		const t = setup({ restart: ["daemon"] });
		await t.tick();
		t.advance(59_000);
		t.freshSessions.mockResolvedValue({
			sessions: [{ name: "4", status: "running" }],
			restartActivity: "1:1",
		});
		t.advance(6_000);
		await t.tick();
		expect(t.restart).not.toHaveBeenCalled();
		expect(t.log).toHaveBeenCalledWith(
			"auto-restart: skipped daemon restart for v1.2.0: waiting on 1 running session (4)",
		);
	});

	it("resets for activity that finishes between samples, including a removed session", async () => {
		const t = setup({ restartActivity: "1:0" });
		await t.tick();
		t.advance(65_000);
		t.update({ restartActivity: "1:1" });
		await t.tick();
		expect(t.restart).not.toHaveBeenCalled();
		t.advance(AUTO_RESTART_SETTLE_MS - 1);
		await t.tick();
		expect(t.restart).not.toHaveBeenCalled();
		t.advance(1);
		await t.tick();
		expect(t.restart).toHaveBeenCalledTimes(1);
	});

	it("resets for activity during the snapshot read even if already idle again", async () => {
		const t = setup({ restartActivity: "1:0" });
		await t.tick();
		t.advance(AUTO_RESTART_SETTLE_MS);
		t.freshSessions.mockResolvedValueOnce({
			sessions: [],
			restartActivity: "1:1",
		});
		await t.tick();
		expect(t.restart).not.toHaveBeenCalled();
	});

	it("does not restart if the final session query fails", async () => {
		const t = setup();
		await t.tick();
		t.advance(AUTO_RESTART_SETTLE_MS);
		t.freshSessions.mockResolvedValueOnce(undefined);
		await t.tick();
		expect(t.restart).not.toHaveBeenCalled();
		expect(t.report).toHaveBeenLastCalledWith("daemon not reachable");
	});
	it("restarts the advised target once idle for the settle window", async () => {
		const t = setup();
		await t.tick();
		t.advance(AUTO_RESTART_SETTLE_MS - 1);
		await t.tick();
		expect(t.restart).not.toHaveBeenCalled();
		t.advance(1);
		await t.tick();
		expect(t.restart).toHaveBeenCalledWith("both");
		expect(t.log).toHaveBeenCalledWith(
			"auto-restart: restarting both to apply v1.2.0",
		);
	});

	it("restarts the single advised target", async () => {
		const t = setup({ restart: ["webserver"] });
		await t.tick();
		t.advance(AUTO_RESTART_SETTLE_MS);
		await t.tick();
		expect(t.restart).toHaveBeenCalledWith("webserver");
	});

	it("restarts the settle window when a session starts running between turns", async () => {
		const t = setup();
		await t.tick();
		t.advance(AUTO_RESTART_SETTLE_MS / 2);
		t.update({ sessions: [{ name: "a", status: "running" }] });
		await t.tick();
		t.update({ sessions: [] });
		t.advance(AUTO_RESTART_SETTLE_MS / 2);
		await t.tick();
		t.advance(AUTO_RESTART_SETTLE_MS / 2);
		await t.tick();
		expect(t.restart).not.toHaveBeenCalled();
		t.advance(AUTO_RESTART_SETTLE_MS / 2);
		await t.tick();
		expect(t.restart).toHaveBeenCalledTimes(1);
	});

	it("attempts at most once per built version, even when the restart fails", async () => {
		const t = setup();
		t.restart.mockRejectedValueOnce(new Error("boom"));
		for (let i = 0; i < 5; i++) {
			await t.tick();
			t.advance(AUTO_RESTART_SETTLE_MS);
		}
		expect(t.restart).toHaveBeenCalledTimes(1);
		expect(t.log).toHaveBeenCalledWith(
			"auto-restart: both restart for v1.2.0 failed: boom",
		);
		expect(t.log).toHaveBeenCalledWith(
			"auto-restart: skipped both restart for v1.2.0: already attempted",
		);
		t.update({ built: "1.3.0" });
		await t.tick();
		t.advance(AUTO_RESTART_SETTLE_MS);
		await t.tick();
		expect(t.restart).toHaveBeenCalledTimes(2);
	});

	it("logs each skip reason once while it holds", async () => {
		const t = setup({ buildPending: true });
		await t.tick();
		await t.tick();
		expect(t.log).toHaveBeenCalledTimes(1);
		expect(t.log).toHaveBeenCalledWith(
			"auto-restart: skipped both restart for v1.2.0: build pending",
		);
	});

	it("reports why it is waiting and clears once nothing is pending", async () => {
		const t = setup({
			sessions: [
				{ name: "a", status: "running" },
				{ name: "b", status: "running" },
			],
		});
		await t.tick();
		expect(t.report).toHaveBeenLastCalledWith(
			"waiting on 2 running sessions (a, b)",
		);
		t.update({ sessions: [] });
		await t.tick();
		expect(t.report).toHaveBeenLastCalledWith("idle · restarting within 60s");
		t.advance(AUTO_RESTART_SETTLE_MS);
		await t.tick();
		expect(t.report).toHaveBeenLastCalledWith("restarting");
		t.update({ restart: [] });
		await t.tick();
		expect(t.report).toHaveBeenLastCalledWith(undefined);
	});

	it("does nothing while switched off or with no restart pending", async () => {
		const off = setup({}, false);
		await off.tick();
		off.advance(AUTO_RESTART_SETTLE_MS);
		await off.tick();
		const none = setup({ restart: [] });
		await none.tick();
		none.advance(AUTO_RESTART_SETTLE_MS);
		await none.tick();
		expect(off.restart).not.toHaveBeenCalled();
		expect(none.restart).not.toHaveBeenCalled();
		expect(off.log).not.toHaveBeenCalled();
		expect(none.log).not.toHaveBeenCalled();
	});
});
