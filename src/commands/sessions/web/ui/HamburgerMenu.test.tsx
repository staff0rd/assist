// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { HamburgerMenu } from "./HamburgerMenu";
import { SessionLaunchContext } from "./useSessionLaunchContext";

function renderMenu(launchAssist: () => void) {
	return render(
		<SessionLaunchContext.Provider value={{ launchAssist }}>
			<HamburgerMenu mode="light" toggle={() => {}} />
		</SessionLaunchContext.Provider>,
	);
}

afterEach(cleanup);

describe("HamburgerMenu", () => {
	it("launches an assist update session with no cwd on confirm", () => {
		const launchAssist = vi.fn();
		renderMenu(launchAssist);

		fireEvent.click(screen.getByRole("button", { name: "Open menu" }));
		fireEvent.click(screen.getByText("Update assist"));
		fireEvent.click(screen.getByRole("button", { name: "Update" }));

		expect(launchAssist).toHaveBeenCalledWith(["update"]);
	});

	it("does not launch when the update is cancelled", () => {
		const launchAssist = vi.fn();
		renderMenu(launchAssist);

		fireEvent.click(screen.getByRole("button", { name: "Open menu" }));
		fireEvent.click(screen.getByText("Update assist"));
		fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

		expect(launchAssist).not.toHaveBeenCalled();
	});
});
