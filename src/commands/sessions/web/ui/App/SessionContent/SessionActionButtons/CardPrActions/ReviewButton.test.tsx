// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { PrSummary } from "../../../../../prList";
import { ReviewButton } from "./ReviewButton";
import { reviewButtonModes } from "../../../../../../../../shared/reviewButtonModes";
import { SessionLaunchContext } from "../../../../useSessionLaunchContext";
import { makeSessionInfo } from "../../../../../../../../test/mothers/makeSessionInfo";
import type { PrPreview } from "../../../../../../shared/SessionInfoBase";
import type { SessionInfo } from "../../../../types";
import {
	bracketedPaste,
	SUBMIT,
} from "../../../../../../shared/pasteAndSubmit/bracketedPaste";

const highLevelPreview: PrPreview = {
	requestId: "r1",
	title: "High-level review",
	body: "",
	prNumber: 42,
	kind: "high-level-review",
};

function highLevelSession(overrides: Partial<SessionInfo> = {}): SessionInfo {
	return makeSessionInfo({
		id: "7",
		commandType: "assist",
		assistArgs: ["review", "--high-level", "42"],
		pendingPrPreview: highLevelPreview,
		...overrides,
	});
}

const pr: PrSummary = {
	number: 42,
	title: "Add a thing",
	author: "someone",
	createdAt: new Date(0).toISOString(),
	url: "https://github.com/org/repo/pull/42",
	isDraft: false,
};

function renderButton(
	launchAssist: () => void,
	session?: SessionInfo,
	activateSession: (id: string) => void = () => {},
	sendInput: (sessionId: string, data: string) => void = () => {},
) {
	render(
		<SessionLaunchContext.Provider
			value={{
				launchAssist,
				launchAgentInStream: () => {},
				resumeSession: () => {},
				armUpdateReload: () => {},
				activateSession,
				sendInput,
			}}
		>
			<ReviewButton cwd="/git/repo" pr={pr} session={session} />
		</SessionLaunchContext.Provider>,
	);
	fireEvent.click(screen.getByRole("button", { name: "Review PR" }));
}

function checkbox(label: string): HTMLInputElement {
	return screen.getByLabelText(label) as HTMLInputElement;
}

afterEach(cleanup);

describe("ReviewButton", () => {
	it.each(reviewButtonModes)(
		"launches $label against the PR shown on the card, in that card's tree",
		({ label, args }) => {
			const launchAssist = vi.fn();
			renderButton(launchAssist);

			fireEvent.click(screen.getByText(label));

			expect(launchAssist).toHaveBeenCalledWith(
				[...args, "42"],
				"/git/repo",
				expect.objectContaining({ inPlace: true }),
			);
		},
	);

	it("defaults every option toggle off", () => {
		renderButton(vi.fn());

		expect(checkbox("Force re-run").checked).toBe(false);
		expect(checkbox("Address comments after").checked).toBe(false);
		expect(checkbox("Announce to Slack after").checked).toBe(false);
	});

	it.each(reviewButtonModes)(
		"appends the enabled option flags to $label",
		({ label, args }) => {
			const launchAssist = vi.fn();
			renderButton(launchAssist);

			fireEvent.click(checkbox("Force re-run"));
			fireEvent.click(checkbox("Address comments after"));
			fireEvent.click(checkbox("Announce to Slack after"));
			fireEvent.click(screen.getByText(label));

			expect(launchAssist).toHaveBeenCalledWith(
				[...args, "42", "--force", "--address-comments", "--announce"],
				"/git/repo",
				expect.objectContaining({ inPlace: true }),
			);
		},
	);

	it.each(reviewButtonModes)(
		"forces a re-run of $label on its own",
		({ label, args }) => {
			const launchAssist = vi.fn();
			renderButton(launchAssist);

			fireEvent.click(checkbox("Force re-run"));
			fireEvent.click(screen.getByText(label));

			expect(launchAssist).toHaveBeenCalledWith(
				[...args, "42", "--force"],
				"/git/repo",
				expect.objectContaining({ inPlace: true }),
			);
		},
	);

	it("resets the option toggles to off when the menu is reopened", () => {
		const launchAssist = vi.fn();
		renderButton(launchAssist);

		fireEvent.click(checkbox("Force re-run"));
		fireEvent.click(checkbox("Announce to Slack after"));
		fireEvent.click(screen.getByText("Review"));
		fireEvent.click(screen.getByRole("button", { name: "Review PR" }));

		expect(checkbox("Force re-run").checked).toBe(false);
		expect(checkbox("Announce to Slack after").checked).toBe(false);
	});

	it("omits the force re-run mode entry", () => {
		renderButton(vi.fn());

		expect(screen.queryByText("Review (force re-run)")).toBeNull();
	});

	it("launches Address Comments against the PR shown on the card", () => {
		const launchAssist = vi.fn();
		renderButton(launchAssist);

		fireEvent.click(checkbox("Force re-run"));
		fireEvent.click(checkbox("Address comments after"));
		fireEvent.click(checkbox("Announce to Slack after"));
		fireEvent.click(screen.getByText("Address Comments"));

		expect(launchAssist).toHaveBeenCalledWith(
			["review-pr-comments", "42"],
			"/git/repo",
			expect.objectContaining({ inPlace: true }),
		);
	});

	it("launches Address Comments (auto) against the PR shown on the card", () => {
		const launchAssist = vi.fn();
		renderButton(launchAssist);

		fireEvent.click(screen.getByText("Address Comments (auto)"));

		expect(launchAssist).toHaveBeenCalledWith(
			["review-pr-comments", "42", "--auto"],
			"/git/repo",
			expect.objectContaining({ inPlace: true }),
		);
	});

	it("tags a review with the card it was launched from", () => {
		const launchAssist = vi.fn();
		renderButton(launchAssist, makeSessionInfo({ id: "7" }));

		fireEvent.click(screen.getByText(reviewButtonModes[0].label));

		expect(launchAssist).toHaveBeenCalledWith(
			expect.anything(),
			"/git/repo",
			expect.objectContaining({ launchedFrom: "7" }),
		);
	});

	it("tags Address Comments with the card it was launched from", () => {
		const launchAssist = vi.fn();
		renderButton(launchAssist, makeSessionInfo({ id: "7" }));

		fireEvent.click(screen.getByText("Address Comments"));

		expect(launchAssist).toHaveBeenCalledWith(
			["review-pr-comments", "42"],
			"/git/repo",
			expect.objectContaining({ launchedFrom: "7" }),
		);
	});

	it("leaves the launcher unset when the button has no card behind it", () => {
		const launchAssist = vi.fn();
		renderButton(launchAssist);

		fireEvent.click(screen.getByText("Address Comments"));

		expect(launchAssist).toHaveBeenCalledWith(
			["review-pr-comments", "42"],
			"/git/repo",
			expect.objectContaining({ launchedFrom: undefined }),
		);
	});
});

