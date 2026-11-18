// @vitest-environment jsdom
import { ThemeProvider } from "@mui/material/styles";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it } from "vitest";
import { makeSessionInfo } from "../../../../../../test/mothers/makeSessionInfo";
import { createDesignTheme } from "../../designSystem/createDesignTheme";
import type { SessionInfo } from "../../types";
import { OtherCard } from "./OtherCard";

afterEach(cleanup);

function renderCard(status: SessionInfo["status"]) {
	render(
		<MemoryRouter>
			<ThemeProvider theme={createDesignTheme("dark")}>
				<OtherCard
					session={makeSessionInfo({
						status,
						activity: {
							kind: "backlog",
							itemId: 1,
							startedAt: 0,
							phase: 2,
							totalPhases: 3,
							phaseName: "Wire the footer",
						},
					})}
					selected={false}
					onOpen={() => {}}
				/>
			</ThemeProvider>
		</MemoryRouter>,
	);
}

function segmentStates() {
	return [
		...screen
			.getByTestId("card-phase-progress")
			.querySelectorAll("[data-state]"),
	].map((e) => e.getAttribute("data-state"));
}

describe("OtherCard", () => {
	it("fills every segment and says Complete when the session is done", () => {
		renderCard("done");

		const footer = screen.getByRole("group", {
			name: "All 3 phases complete",
		});
		expect(footer.textContent).toBe("3/3Complete");
		expect(segmentStates()).toEqual(["done", "done", "done"]);
	});

	it("marks the current phase failed when the session errored", () => {
		renderCard("error");

		expect(
			screen.getByRole("group", {
				name: "Stopped in phase 2 of 3: Wire the footer",
			}),
		).toBeTruthy();
		expect(segmentStates()).toEqual(["done", "failed", "todo"]);
	});
});
