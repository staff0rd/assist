import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { diffCommentSender } from "./diffCommentSender";
import type { SessionInfo } from "../../../../../../types";

const ESC = String.fromCharCode(27);

const session = {
	id: "daemon-1",
	claudeSessionId: "claude-1",
	name: "one",
	commandType: "claude",
	startedAt: 0,
	status: "running",
} as SessionInfo;

const comment = {
	path: "a.ts",
	startLine: 3,
	endLine: 3,
	quote: "const x = 1",
	note: "why",
};

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe("diffCommentSender", () => {
	it("writes the formatted comment to the daemon id as a bracketed paste", () => {
		const sendInput = vi.fn();

		diffCommentSender(session, sendInput, vi.fn())(comment);

		expect(sendInput).toHaveBeenCalledWith(
			"daemon-1",
			`${ESC}[200~a.ts:3\r\r\`\`\`\rconst x = 1\r\`\`\`\r\rwhy${ESC}[201~`,
		);
	});

	it("submits separately from the paste, which the tui would otherwise swallow", () => {
		const sendInput = vi.fn();

		diffCommentSender(session, sendInput, vi.fn())(comment);

		expect(sendInput).toHaveBeenCalledTimes(1);
		vi.runAllTimers();
		expect(sendInput).toHaveBeenCalledTimes(2);
		expect(sendInput).toHaveBeenLastCalledWith("daemon-1", "\r");
	});

	it("reports the send so it can be confirmed", () => {
		const onSent = vi.fn();

		diffCommentSender(session, vi.fn(), onSent)(comment);

		expect(onSent).toHaveBeenCalledTimes(1);
	});
});
