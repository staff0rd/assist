import { describe, expect, it, vi } from "vitest";
import {
	AUTO_RESTART_SETTLE_MS,
	type AutoRestartSnapshot,
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
	const tick = createAutoRestartCheck({
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
		tick,
		restart,
		log,
		advance: (ms: number) => {
			clock += ms;
		},
		update: (next: Partial<AutoRestartSnapshot>) => {
			snap = { ...snap, ...next };
		},
	};
}

describe("createAutoRestartCheck", () => {
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
			"auto-restart: skipped both restart: already attempted for v1.2.0",
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
