// @vitest-environment jsdom
import { renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { SessionInfo } from "./types";
import { useReportRenderedStatus } from "./useReportRenderedStatus";

function session(id: string, status: SessionInfo["status"]): SessionInfo {
	return { id, name: id, commandType: "claude", status, startedAt: 0 };
}

afterEach(() => vi.restoreAllMocks());

describe("useReportRenderedStatus", () => {
	it("reports each session's rendered status to the daemon and console", () => {
		const debug = vi.spyOn(console, "debug").mockImplementation(() => {});
		const send = vi.fn();

		renderHook(({ sessions }) => useReportRenderedStatus(sessions, send), {
			initialProps: {
				sessions: [session("1", "running"), session("2", "waiting")],
			},
		});

		expect(send).toHaveBeenCalledWith({
			type: "ui-status",
			sessionId: "1",
			status: "running",
		});
		expect(send).toHaveBeenCalledWith({
			type: "ui-status",
			sessionId: "2",
			status: "waiting",
		});
		expect(debug).toHaveBeenCalledWith(
			"[sessions] render session 1 status=running",
		);
	});

	it("only reports a session when its rendered status changes", () => {
		vi.spyOn(console, "debug").mockImplementation(() => {});
		const send = vi.fn();

		const { rerender } = renderHook(
			({ sessions }) => useReportRenderedStatus(sessions, send),
			{ initialProps: { sessions: [session("7", "running")] } },
		);
		rerender({ sessions: [session("7", "running")] });
		rerender({ sessions: [session("7", "waiting")] });

		expect(send).toHaveBeenCalledTimes(2);
		expect(send).toHaveBeenLastCalledWith({
			type: "ui-status",
			sessionId: "7",
			status: "waiting",
		});
	});
});
