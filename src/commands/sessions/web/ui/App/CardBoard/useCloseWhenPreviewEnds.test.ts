// @vitest-environment jsdom
import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { makeSessionInfo } from "../../../../../../test/mothers/makeSessionInfo";
import type { SessionInfo } from "../../types";
import { useCloseWhenPreviewEnds } from "./useCloseWhenPreviewEnds";

const preview = {
	requestId: "req-1",
	title: "Pick",
	body: "",
	prNumber: null,
	kind: "question" as const,
};
const asking = makeSessionInfo({ id: "a", pendingPrPreview: preview });
const answered = makeSessionInfo({ id: "a" });

function track(sessionShown: boolean) {
	const close = vi.fn();
	const hook = renderHook(
		({ session }: { session: SessionInfo | undefined }) =>
			useCloseWhenPreviewEnds(session, sessionShown, close),
		{ initialProps: { session: asking as SessionInfo | undefined } },
	);
	return { close, rerender: hook.rerender };
}

describe("useCloseWhenPreviewEnds", () => {
	it("closes the pane when the open card's preview ends", () => {
		const { close, rerender } = track(false);

		rerender({ session: answered });

		expect(close).toHaveBeenCalledOnce();
	});

	it("keeps the pane open while the session drawer is shown", () => {
		const { close, rerender } = track(true);

		rerender({ session: answered });

		expect(close).not.toHaveBeenCalled();
	});

	it("does not close when another card without a preview opens", () => {
		const { close, rerender } = track(false);

		rerender({ session: makeSessionInfo({ id: "b" }) });

		expect(close).not.toHaveBeenCalled();
	});
});
