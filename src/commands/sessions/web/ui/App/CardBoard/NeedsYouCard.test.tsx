// @vitest-environment jsdom
import { ThemeProvider } from "@mui/material/styles";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it } from "vitest";
import { makeSessionInfo } from "../../../../../../test/mothers/makeSessionInfo";
import { createDesignTheme } from "../../designSystem/createDesignTheme";
import type { SessionInfo } from "../../types";
import { NeedsYouCard } from "./NeedsYouCard";

afterEach(cleanup);

const theme = createDesignTheme("dark");

function renderCard(overrides: Partial<SessionInfo>) {
	render(
		<MemoryRouter>
			<ThemeProvider theme={theme}>
				<NeedsYouCard
					session={makeSessionInfo({
						activity: {
							kind: "backlog",
							itemId: 1,
							startedAt: 0,
							phase: 2,
							totalPhases: 3,
							phaseName: "Wire the footer",
						},
						...overrides,
					})}
					selected={false}
					onOpen={() => {}}
				/>
			</ThemeProvider>
		</MemoryRouter>,
	);
}

function currentSegmentColor() {
	const segment = screen
		.getByTestId("card-phase-progress")
		.querySelector('[data-state="current"]');
	return segment && getComputedStyle(segment).backgroundColor;
}

function cssColor(color: string) {
	const probe = document.createElement("div");
	probe.style.backgroundColor = color;
	return probe.style.backgroundColor;
}

describe("NeedsYouCard", () => {
	it("colours the current phase amber while awaiting approval", () => {
		renderCard({ status: "waiting" });

		expect(
			screen.getByRole("group", { name: "Phase 2 of 3: Wire the footer" }),
		).toBeTruthy();
		expect(currentSegmentColor()).toBe(cssColor(theme.palette.warning.main));
	});

	it("colours the current phase teal when a check is pending", () => {
		renderCard({
			status: "running",
			pendingPrPreview: {
				requestId: "r",
				title: "Check",
				body: "",
				prNumber: null,
				kind: "check",
			},
		});

		expect(currentSegmentColor()).toBe(cssColor(theme.palette.check.main));
	});

	it("shows no footer for sessions that are not backlog runs", () => {
		renderCard({ status: "waiting", activity: undefined });

		expect(screen.queryByTestId("card-phase-progress")).toBeNull();
	});
});
