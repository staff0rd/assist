import { describe, expect, it } from "vitest";
import { fileCommentTarget } from "./fileCommentTarget";
import type { SessionInfo } from "../../../../../../types";

const sessions = [
	{ id: "daemon-1", name: "one", status: "running" },
	{ id: "daemon-2", name: "two", status: "stopped" },
] as SessionInfo[];

describe("fileCommentTarget", () => {
	it("targets the selected card's session", () => {
		expect(fileCommentTarget(sessions, "daemon-1").session?.name).toBe("one");
	});

	it("asks for a card when none is selected", () => {
		expect(fileCommentTarget(sessions, null).unavailable).toBe(
			"Select a session card to comment on this file.",
		);
	});

	it("reports a historical card as no longer live", () => {
		expect(fileCommentTarget(sessions, "history-9").unavailable).toBe(
			"Comments are unavailable — that session is no longer live.",
		);
	});

	it("reports a stopped session as no longer live", () => {
		expect(fileCommentTarget(sessions, "daemon-2").unavailable).toBeTruthy();
	});
});
