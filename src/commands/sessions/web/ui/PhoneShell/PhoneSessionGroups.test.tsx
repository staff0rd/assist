// @vitest-environment jsdom
import { ThemeProvider } from "@mui/material/styles";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it } from "vitest";
import { createDesignTheme } from "../designSystem/createDesignTheme";
import type { SessionInfo } from "../types";
import { PhoneSessionGroups } from "./PhoneSessionGroups";

afterEach(cleanup);

const theme = createDesignTheme("dark");

const activity = {
	kind: "backlog" as const,
	itemId: 1,
	startedAt: 0,
	phase: 3,
	totalPhases: 3,
};

function preview(kind: "question" | "check") {
	return { requestId: kind, title: kind, body: "", prNumber: null, kind };
}

function review(
	id: string,
	status: SessionInfo["status"],
	extra: Partial<SessionInfo> = {},
): SessionInfo {
	return {
		id,
		name: id,
		title: `Session ${id}`,
		status,
		commandType: "claude",
		startedAt: 0,
		activity,
		...extra,
	};
}

function renderGroups(sessions: SessionInfo[]) {
	render(
		<ThemeProvider theme={theme}>
			<MemoryRouter>
				<PhoneSessionGroups sessions={sessions} localNode="mac" />
			</MemoryRouter>
		</ThemeProvider>,
	);
}

describe("PhoneSessionGroups Review tally", () => {
	it("counts question, check, waiting and error review sessions as needing you", () => {
		renderGroups([
			review("q", "running", { pendingPrPreview: preview("question") }),
			review("c", "running", { pendingPrPreview: preview("check") }),
			review("w", "waiting"),
			review("e", "error"),
			review("r", "running"),
		]);

		const badge = screen.getByTestId("tally-needs-you");
		expect(badge.textContent).toBe("4 need you");
		expect(getComputedStyle(badge).color).toBe(
			getComputedStyle(
				Object.assign(document.createElement("span"), {
					style: `color: ${theme.palette.warning.main}`,
				}),
			).color,
		);
		expect(screen.getByRole("button", { name: /Review/ }).textContent).toMatch(
			/^◇Review54 need you/,
		);
	});

	it("uses the singular for one session needing you", () => {
		renderGroups([review("w", "waiting"), review("r", "running")]);

		expect(screen.getByTestId("tally-needs-you").textContent).toBe(
			"1 needs you",
		);
	});

	it("omits the needs-you count when every review session is running", () => {
		renderGroups([review("r1", "running"), review("r2", "running")]);

		expect(screen.queryByTestId("tally-needs-you")).toBeNull();
	});
});

describe("PhoneSessionGroups tally expansion", () => {
	it("starts Review expanded and collapses it on tap", () => {
		renderGroups([review("r", "running")]);

		const tally = screen.getByRole("button", { name: /Review/ });
		expect(tally.getAttribute("aria-expanded")).toBe("true");
		expect(screen.getByText("Session r")).toBeTruthy();

		fireEvent.click(tally);
		expect(tally.getAttribute("aria-expanded")).toBe("false");
		expect(screen.queryByText("Session r")).toBeNull();

		fireEvent.click(tally);
		expect(screen.getByText("Session r")).toBeTruthy();
	});

	it("starts Done collapsed", () => {
		renderGroups([review("d", "done", { activity: undefined })]);

		const tally = screen.getByRole("button", { name: /Done/ });
		expect(tally.getAttribute("aria-expanded")).toBe("false");
		expect(screen.queryByText("Session d")).toBeNull();
	});
});
