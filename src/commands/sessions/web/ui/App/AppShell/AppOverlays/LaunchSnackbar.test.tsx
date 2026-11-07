// @vitest-environment jsdom
import { cleanup, fireEvent, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { renderWithTheme } from "../../../../../../../test/renderWithTheme";
import { LaunchSnackbar } from "./LaunchSnackbar";

afterEach(cleanup);

describe("LaunchSnackbar", () => {
	it("shows the launched notice with a View action for the new session", () => {
		const onView = vi.fn();
		renderWithTheme(
			<LaunchSnackbar
				notice={{
					message: "Started Bug: GET /api/git-status",
					sessionId: "s1",
				}}
				onClose={() => {}}
				onView={onView}
			/>,
		);

		expect(screen.getByText("Started Bug: GET /api/git-status")).toBeTruthy();
		fireEvent.click(screen.getByRole("button", { name: "View" }));
		expect(onView).toHaveBeenCalledWith("s1");
	});
});
