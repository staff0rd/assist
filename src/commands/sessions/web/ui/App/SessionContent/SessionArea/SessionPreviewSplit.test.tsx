// @vitest-environment jsdom
import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { makeSessionInfo } from "../../../../../../../test/mothers/makeSessionInfo";
import type { PrPreview } from "../../../../../shared/SessionInfoBase";
import type { SessionInfo } from "../../../types";
import {
	clearReopeningHighLevelReview,
	markReopeningHighLevelReview,
} from "../../useReopeningHighLevelReview";
import { SessionPreviewSplit } from "./SessionPreviewSplit";

class TestResizeObserver {
	observe() {}
	disconnect() {}
}

const placeholderText = "Reopening high-level review for #42…";

function renderSplit(session: SessionInfo) {
	return render(
		<SessionPreviewSplit
			session={session}
			sendPrDecision={() => {}}
			sendInput={() => {}}
		>
			<div />
		</SessionPreviewSplit>,
	);
}

beforeEach(() => {
	globalThis.ResizeObserver =
		TestResizeObserver as unknown as typeof ResizeObserver;
});

afterEach(() => {
	clearReopeningHighLevelReview("7");
	cleanup();
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
