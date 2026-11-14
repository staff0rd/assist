import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockReply = vi.fn();
vi.mock("../daemon/requestDaemonReply", () => ({
	requestDaemonReply: (...args: unknown[]) => mockReply(...args),
}));

import { deferToDaemon } from "./deferToDaemon";

describe("deferToDaemon", () => {
	let logged: string[];

	beforeEach(() => {
		mockReply.mockReset();
		logged = [];
		vi.spyOn(console, "log").mockImplementation((message: string) => {
			logged.push(message);
		});
		vi.stubEnv("ASSIST_SESSION_ID", "7");
		vi.stubEnv("ASSIST_SDK_AGENT", "1");
		vi.stubEnv("ASSIST_DEFERRED_RUN", "");
	});

	afterEach(() => {
		vi.unstubAllEnvs();
	});

	it("hands the command to the daemon and tells the agent to end its turn", async () => {
		mockReply.mockResolvedValue({ accepted: true });

		expect(await deferToDaemon("# Plan")).toBe(true);

		expect(mockReply).toHaveBeenCalledWith(
			expect.objectContaining({
				type: "defer-command",
				sessionId: "7",
				argv: process.argv.slice(2),
				stdin: "# Plan",
				cwd: process.cwd(),
			}),
			"defer-command-result",
		);
		expect(logged.join("\n")).toContain("End your turn now");
	});

	it("keeps the blocking path when the daemon declines", async () => {
		mockReply.mockResolvedValue({ accepted: false });

		expect(await deferToDaemon()).toBe(false);
		expect(logged).toEqual([]);
	});

	it("keeps the blocking path when the daemon is unreachable", async () => {
		mockReply.mockResolvedValue(undefined);

		expect(await deferToDaemon()).toBe(false);
	});

	it("does not ask the daemon outside a Claude (SDK) session", async () => {
		vi.stubEnv("ASSIST_SDK_AGENT", "");

		expect(await deferToDaemon()).toBe(false);
		expect(mockReply).not.toHaveBeenCalled();
	});

	it("does not hand the daemon's own run back to it", async () => {
		vi.stubEnv("ASSIST_DEFERRED_RUN", "1");

		expect(await deferToDaemon()).toBe(false);
		expect(mockReply).not.toHaveBeenCalled();
	});
});
