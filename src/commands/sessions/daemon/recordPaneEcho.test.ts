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

	it("records Dismissed for a dismissed question", () => {
		recordPaneEcho(paneSession("question"), {
			answers: { "Which colour?": "Red" },
			dismissed: true,
		});
		expect(appendTranscriptEcho).toHaveBeenCalledWith("conv-1", {
			at: expect.any(String),
			command: "ask-question",
			text: "Dismissed",
		});
	});

	it("records nothing for a non-SDK session", () => {
		recordPaneEcho(paneSession("question", false), {
			answers: { "Which colour?": "Red" },
		});
		expect(appendTranscriptEcho).not.toHaveBeenCalled();
	});

	it.each([
		[
			"check",
			{ answers: { result: "works", note: "ok" } },
			"ask-check",
			"Works\n\nok",
		],
		["ask", { decision: "approve" }, "ask", "Approved"],
		[
			"backlog-item",
			{ decision: "reject", reason: "No" },
			"backlog",
			"Rejected\n\nNo",
		],
		["rule", { decision: "approve" }, "rules", "Approved"],
		["design", { decision: "approve" }, "ask-design", "Approved"],
	] as const)(
		"records a %s reply tied to its command",
		(kind, d, command, text) => {
			recordPaneEcho(paneSession(kind, true, ""), d);
			expect(appendTranscriptEcho).toHaveBeenCalledWith("conv-1", {
				at: expect.any(String),
				command,
				text,
			});
		},
	);

	it("records nothing for a preview kind with no reply", () => {
		recordPaneEcho(paneSession("pr", true, ""), { decision: "approve" });
		expect(appendTranscriptEcho).not.toHaveBeenCalled();
	});
});
