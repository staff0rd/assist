import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { connectToDaemon } from "../daemon/connectToDaemon";
import { queryDaemon } from "../daemon/queryDaemon";
import { sendToDaemon } from "../daemon/sendToDaemon";
import { sendToSession } from "./sendToSession";

vi.mock("../daemon/connectToDaemon", () => ({ connectToDaemon: vi.fn() }));
vi.mock("../daemon/queryDaemon", () => ({ queryDaemon: vi.fn() }));
vi.mock("../daemon/sendToDaemon", () => ({ sendToDaemon: vi.fn() }));

const rename = (sessionId: string) => ({
	type: "rename",
	sessionId,
	title: "t",
});

describe("sendToSession", () => {
	beforeEach(() => {
		vi.mocked(connectToDaemon).mockResolvedValue({ destroy: vi.fn() } as never);
		vi.mocked(queryDaemon).mockResolvedValue({
			sessions: [{ id: "s1" }, { id: "laptop:s9" }] as never,
		});
		vi.mocked(sendToDaemon).mockResolvedValue(undefined);
		vi.spyOn(console, "error").mockImplementation(() => {});
	});

	afterEach(() => {
		vi.restoreAllMocks();
		vi.clearAllMocks();
		process.exitCode = undefined;
	});

	it.each(["s1", "laptop:s9"])(
		"sends the message for listed id %s",
		async (id) => {
			await sendToSession(id, rename);
			expect(sendToDaemon).toHaveBeenCalledWith(rename(id));
			expect(process.exitCode).toBeUndefined();
		},
	);

	it("fails with the known ids when the id matches no session", async () => {
		await sendToSession("nope", rename);
		expect(sendToDaemon).not.toHaveBeenCalled();
		expect(console.error).toHaveBeenCalledWith(
			"No session nope. Known ids (see assist sessions list): s1, laptop:s9",
		);
		expect(process.exitCode).toBe(1);
	});

	it("fails with the refusal without sending when the session is refused", async () => {
		await sendToSession("s1", rename, (s) => `no ${s.id}`);
		expect(sendToDaemon).not.toHaveBeenCalled();
		expect(console.error).toHaveBeenCalledWith("no s1");
		expect(process.exitCode).toBe(1);
	});

	it("fails when no daemon is running", async () => {
		vi.mocked(connectToDaemon).mockRejectedValue(new Error("ENOENT"));
		await sendToSession("s1", rename);
		expect(console.error).toHaveBeenCalledWith("No sessions daemon is running");
		expect(process.exitCode).toBe(1);
	});

	it("fails when the send to the daemon fails", async () => {
		vi.mocked(sendToDaemon).mockRejectedValue(new Error("timed out"));
		await sendToSession("s1", rename);
		expect(console.error).toHaveBeenCalledWith("timed out");
		expect(process.exitCode).toBe(1);
	});
});
