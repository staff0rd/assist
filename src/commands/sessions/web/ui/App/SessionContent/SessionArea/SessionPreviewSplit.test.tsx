// @vitest-environment jsdom
import {
	act,
	cleanup,
	fireEvent,
	render,
	screen,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { makeSessionInfo } from "../../../../../../../test/mothers/makeSessionInfo";
import type { PrPreview } from "../../../../../shared/SessionInfoBase";
import { fetchEntries } from "../../ConfigView/useConfigEntries/fetchEntries";
import type { SessionInfo } from "../../../types";
import {
	clearReopeningHighLevelReview,
	markReopeningHighLevelReview,
} from "../../useReopeningHighLevelReview";
import { SessionPreviewSplit } from "./SessionPreviewSplit";

vi.mock("../../ConfigView/useConfigEntries/fetchEntries", () => ({
	fetchEntries: vi.fn(),
}));

const fetchMock = vi.mocked(fetchEntries);

type Entries = Awaited<ReturnType<typeof fetchEntries>>;

class TestResizeObserver {
	observe() {}
	disconnect() {}
}

const placeholderText = "Reopening high-level review for #42…";

function renderSplit(session: SessionInfo) {
	return render(
		<SessionPreviewSplit
			session={session}
			sendPrDecision={() => true}
			sendInput={() => {}}
		>
			<div />
		</SessionPreviewSplit>,
	);
}

const review: PrPreview = {
	requestId: "review-1",
	title: "org/repo#42 — Review",
	body: "not json",
	prNumber: 42,
	kind: "high-level-review",
};

const question: PrPreview = {
	requestId: "question-1",
	title: "Claude is asking a question",
	body: JSON.stringify({
		questions: [
			{
				question: "Which session should get the findings?",
				context: "Only session 24 works on the chat redesign.",
				header: "Target",
				multiSelect: false,
				options: [
					{ label: "Session 24", description: "platform PR checkout" },
					{ label: "Don't send", description: "Leave it" },
				],
			},
		],
	}),
	prNumber: null,
	kind: "question",
};

function session(pendingPrPreview: PrPreview): SessionInfo {
	return {
		id: "18",
		cwd: "/repo",
		pendingPrPreview,
	} as SessionInfo;
}

function autoSubmitLoad() {
	let resolve: (entries: Entries) => void = () => {};
	fetchMock.mockReturnValue(
		new Promise((r) => {
			resolve = r;
		}),
	);
	return () =>
		act(async () =>
			resolve([
				{ key: "sessions.askQuestionAutoSubmit", value: true },
			] as Entries),
		);
}

function renderQuestion(sendPrDecision: () => boolean) {
	const props = { sendPrDecision, sendInput: vi.fn(), children: <div /> };
	const view = render(
		<SessionPreviewSplit session={session(review)} {...props} />,
	);
	view.rerender(<SessionPreviewSplit session={session(question)} {...props} />);
}

beforeEach(() => {
	globalThis.ResizeObserver =
		TestResizeObserver as unknown as typeof ResizeObserver;
	vi.stubGlobal(
		"fetch",
		vi.fn(async () => new Response("{}", { status: 404 })),
	);
});

afterEach(() => {
	clearReopeningHighLevelReview("7");
	cleanup();
	vi.resetAllMocks();
	vi.unstubAllGlobals();
});

describe("SessionPreviewSplit", () => {
	it("shows a reopening placeholder while a reopen is in flight", () => {
		renderSplit(makeSessionInfo({ id: "7" }));
		expect(screen.queryByText(placeholderText)).toBeNull();

		act(() => {
			markReopeningHighLevelReview("7", 42);
		});
		expect(screen.getByText(placeholderText)).toBeTruthy();

		act(() => clearReopeningHighLevelReview("7"));
		expect(screen.queryByText(placeholderText)).toBeNull();
	});

	it("drops the placeholder once the review preview arrives", () => {
		markReopeningHighLevelReview("7", 42);
		const preview: PrPreview = {
			requestId: "r1",
			title: "High-level review",
			body: "",
			prNumber: 42,
			kind: "high-level-review",
		};
		renderSplit(makeSessionInfo({ id: "7", pendingPrPreview: preview }));

		expect(screen.queryByText(placeholderText)).toBeNull();
	});
});

describe("SessionPreviewSplit question auto submit", () => {
	it("delivers a pick made over a superseded review before the flag loads", async () => {
		const loadAutoSubmit = autoSubmitLoad();
		const sendPrDecision = vi.fn(() => true);
		renderQuestion(sendPrDecision);

		fireEvent.click(screen.getByRole("radio", { name: /Session 24/ }));
		expect(sendPrDecision).not.toHaveBeenCalled();
		await loadAutoSubmit();

		expect(sendPrDecision).toHaveBeenCalledExactlyOnceWith(
			"18",
			"question-1",
			"approve",
			expect.objectContaining({
				answers: { "Which session should get the findings?": "Session 24" },
			}),
		);
	});

	it("shows the answer was not sent when the socket is down", async () => {
		const loadAutoSubmit = autoSubmitLoad();
		renderQuestion(() => false);
		await loadAutoSubmit();

		fireEvent.click(screen.getByRole("radio", { name: /Session 24/ }));

		expect(screen.getByRole("alert").textContent).toMatch(/Not sent/);
	});
});
