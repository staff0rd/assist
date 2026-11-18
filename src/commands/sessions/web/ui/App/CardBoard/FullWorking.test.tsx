// @vitest-environment jsdom
import { ThemeProvider } from "@mui/material/styles";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it } from "vitest";
import { makeSessionInfo } from "../../../../../../test/mothers/makeSessionInfo";
import { createDesignTheme } from "../../designSystem/createDesignTheme";
import type { SessionInfo } from "../../types";
import { FullWorking } from "./FullWorking";

afterEach(cleanup);

function renderCard(session: SessionInfo) {
	render(
		<MemoryRouter>
			<ThemeProvider theme={createDesignTheme("dark")}>
				<FullWorking session={session} />
			</ThemeProvider>
		</MemoryRouter>,
	);
}

describe("FullWorking", () => {
	it("shows a phase footer with one segment per phase for backlog runs", () => {
		renderCard(
			makeSessionInfo({
				status: "running",
				activity: {
					kind: "backlog",
					itemId: 1,
					startedAt: 0,
					phase: 2,
					totalPhases: 3,
					phaseName: "Wire the footer",
				},
			}),
		);

		const footer = screen.getByRole("group", {
			name: "Phase 2 of 3: Wire the footer",
		});
		expect(footer.textContent).toBe("2/3Wire the footer");
		const states = [...footer.querySelectorAll("[data-state]")].map((e) =>
			e.getAttribute("data-state"),
		);
		expect(states).toEqual(["done", "current", "todo"]);
	});

	it("shows no footer for sessions that are not backlog runs", () => {
		renderCard(makeSessionInfo({ status: "running" }));

		expect(screen.queryByTestId("card-phase-progress")).toBeNull();
	});
});
