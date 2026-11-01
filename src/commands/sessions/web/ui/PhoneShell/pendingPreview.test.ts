import { describe, expect, it } from "vitest";
import { makeSessionInfo } from "../../../../../test/mothers/makeSessionInfo";
import type { PrPreview, PreviewKind } from "../../../shared/SessionInfoBase";
import { pendingPreview } from "./pendingPreview";

const preview = (kind: PreviewKind): PrPreview => ({
	requestId: kind,
	title: kind,
	body: "",
	prNumber: null,
	kind,
});

describe("pendingPreview", () => {
	it("returns non-question previews", () => {
		const pr = preview("backlog-item");
		expect(pendingPreview(makeSessionInfo({ pendingPrPreview: pr }))).toBe(pr);
	});

	it("leaves question and check previews to their native cards", () => {
		for (const kind of ["question", "check"] as const)
			expect(
				pendingPreview(makeSessionInfo({ pendingPrPreview: preview(kind) })),
			).toBeUndefined();
	});

	it("prefers a stacked show preview", () => {
		const show = preview("show");
		expect(
			pendingPreview(
				makeSessionInfo({
					pendingPrPreview: preview("question"),
					pendingShow: show,
				}),
			),
		).toBe(show);
	});
});
