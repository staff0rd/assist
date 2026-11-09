import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SessionClient } from "../broadcast";
import type { SessionManager } from "../SessionManager";
import { inboxHandlers } from "./inboxHandlers";

const mockScanNow = vi.fn();
const mockSendTo = vi.fn();
const mockDaemonLog = vi.fn();
const mockBlocker = vi.fn();

vi.mock("./inboxScanner", () => ({
	inboxScanner: { scanNow: (h: unknown) => mockScanNow(h) },
}));
vi.mock("../broadcast", () => ({
	sendTo: (_c: unknown, msg: unknown) => mockSendTo(msg),
}));
vi.mock("../daemonLog", () => ({
	daemonLog: (line: string) => mockDaemonLog(line),
}));
vi.mock("../../../inbox/inboxScanBlocker", () => ({
	inboxScanBlocker: (h: unknown) => mockBlocker(h),
}));

const scan = (data: Record<string, unknown>) =>
	inboxHandlers["inbox-scan"]({} as SessionClient, {} as SessionManager, data);

describe("inbox-scan handler", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("scans with the requested harness when inbox resolves available", () => {
		mockBlocker.mockReturnValue(undefined);
		mockScanNow.mockReturnValue(true);
		scan({ harness: "claude" });
		expect(mockBlocker).toHaveBeenCalledWith("claude");
		expect(mockScanNow).toHaveBeenCalledWith("claude");
		expect(mockSendTo).toHaveBeenCalledWith({
			type: "inbox-scan",
			started: true,
		});
	});

	it("refuses an unavailable harness with its reasons before scanning", () => {
		mockBlocker.mockReturnValue("Inbox scan is unavailable on Codex:\n  - x");
		scan({ harness: "codex" });
		expect(mockScanNow).not.toHaveBeenCalled();
		expect(mockSendTo).toHaveBeenCalledWith({
			type: "inbox-scan",
			started: false,
			error: "Inbox scan is unavailable on Codex:\n  - x",
		});
		expect(mockDaemonLog).toHaveBeenCalledWith(
			expect.stringContaining("inbox: scan refused before spawning"),
		);
	});

	it("ignores an unknown harness name and uses the default", () => {
		mockBlocker.mockReturnValue(undefined);
		mockScanNow.mockReturnValue(true);
		scan({ harness: "toString" });
		expect(mockScanNow).toHaveBeenCalledWith(undefined);
	});
});
