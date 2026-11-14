import { beforeEach, describe, expect, it, vi } from "vitest";
import { supersededPreviewMessage } from "../shared/supersededPreviewMessage";
import type { DeferredResult } from "./runDeferredCommand";
import type { SessionManager } from "./SessionManager";

vi.mock("./daemonLog", () => ({ daemonLog: vi.fn() }));

const mockRun = vi.fn();
vi.mock("./runDeferredCommand", () => ({
	runDeferredCommand: (...args: unknown[]) => mockRun(...args),
}));

import { handleDeferCommand } from "./handleDeferCommand";

const request = {
	sessionId: "7",
	argv: ["ask", "--title", "Plan", "--body", "-"],
	stdin: "# Plan",
	cwd: "/repo",
	env: { ASSIST_SESSION_ID: "7" },
};

function managerWith(sdk: { send: ReturnType<typeof vi.fn> } | undefined) {
	const sessions = new Map(
		sdk ? [["7", { id: "7", pty: { sdk } }]] : ([] as never[]),
	);
	return {
		sessions,
		manager: {
			session: (id: string) => sessions.get(id),
		} as unknown as SessionManager,
	};
}

function replies(client: { send: ReturnType<typeof vi.fn> }) {
	return client.send.mock.calls.map(([raw]) => JSON.parse(raw as string));
}

function finishWith(result: DeferredResult) {
	const onDone = mockRun.mock.calls[0][1] as (r: DeferredResult) => void;
	onDone(result);
}

describe("defer-command handler", () => {
	beforeEach(() => {
		mockRun.mockReset().mockReturnValue(123);
	});

	it("declines a session that is not a Claude (SDK) session", () => {
		const client = { send: vi.fn() };

		handleDeferCommand(client, managerWith(undefined).manager, request);

		expect(mockRun).not.toHaveBeenCalled();
		expect(replies(client)).toEqual([
			{ type: "defer-command-result", accepted: false },
		]);
	});

	it("runs the command and delivers its decision as the session's next message", () => {
		const client = { send: vi.fn() };
		const sdk = { send: vi.fn() };

		handleDeferCommand(client, managerWith(sdk).manager, request);

		expect(mockRun).toHaveBeenCalledWith(
			{
				argv: request.argv,
				stdin: "# Plan",
				cwd: "/repo",
				env: request.env,
			},
			expect.any(Function),
		);
		expect(replies(client)).toEqual([
			{ type: "defer-command-result", accepted: true },
		]);
		expect(sdk.send).not.toHaveBeenCalled();

		finishWith({ output: "Approved.\n", exitCode: 0 });

		expect(sdk.send).toHaveBeenCalledWith(
			"`assist ask` finished with exit code 0:\n\nApproved.",
		);
	});

	it("delivers a rejection with its exit code", () => {
		const sdk = { send: vi.fn() };
		handleDeferCommand({ send: vi.fn() }, managerWith(sdk).manager, request);

		finishWith({ output: "Plan rejected: no\n", exitCode: 1 });

		expect(sdk.send).toHaveBeenCalledWith(
			"`assist ask` finished with exit code 1:\n\nPlan rejected: no",
		);
	});

	it("delivers nothing when the preview was superseded", () => {
		const sdk = { send: vi.fn() };
		handleDeferCommand({ send: vi.fn() }, managerWith(sdk).manager, request);

		finishWith({
			output: `Awaiting your approval…\n${supersededPreviewMessage}\n`,
			exitCode: 0,
		});

		expect(sdk.send).not.toHaveBeenCalled();
	});

	it("drops the delivery when the session has gone", () => {
		const sdk = { send: vi.fn() };
		const { sessions, manager } = managerWith(sdk);
		handleDeferCommand({ send: vi.fn() }, manager, request);
		sessions.clear();

		finishWith({ output: "Approved.\n", exitCode: 0 });

		expect(sdk.send).not.toHaveBeenCalled();
	});
});
