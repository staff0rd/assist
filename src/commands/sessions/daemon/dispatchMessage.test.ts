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
				windowsProxy: { route: () => false },
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
				windowsProxy: { route: () => false },
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

		it("does not flag a resume as new", () => {
			const client = { send: vi.fn() };
			const manager = {
				windowsProxy: { route: () => false },
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
		it("kills sessions, acks, then exits", async () => {
			const exit = vi
				.spyOn(process, "exit")
				.mockImplementation((() => {}) as never);
			const client = { send: vi.fn() };
			const manager = { shutdown: vi.fn() } as unknown as SessionManager;

			dispatchMessage(client, manager, { type: "shutdown" });

			expect(manager.shutdown).toHaveBeenCalledOnce();
			expect(client.send).toHaveBeenCalledWith(
				JSON.stringify({ type: "shutting-down" }),
			);
			expect(exit).not.toHaveBeenCalled();
			await flush();
			expect(exit).toHaveBeenCalledWith(0);
		});
	});
});
