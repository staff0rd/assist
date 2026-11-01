// @vitest-environment jsdom
import { cleanup, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { makeSessionInfo } from "../../../../../../../../../../test/mothers/makeSessionInfo";
import { renderWithTheme } from "../../../../../../../../../../test/renderWithTheme";
import { CardBadges } from "./CardBadges";

afterEach(cleanup);

describe("CardBadges", () => {
	it("fills the final-phase badge", () => {
		renderWithTheme(
			<CardBadges
				session={makeSessionInfo({
					status: "waiting",
					activity: {
						kind: "backlog",
						startedAt: 0,
						phase: 3,
						totalPhases: 3,
					},
				})}
			/>,
			{ mode: "dark" },
		);

		expect(getComputedStyle(screen.getByText("3/3")).backgroundColor).toBe(
			"rgb(139, 156, 255)",
		);
	});

	it("shows a teal Check badge while a manual check is pending", () => {
		renderWithTheme(
			<CardBadges
				session={makeSessionInfo({
					status: "running",
					pendingPrPreview: {
						requestId: "r1",
						title: "PIN shows on the Mac",
						body: "{}",
						prNumber: null,
						kind: "check",
					},
				})}
			/>,
			{ mode: "dark" },
		);

		expect(getComputedStyle(screen.getByText("Check")).color).toBe(
			"rgb(108, 200, 216)",
		);
	});

	it("shows no Check badge for a pending question", () => {
		renderWithTheme(
			<CardBadges
				session={makeSessionInfo({
					status: "running",
					pendingPrPreview: {
						requestId: "r1",
						title: "q",
						body: "{}",
						prNumber: null,
						kind: "question",
					},
				})}
			/>,
		);

		expect(screen.queryByText("Check")).toBeNull();
	});
});
