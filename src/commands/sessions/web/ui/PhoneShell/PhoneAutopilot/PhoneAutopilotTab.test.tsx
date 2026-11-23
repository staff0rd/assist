// @vitest-environment jsdom
import { ThemeProvider } from "@mui/material/styles";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it } from "vitest";
import { createDesignTheme } from "../../designSystem/createDesignTheme";
import { PhoneTabBar } from "../PhoneTabBar";
import type { PhoneAutopilot } from "./usePhoneAutopilot";
import { PhoneAutopilotContext } from "./usePhoneAutopilotContext";

afterEach(cleanup);

function renderTabs(autopilot: Partial<PhoneAutopilot> | null) {
	render(
		<ThemeProvider theme={createDesignTheme("dark", "touch")}>
			<MemoryRouter initialEntries={["/"]}>
				<PhoneAutopilotContext.Provider
					value={autopilot as PhoneAutopilot | null}
				>
					<PhoneTabBar sessions={[]} restore={(path) => [path]} />
				</PhoneAutopilotContext.Provider>
			</MemoryRouter>
		</ThemeProvider>,
	);
}

const labels = () =>
	screen.getAllByRole("button").map((button) => button.textContent);

describe("PhoneTabBar autopilot tab", () => {
	it("hides the tab when no repo has autopilot", () => {
		renderTabs({ repos: [], failed: false });
		expect(labels()).toEqual(["Sessions", "Backlog", "History"]);
	});

	it("shows the tab before History when a repo has autopilot", () => {
		renderTabs({ repos: ["/r"], failed: false });
		expect(labels()).toEqual(["Sessions", "Backlog", "Autopilot", "History"]);
		expect(screen.queryByTestId("phone-tab-dot")).toBeNull();
	});

	it("dots the tab while the schedule is paused after a failure", () => {
		renderTabs({ repos: ["/r"], failed: true });
		expect(screen.getByTestId("phone-tab-dot")).toBeTruthy();
	});
});
