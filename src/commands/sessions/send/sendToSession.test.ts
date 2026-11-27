import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { requestTypeIntoSession } from "../daemon/requestTypeIntoSession";
import { sendToSession } from "./sendToSession";

vi.mock("../daemon/requestTypeIntoSession", () => ({
	requestTypeIntoSession: vi.fn(),
}));

const requestMock = requestTypeIntoSession as unknown as ReturnType<
	typeof vi.fn
>;

describe("sendToSession", () => {
	beforeEach(() => {
		vi.spyOn(console, "log").mockImplementation(() => {});
		vi.spyOn(console, "error").mockImplementation(() => {});
		vi.stubEnv("ASSIST_SESSION_ID", "");
	});

	afterEach(() => {
		vi.restoreAllMocks();
		vi.unstubAllEnvs();
		vi.clearAllMocks();
		process.exitCode = undefined;
	});

	it("submits the text as a prompt, passing a linked id unchanged", async () => {
		requestMock.mockResolvedValue({ ok: true, message: "Sent" });

		await sendToSession("win:3", "run the tests", {});

		expect(requestMock).toHaveBeenCalledWith({
			type: "type-prompt",
			sessionId: "win:3",
			text: "run the tests",
		});
		expect(console.log).toHaveBeenCalledWith("Sent");
		expect(process.exitCode).toBeUndefined();
	});

	it("names the sending session when run inside one", async () => {
		vi.stubEnv("ASSIST_SESSION_ID", "2");
		requestMock.mockResolvedValue({ ok: true, message: "Sent" });

		await sendToSession("11", "run the tests", {});

		expect(requestMock).toHaveBeenCalledWith({
			type: "type-prompt",
			sessionId: "11",
			text: "run the tests",
			fromSessionId: "2",
		});
	});

	it("never names the sender for --keys", async () => {
		vi.stubEnv("ASSIST_SESSION_ID", "2");
		requestMock.mockResolvedValue({ ok: true, message: "Sent keys" });

		await sendToSession("11", "y", { keys: true });

		expect(requestMock).toHaveBeenCalledWith({
			type: "type-keys",
			sessionId: "11",
			text: "y",
		});
	});

	it("sends decoded raw keystrokes with --keys", async () => {
		requestMock.mockResolvedValue({ ok: true, message: "Sent keys" });

		await sendToSession("7", String.raw`1\r`, { keys: true });

		expect(requestMock).toHaveBeenCalledWith({
			type: "type-keys",
			sessionId: "7",
			text: "1\r",
		});
	});

	it("reports the daemon's refusal and exits 1", async () => {
		requestMock.mockResolvedValue({
			ok: false,
			message: "assist session 9 was not found",
		});

		await sendToSession("9", "hi", {});

		expect(console.error).toHaveBeenCalledWith(
			"assist session 9 was not found",
		);
		expect(process.exitCode).toBe(1);
	});

	it("reports a missing daemon and exits 1", async () => {
		requestMock.mockRejectedValue(new Error("No sessions daemon is running"));

		await sendToSession("9", "hi", {});

		expect(console.error).toHaveBeenCalledWith("No sessions daemon is running");
		expect(process.exitCode).toBe(1);
	});
});
