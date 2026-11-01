import { writeFileSync } from "node:fs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type * as fsMockModule from "../../test/mocks/fsMock";

const mockShowNotification = vi.fn();
const mockRequestDaemonReply =
	vi.fn<(request: Record<string, unknown>) => Promise<unknown>>();

vi.mock("../notify/showNotification", () => ({
	showNotification: (...args: unknown[]) => mockShowNotification(...args),
}));

vi.mock("../sessions/daemon/requestDaemonReply", () => ({
	requestDaemonReply: (request: Record<string, unknown>) =>
		mockRequestDaemonReply(request),
}));

vi.mock("node:fs", async () =>
	(
		await vi.importActual<typeof fsMockModule>("../../test/mocks/fsMock")
	).fsMock(),
);

const mockWriteFileSync = vi.mocked(writeFileSync);

vi.mock("./sweepRestrictedDir", () => ({
	sweepRestrictedDir: vi.fn(),
}));

import { codeCommentSet } from "./codeCommentSet";

describe("codeCommentSet", () => {
	let logSpy: ReturnType<typeof vi.spyOn>;
	let errorSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		vi.clearAllMocks();
		process.exitCode = undefined;
		mockShowNotification.mockReturnValue(true);
		mockRequestDaemonReply.mockResolvedValue(undefined);
		vi.stubEnv("ASSIST_SESSION_ID", "");
		logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
		errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
	});

	afterEach(() => {
		logSpy.mockRestore();
		errorSpy.mockRestore();
		vi.unstubAllEnvs();
		process.exitCode = undefined;
	});

	function issuedPin(): string {
		const payload = JSON.parse(String(mockWriteFileSync.mock.calls[0][1]));
		return payload.pin as string;
	}

	function stdout(): string {
		return logSpy.mock.calls.map((c: unknown[]) => String(c[0])).join("\n");
	}

	it("does not print the pin value to stdout", async () => {
		await codeCommentSet("src/foo.ts", "10", "guards the edge case");

		const pin = issuedPin();
		expect(pin).toBeTruthy();
		expect(stdout()).not.toContain(pin);
		expect(stdout()).toContain("confirm <PIN>");
	});

	it("delivers the pin via showNotification", async () => {
		await codeCommentSet("src/foo.ts", "10", "guards the edge case");

		const pin = issuedPin();
		expect(mockShowNotification).toHaveBeenCalledTimes(1);
		const arg = mockShowNotification.mock.calls[0][0] as {
			title: string;
			message: string;
		};
		expect(arg.message).toContain(pin);
	});

	it("relays the pin to the session's controlling node instead of notifying locally", async () => {
		vi.stubEnv("ASSIST_SESSION_ID", "3");
		mockRequestDaemonReply.mockImplementation(async (request) => ({
			type: "notify-pin-result",
			requestId: request.requestId,
			node: "mac",
		}));

		await codeCommentSet("src/foo.ts", "10", "guards the edge case");

		const pin = issuedPin();
		expect(mockRequestDaemonReply).toHaveBeenCalledWith(
			expect.objectContaining({
				type: "notify-pin",
				sessionId: "3",
				area: "code-comment",
				pin,
			}),
		);
		expect(mockShowNotification).not.toHaveBeenCalled();
		expect(process.exitCode).toBeUndefined();
		expect(stdout()).toContain("on mac");
		expect(stdout()).toContain("run in this session:");
		expect(stdout()).not.toContain(pin);
	});

	it("notifies locally when the daemon names no viewer node", async () => {
		vi.stubEnv("ASSIST_SESSION_ID", "3");

		await codeCommentSet("src/foo.ts", "10", "guards the edge case");

		expect(mockRequestDaemonReply).toHaveBeenCalled();
		expect(mockShowNotification).toHaveBeenCalledTimes(1);
		expect(stdout()).not.toContain("controlling this session");
	});

	it("surfaces a failure when the notification cannot be delivered", async () => {
		mockShowNotification.mockReturnValue(false);

		await codeCommentSet("src/foo.ts", "10", "guards the edge case");

		expect(process.exitCode).toBe(1);
		const pin = issuedPin();
		expect(stdout()).not.toContain(pin);
		const errors = errorSpy.mock.calls
			.map((c: unknown[]) => String(c[0]))
			.join("\n");
		expect(errors).toContain("Could not deliver");
	});

	it("describes a # marker insertion for a Dockerfile", async () => {
		await codeCommentSet("Dockerfile", "3", "pins the base image digest");

		expect(stdout()).toContain('insert "# pins the base image digest"');
	});

	it("describes a # marker insertion for a .sh file", async () => {
		await codeCommentSet("deploy.sh", "8", "retry for eventual consistency");

		expect(stdout()).toContain('insert "# retry for eventual consistency"');
	});

	it("describes a // marker insertion for a .cs file", async () => {
		await codeCommentSet("src/Program.cs", "12", "guards a nullable edge case");

		expect(stdout()).toContain('insert "// guards a nullable edge case"');
	});

	it("does not issue a pin or notify when the comment text is invalid", async () => {
		await codeCommentSet("src/foo.ts", "10", "/* not allowed */");

		expect(process.exitCode).toBe(1);
		expect(mockWriteFileSync).not.toHaveBeenCalled();
		expect(mockShowNotification).not.toHaveBeenCalled();
	});
});
