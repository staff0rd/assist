import { beforeEach, describe, expect, it, vi } from "vitest";
import type { DeferredResult } from "./runDeferredCommand";
import type { SessionManager } from "./SessionManager";
import type { Session } from "./types";

vi.mock("./daemonLog", () => ({ daemonLog: vi.fn() }));

const mockRun = vi.fn();
vi.mock("./runDeferredCommand", () => ({
	runDeferredCommand: (...args: unknown[]) => mockRun(...args),
}));

import { handleReopenHighLevelReview } from "./handleReopenHighLevelReview";

const argv = ["review", "--high-level", "42", "--reuse-slices"];

function setup(live = true) {
	const sdk = { send: vi.fn() };
	const session = {
		id: "7",
		cwd: "/repo",
		status: "waiting",
		pty: live ? { sdk } : undefined,
	} as unknown as Session;
	const manager = {
		session: (id: string) => (id === "7" ? session : undefined),
		io: { typePrompt: vi.fn() },
	} as unknown as SessionManager;
	const client = { send: vi.fn() };
	handleReopenHighLevelReview(client, manager, {
		sessionId: "7",
		prNumber: 42,
	});
	return { sdk, session, client };
}

function replies(client: { send: ReturnType<typeof vi.fn> }) {
	return client.send.mock.calls.map(([raw]) => JSON.parse(raw as string));
}

function finishWith(result: DeferredResult) {
	(mockRun.mock.calls[0][1] as (r: DeferredResult) => void)(result);
}

function emit(output: string) {
	(mockRun.mock.calls[0][3] as (o: string) => void)(output);
}

describe("reopen-high-level-review handler", () => {
	beforeEach(() => {
		mockRun.mockReset().mockReturnValue(123);
	});

	it("runs the review from saved slices as a tracked deferred command in the session's tree", () => {
		const { session } = setup();

		expect(mockRun.mock.calls[0][0]).toMatchObject({
			argv,
			cwd: "/repo",
			env: expect.objectContaining({ ASSIST_SESSION_ID: "7" }),
		});
		expect(session.deferredCommands).toEqual([{ argv, cwd: "/repo" }]);
	});

	it("replies ok once the review pane opens and delivers the verdict as the next message", () => {
		const { sdk, session, client } = setup();

		emit("Awaiting your approval in the assist web UI preview pane…\n");
		expect(replies(client)).toEqual([
			{ type: "reopen-high-level-review-result", ok: true },
		]);

		finishWith({ output: "Verdict: approve\n", exitCode: 0 });

		expect(sdk.send).toHaveBeenCalledWith(
			expect.stringContaining("Verdict: approve"),
		);
		expect(replies(client)).toHaveLength(1);
		expect(session.deferredCommands).toBeUndefined();
	});

	it("replies with the error and delivers nothing when no slices are saved", () => {
		const { sdk, session, client } = setup();

		finishWith({
			output: "Checked out #42\nNo saved slices for #42 at 8a6d21d\n",
			exitCode: 1,
		});

		expect(replies(client)).toEqual([
			{
				type: "reopen-high-level-review-result",
				ok: false,
				error: "No saved slices for #42 at 8a6d21d",
			},
		]);
		expect(sdk.send).not.toHaveBeenCalled();
		expect(session.deferredCommands).toBeUndefined();
	});

	it("delivers any other failure to the session", () => {
		const { sdk, client } = setup();

		finishWith({ output: "Error: gh failed\n", exitCode: 1 });

		expect(sdk.send).toHaveBeenCalledWith(
			expect.stringContaining("Error: gh failed"),
		);
		expect(replies(client)).toEqual([
			{ type: "reopen-high-level-review-result", ok: true },
		]);
	});

	it("declines a session that is not live", () => {
		const { client } = setup(false);

		expect(mockRun).not.toHaveBeenCalled();
		expect(replies(client)).toEqual([
			{
				type: "reopen-high-level-review-result",
				ok: false,
				error: "The session is not live.",
			},
		]);
	});
});
