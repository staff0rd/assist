import { afterEach, describe, expect, it, vi } from "vitest";
import { dispatchMessage } from "./dispatchMessage";
import type { SessionManager } from "./SessionManager";

function flush(): Promise<void> {
	return new Promise((resolve) => setImmediate(resolve));
}

describe("dispatchMessage", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe("created acks", () => {
		it("flags a fresh create as new", () => {
			const client = { send: vi.fn() };
			const manager = {
				links: { route: () => false },
				spawn: vi.fn(() => "s1"),
			} as unknown as SessionManager;

			dispatchMessage(client, manager, { type: "create" });

			expect(client.send).toHaveBeenCalledWith(
				JSON.stringify({ type: "created", sessionId: "s1", isNew: true }),
			);
		});

		it("flags create-run and create-assist as new", () => {
			const client = { send: vi.fn() };
			const manager = {
				links: { route: () => false },
				spawnRun: vi.fn(() => "s2"),
				spawnAssist: vi.fn(() => "s3"),
			} as unknown as SessionManager;

			dispatchMessage(client, manager, { type: "create-run", runName: "x" });
			dispatchMessage(client, manager, { type: "create-assist" });

			expect(client.send).toHaveBeenNthCalledWith(
				1,
				JSON.stringify({ type: "created", sessionId: "s2", isNew: true }),
			);
			expect(client.send).toHaveBeenNthCalledWith(
				2,
				JSON.stringify({ type: "created", sessionId: "s3", isNew: true }),
			);
		});

		it("forwards the in-place flag from a create-assist", () => {
			const client = { send: vi.fn() };
			const spawnAssist = vi.fn(() => "s4");
			const manager = {
				links: { route: () => false },
				spawnAssist,
			} as unknown as SessionManager;

			dispatchMessage(client, manager, {
				type: "create-assist",
				assistArgs: ["review", "42"],
				cwd: "/git/repo",
				inPlace: true,
			});

			expect(spawnAssist).toHaveBeenCalledWith(
				["review", "42"],
				"/git/repo",
				{ title: undefined, subtitle: undefined, inPlace: true },
				{ launchedFrom: undefined },
			);
		});

		it("forwards the in-place flag from a create", () => {
			const client = { send: vi.fn() };
			const spawn = vi.fn(() => "s5");
			const manager = {
				links: { route: () => false },
				spawn,
			} as unknown as SessionManager;

			dispatchMessage(client, manager, {
				type: "create",
				prompt: "/prs-slack 42 --no-confirm",
				cwd: "/git/repo",
				inPlace: true,
			});

			expect(spawn).toHaveBeenCalledWith(
				{
					prompt: "/prs-slack 42 --no-confirm",
					cwd: "/git/repo",
					design: false,
					auto: false,
					harness: undefined,
					inPlace: true,
				},
				{ launchedFrom: undefined },
			);
		});

		it("does not flag a resume as new", () => {
			const client = { send: vi.fn() };
			const manager = {
				links: { route: () => false },
				resume: vi.fn(() => "s4"),
			} as unknown as SessionManager;

			dispatchMessage(client, manager, {
				type: "resume",
				sessionId: "s4",
				cwd: "/repo",
			});

			expect(client.send).toHaveBeenCalledWith(
				JSON.stringify({ type: "created", sessionId: "s4", isNew: false }),
			);
		});
	});

	describe("set-active", () => {
		it("records the per-repo active selection on the manager", () => {
			const client = { send: vi.fn() };
			const set = vi.fn();
			const manager = { active: { set } } as unknown as SessionManager;

			dispatchMessage(client, manager, {
				type: "set-active",
				cwd: "/repo",
				sessionId: "s1",
			});

			expect(set).toHaveBeenCalledWith("/repo", "s1");
		});
	});

	describe("set-status", () => {
		it("sets the routed session's status on the manager", () => {
			const client = { send: vi.fn() };
			const setStatus = vi.fn();
			const manager = {
				links: { route: () => false },
				setStatus,
			} as unknown as SessionManager;

			dispatchMessage(client, manager, {
				type: "set-status",
				sessionId: "s1",
				status: "waiting",
			});

			expect(setStatus).toHaveBeenCalledWith({
				id: "s1",
				status: "waiting",
				source: undefined,
				claudeSessionId: undefined,
			});
		});

		describe("when the session is windows-routed", () => {
			it("forwards to the windows daemon without touching the manager", () => {
				const client = { send: vi.fn() };
				const setStatus = vi.fn();
				const manager = {
					links: { route: () => true },
					setStatus,
				} as unknown as SessionManager;

				dispatchMessage(client, manager, {
					type: "set-status",
					sessionId: "s1",
					status: "running",
				});

				expect(setStatus).not.toHaveBeenCalled();
			});
		});
	});

	describe("subscribe-logs", () => {
		it("subscribes the client to the hub's log stream", () => {
			const client = { send: vi.fn() };
			const subscribeLogs = vi.fn();
			const manager = {
				clients: { subscribeLogs },
			} as unknown as SessionManager;

			dispatchMessage(client, manager, { type: "subscribe-logs" });

			expect(subscribeLogs).toHaveBeenCalledWith(client, true);
		});

		it("forwards replay: false so the web stream skips buffered history", () => {
			const client = { send: vi.fn() };
			const subscribeLogs = vi.fn();
			const manager = {
				clients: { subscribeLogs },
			} as unknown as SessionManager;

			dispatchMessage(client, manager, {
				type: "subscribe-logs",
				replay: false,
			});

			expect(subscribeLogs).toHaveBeenCalledWith(client, false);
		});
	});

	describe("limits", () => {
		it("forwards reported rate limits to the client hub", () => {
			const client = { send: vi.fn() };
			const updateLimits = vi.fn();
			const manager = {
				clients: { updateLimits },
			} as unknown as SessionManager;
			const rateLimits = {
				five_hour: { used_percentage: 12, resets_at: 100 },
				seven_day: { used_percentage: 34, resets_at: 200 },
			};

			dispatchMessage(client, manager, { type: "limits", rateLimits });

			expect(updateLimits).toHaveBeenCalledWith(rateLimits);
		});
	});

	describe("shutdown", () => {
		it("flushes active time, kills sessions, acks, then exits", async () => {
			const exit = vi
				.spyOn(process, "exit")
				.mockImplementation((() => {}) as never);
			const client = { send: vi.fn() };
			const flushActiveMs = vi.fn(() => Promise.resolve());
			const manager = {
				flushActiveMs,
				shutdown: vi.fn(),
			} as unknown as SessionManager;

			dispatchMessage(client, manager, { type: "shutdown" });

			expect(exit).not.toHaveBeenCalled();
			await flush();
			await flush();

			expect(flushActiveMs).toHaveBeenCalledOnce();
			expect(manager.shutdown).toHaveBeenCalledOnce();
			expect(client.send).toHaveBeenCalledWith(
				JSON.stringify({ type: "shutting-down" }),
			);
			expect(exit).toHaveBeenCalledWith(0);
		});
	});
});
