import { beforeEach, describe, expect, it, vi } from "vitest";
import { makeSession } from "../../../test/mothers/makeSession";
import { appendTranscriptEcho } from "./appendTranscriptEcho";
import type { Session } from "./createSession";
import { recordCheckNoteEcho } from "./recordCheckNoteEcho";

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
		recordCheckNoteEcho(session, {
			answers: { result: "works", note: "  looks good  " },
		});
		expect(appendTranscriptEcho).toHaveBeenCalledWith("conv-1", {
			at: expect.any(String),
			text: "looks good",
		});
		expect(session.lastEchoAt).toBeDefined();
	});

	it("records nothing for an empty note", () => {
		recordCheckNoteEcho(checkSession(true), {
			answers: { result: "works", note: "   " },
		});
		expect(appendTranscriptEcho).not.toHaveBeenCalled();
	});

	it("records nothing for a non-SDK session", () => {
		recordCheckNoteEcho(checkSession(false), {
			answers: { result: "works", note: "a note" },
		});
		expect(appendTranscriptEcho).not.toHaveBeenCalled();
	});
});
