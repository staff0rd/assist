import { beforeEach, describe, expect, it, vi } from "vitest";
import { makeSession } from "../../../test/mothers/makeSession";
import type { PrPreview } from "../shared/SessionInfoBase";
import { appendTranscriptEcho } from "./appendTranscriptEcho";
import type { Session } from "./createSession";
import { recordPaneEcho } from "./recordPaneEcho";

vi.mock("./appendTranscriptEcho", () => ({ appendTranscriptEcho: vi.fn() }));
vi.mock("../shared/conversationOf", () => ({
	conversationOf: () => ({ id: "conv-1" }),
}));

const questionBody = JSON.stringify({
	questions: [
		{
			question: "Which colour?",
			header: "Colour",
			multiSelect: false,
			options: [
				{ label: "Red", description: "" },
				{ label: "Blue", description: "" },
			],
		},
	],
});

function paneSession(
	kind: PrPreview["kind"],
	sdk = true,
	body = questionBody,
): Session {
	return makeSession({
		id: "1",
		pty: (sdk ? { sdk: {} } : {}) as Session["pty"],
		pendingPrPreview: {
			requestId: "r1",
			title: "T",
			body,
			prNumber: null,
			kind,
		},
	});
}

describe("recordPaneEcho", () => {
	beforeEach(() => vi.mocked(appendTranscriptEcho).mockClear());

	it("records a question's full answer tied to ask-question", () => {
		const session = paneSession("question");
		recordPaneEcho(session, {
			answers: { "Which colour?": "Red, but darker" },
		});
		expect(appendTranscriptEcho).toHaveBeenCalledWith("conv-1", {
			at: expect.any(String),
			command: "ask-question",
			text: "Red, but darker",
		});
		expect(session.lastEchoAt).toBeDefined();
	});

	it("records nothing for a dismissed question", () => {
		recordPaneEcho(paneSession("question"), {
			answers: { "Which colour?": "Red" },
			dismissed: true,
		});
		expect(appendTranscriptEcho).not.toHaveBeenCalled();
	});

	it("records nothing for a non-SDK session", () => {
		recordPaneEcho(paneSession("question", false), {
			answers: { "Which colour?": "Red" },
		});
		expect(appendTranscriptEcho).not.toHaveBeenCalled();
	});

	it("records nothing for a check note", () => {
		recordPaneEcho(paneSession("check", true, ""), {
			answers: { result: "works", note: "a note" },
		});
		expect(appendTranscriptEcho).not.toHaveBeenCalled();
	});
});
