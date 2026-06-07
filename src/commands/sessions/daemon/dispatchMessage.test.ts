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
