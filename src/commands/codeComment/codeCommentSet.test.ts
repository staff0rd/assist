import { writeFileSync } from "node:fs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type * as fsMockModule from "../../test/mocks/fsMock";

const mockShowNotification = vi.fn();

vi.mock("../notify/showNotification", () => ({
	showNotification: (...args: unknown[]) => mockShowNotification(...args),
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
		logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
		errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
	});

	afterEach(() => {
		logSpy.mockRestore();
		errorSpy.mockRestore();
		process.exitCode = undefined;
	});

	function issuedPin(): string {
		const payload = JSON.parse(String(mockWriteFileSync.mock.calls[0][1]));
		return payload.pin as string;
	}

	function stdout(): string {
		return logSpy.mock.calls.map((c: unknown[]) => String(c[0])).join("\n");
	}

	it("does not print the pin value to stdout", () => {
		codeCommentSet("src/foo.ts", "10", "guards the edge case");

		const pin = issuedPin();
		expect(pin).toBeTruthy();
		expect(stdout()).not.toContain(pin);
		expect(stdout()).toContain("confirm <PIN>");
	});

	it("delivers the pin via showNotification", () => {
		codeCommentSet("src/foo.ts", "10", "guards the edge case");

		const pin = issuedPin();
		expect(mockShowNotification).toHaveBeenCalledTimes(1);
		const arg = mockShowNotification.mock.calls[0][0] as {
			title: string;
			message: string;
		};
		expect(arg.message).toContain(pin);
	});

	it("surfaces a failure when the notification cannot be delivered", () => {
		mockShowNotification.mockReturnValue(false);

		codeCommentSet("src/foo.ts", "10", "guards the edge case");

		expect(process.exitCode).toBe(1);
		const pin = issuedPin();
		expect(stdout()).not.toContain(pin);
		const errors = errorSpy.mock.calls
			.map((c: unknown[]) => String(c[0]))
			.join("\n");
		expect(errors).toContain("Could not deliver");
	});

	it("describes a # marker insertion for a Dockerfile", () => {
		codeCommentSet("Dockerfile", "3", "pins the base image digest");

		expect(stdout()).toContain('insert "# pins the base image digest"');
	});

	it("describes a # marker insertion for a .sh file", () => {
		codeCommentSet("deploy.sh", "8", "retry for eventual consistency");

		expect(stdout()).toContain('insert "# retry for eventual consistency"');
	});

	it("describes a // marker insertion for a .cs file", () => {
		codeCommentSet("src/Program.cs", "12", "guards a nullable edge case");

		expect(stdout()).toContain('insert "// guards a nullable edge case"');
	});

	it("does not issue a pin or notify when the comment text is invalid", () => {
		codeCommentSet("src/foo.ts", "10", "/* not allowed */");

		expect(process.exitCode).toBe(1);
		expect(mockWriteFileSync).not.toHaveBeenCalled();
		expect(mockShowNotification).not.toHaveBeenCalled();
	});
});
