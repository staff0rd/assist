// @vitest-environment jsdom
import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { SessionInfo } from "../../../../../types";
import { useDiffComments } from "./useDiffComments";

afterEach(cleanup);
beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

const sessions = [
	{
		id: "daemon-1",
		claudeSessionId: "claude-1",
		name: "one",
		commandType: "claude",
		startedAt: 0,
		status: "running",
	},
] as SessionInfo[];

const comment = {
	path: "a.ts",
	startLine: 3,
	endLine: 3,
	quote: "const x = 1",
	note: "why",
};

describe("useDiffComments", () => {
	it("names the target session once a comment is sent", () => {
		const { result } = renderHook(() =>
			useDiffComments(sessions, "claude-1", vi.fn()),
		);
		expect(result.current.sentTo).toBeNull();

		act(() => result.current.onComment?.(comment));

		expect(result.current.sentTo).toBe("one");
	});

	it("dismisses the confirmation", () => {
		const { result } = renderHook(() =>
			useDiffComments(sessions, "claude-1", vi.fn()),
		);
		act(() => result.current.onComment?.(comment));

		act(() => result.current.clearSent());

		expect(result.current.sentTo).toBeNull();
	});

	it("offers no comment handler without a live session", () => {
		const { result } = renderHook(() =>
			useDiffComments(sessions, "claude-gone", vi.fn()),
		);

		expect(result.current.onComment).toBeUndefined();
		expect(result.current.unavailable).toBeTruthy();
	});
});