describe("ReviewButton on the high-level review session", () => {
	const panes: HTMLElement[] = [];

	function previewPane(id: string): HTMLElement {
		const pane = document.createElement("div");
		pane.tabIndex = -1;
		pane.setAttribute("data-preview-session-id", id);
		document.body.appendChild(pane);
		panes.push(pane);
		return pane;
	}

	afterEach(() => {
		for (const pane of panes.splice(0)) pane.remove();
	});

	function clickHighLevelReview() {
		expect(screen.queryByText("Open high-level review")).toBeNull();
		expect(screen.queryByText("Reopen high-level review")).toBeNull();
		fireEvent.click(screen.getByText("High-level review"));
	}

	it("opens the pending high-level review pane instead of launching", () => {
		const launchAssist = vi.fn();
		const activateSession = vi.fn();
		const pane = previewPane("7");
		renderButton(launchAssist, highLevelSession(), activateSession);

		clickHighLevelReview();

		expect(launchAssist).not.toHaveBeenCalled();
		expect(activateSession).toHaveBeenCalledWith("7");
		expect(document.activeElement).toBe(pane);
	});

	describe("without a pending high-level preview", () => {
		beforeEach(() => vi.useFakeTimers());
		afterEach(() => vi.useRealTimers());

		it.each([
			["has no pending preview", { pendingPrPreview: undefined }],
			[
				"has a pending preview of another kind",
				{ pendingPrPreview: { ...highLevelPreview, kind: "pr" as const } },
			],
			[
				"has a pending preview for another PR",
				{ pendingPrPreview: { ...highLevelPreview, prNumber: 7 } },
			],
		])("reruns the review in the session when it %s", (_, overrides) => {
			const launchAssist = vi.fn();
			const activateSession = vi.fn();
			const sendInput = vi.fn();
			renderButton(
				launchAssist,
				highLevelSession(overrides),
				activateSession,
				sendInput,
			);

			clickHighLevelReview();
			vi.runAllTimers();

			expect(launchAssist).not.toHaveBeenCalled();
			expect(activateSession).not.toHaveBeenCalled();
			expect(sendInput.mock.calls).toEqual([
				["7", bracketedPaste("/review-high-level 42")],
				["7", SUBMIT],
			]);
		});

		it("passes --force when Force re-run is toggled", () => {
			const sendInput = vi.fn();
			renderButton(
				vi.fn(),
				highLevelSession({ pendingPrPreview: undefined }),
				() => {},
				sendInput,
			);

			fireEvent.click(checkbox("Force re-run"));
			fireEvent.click(checkbox("Announce to Slack after"));
			clickHighLevelReview();

			expect(sendInput).toHaveBeenCalledWith(
				"7",
				bracketedPaste("/review-high-level 42 --force"),
			);
		});
	});

	it.each([
		[
			"is a different review of the PR",
			{ assistArgs: ["review", "--refine", "42"] },
		],
		[
			"is the high-level review of another PR",
			{ assistArgs: ["review", "--high-level", "41"] },
		],
	])("launches a new high-level review when the session %s", (_, overrides) => {
		const launchAssist = vi.fn();
		const activateSession = vi.fn();
		const sendInput = vi.fn();
		renderButton(
			launchAssist,
			highLevelSession(overrides),
			activateSession,
			sendInput,
		);

		clickHighLevelReview();

		expect(activateSession).not.toHaveBeenCalled();
		expect(sendInput).not.toHaveBeenCalled();
		expect(launchAssist).toHaveBeenCalledWith(
			["review", "--high-level", "42"],
			"/git/repo",
			expect.objectContaining({ inPlace: true, launchedFrom: "7" }),
		);
	});
});
