import { afterEach, describe, expect, it, vi } from "vitest";
import { logRenderedStatus } from "./logRenderedStatus";
import type { SessionInfo } from "./types";

function session(id: string, status: SessionInfo["status"]): SessionInfo {
	return {
		id,
		name: id,
		commandType: "claude",
		status,
		startedAt: 0,
	};
}

afterEach(() => vi.restoreAllMocks());

describe("logRenderedStatus", () => {
	it("logs each session's rendered status", () => {
		const debug = vi.spyOn(console, "debug").mockImplementation(() => {});

		logRenderedStatus([session("1", "running"), session("2", "waiting")]);

		expect(debug).toHaveBeenCalledWith(
			"[sessions] render session 1 status=running",
		);
		expect(debug).toHaveBeenCalledWith(
			"[sessions] render session 2 status=waiting",
		);
	});

	it("only logs a session when its rendered status changes", () => {
		const debug = vi.spyOn(console, "debug").mockImplementation(() => {});

		logRenderedStatus([session("7", "running")]);
		logRenderedStatus([session("7", "running")]);
		logRenderedStatus([session("7", "waiting")]);

		expect(debug).toHaveBeenCalledTimes(2);
		expect(debug).toHaveBeenLastCalledWith(
			"[sessions] render session 7 status=waiting",
		);
	});
});
