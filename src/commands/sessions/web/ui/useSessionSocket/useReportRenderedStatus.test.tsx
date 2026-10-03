// @vitest-environment jsdom
import { renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useReportRenderedStatus } from "./useReportRenderedStatus";
import { makeSessionInfo } from "../../../../../test/mothers/makeSessionInfo";

afterEach(() => vi.restoreAllMocks());

describe("useReportRenderedStatus", () => {
	it("reports each session's rendered status to the daemon and console", () => {
		const debug = vi.spyOn(console, "debug").mockImplementation(() => {});
		const send = vi.fn();

		renderHook(({ sessions }) => useReportRenderedStatus(sessions, send), {
			initialProps: {
				sessions: [
					makeSessionInfo({ id: "1", status: "running" }),
					makeSessionInfo({ id: "2", status: "waiting" }),
				],
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
			{
				initialProps: {
					sessions: [makeSessionInfo({ id: "7", status: "running" })],
				},
			},
		);
		rerender({ sessions: [makeSessionInfo({ id: "7", status: "running" })] });
		rerender({ sessions: [makeSessionInfo({ id: "7", status: "waiting" })] });

		expect(send).toHaveBeenCalledTimes(2);
		expect(send).toHaveBeenLastCalledWith({
			type: "ui-status",
			sessionId: "7",
			status: "waiting",
		});
	});
});
