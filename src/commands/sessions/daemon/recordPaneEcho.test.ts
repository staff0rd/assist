import { beforeEach, describe, expect, it, vi } from "vitest";
import { makeSession } from "../../../test/mothers/makeSession";
import { appendTranscriptEcho } from "./appendTranscriptEcho";
import type { Session } from "./createSession";
import { recordPaneEcho } from "./recordPaneEcho";

vi.mock("./appendTranscriptEcho", () => ({ appendTranscriptEcho: vi.fn() }));
vi.mock("../shared/conversationOf", () => ({
	conversationOf: () => ({ id: "conv-1" }),
}));

function checkSession(sdk: boolean): Session {
	return makeSession({
		id: "1",
		pty: (sdk ? { sdk: {} } : {}) as Session["pty"],
		pendingPrPreview: {
			requestId: "r1",
			title: "Check",
			body: "",
			prNumber: null,
			kind: "check",
		},
	});
}

describe("recordCheckNoteEcho", () => {
	beforeEach(() => vi.mocked(appendTranscriptEcho).mockClear());

	it("echoes a check note for an SDK session", () => {
		const session = checkSession(true);
		recordPaneEcho(session, {
			answers: { result: "works", note: "  looks good  " },
		});
		expect(appendTranscriptEcho).toHaveBeenCalledWith("conv-1", {
			at: expect.any(String),
			text: "looks good",
		});
		expect(session.lastEchoAt).toBeDefined();
	});

	it("records nothing for an empty note", () => {
		recordPaneEcho(checkSession(true), {
			answers: { result: "works", note: "   " },
		});
		expect(appendTranscriptEcho).not.toHaveBeenCalled();
	});

	it("records nothing for a non-SDK session", () => {
		recordPaneEcho(checkSession(false), {
			answers: { result: "works", note: "a note" },
		});
		expect(appendTranscriptEcho).not.toHaveBeenCalled();
	});

	it("echoes an ask reject reason", () => {
		const session = makeSession({
			id: "1",
			pty: { sdk: {} } as Session["pty"],
			pendingPrPreview: {
				requestId: "r1",
				title: "Plan",
				body: "",
				prNumber: null,
				kind: "ask",
			},
		});
		recordPaneEcho(session, { decision: "reject", reason: "Redo it" });
		expect(appendTranscriptEcho).toHaveBeenCalledWith("conv-1", {
			at: expect.any(String),
			text: "Redo it",
		});
	});
});
