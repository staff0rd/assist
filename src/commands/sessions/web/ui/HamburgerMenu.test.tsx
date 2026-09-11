// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { HamburgerMenu } from "./HamburgerMenu";
import { SessionLaunchContext } from "./useSessionLaunchContext";

let fetchMock: ReturnType<typeof vi.fn>;

function renderMenu(launchAssist: () => void, armUpdateReload = () => {}) {
	return render(
		<MemoryRouter initialEntries={["/sessions"]}>
			<SessionLaunchContext.Provider
				value={{
					launchAssist,
					launchAgentInStream: () => {},
					resumeSession: () => {},
					armUpdateReload,
				}}
			>
				<HamburgerMenu mode="light" toggle={() => {}} reconnecting={false} />
				<Routes>
					<Route path="/config" element={<div>config page</div>} />
					<Route path="/sessions" element={<div>sessions page</div>} />
				</Routes>
			</SessionLaunchContext.Provider>
		</MemoryRouter>,
	);
}

beforeEach(() => {
	fetchMock = vi.fn().mockResolvedValue({ ok: true });
	vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
	cleanup();
	vi.unstubAllGlobals();
});

describe("HamburgerMenu", () => {
	it("launches an assist update session with no cwd on confirm", () => {
		const launchAssist = vi.fn();
		renderMenu(launchAssist);

		fireEvent.click(screen.getByRole("button", { name: "Open menu" }));
		fireEvent.click(screen.getByText("Update assist"));
		fireEvent.click(screen.getByRole("button", { name: "Update" }));

		expect(launchAssist).toHaveBeenCalledWith(["update"]);
	});

	it("arms the update reload watcher on confirm", () => {
		const launchAssist = vi.fn();
		const armUpdateReload = vi.fn();
		renderMenu(launchAssist, armUpdateReload);

		fireEvent.click(screen.getByRole("button", { name: "Open menu" }));
		fireEvent.click(screen.getByText("Update assist"));
		fireEvent.click(screen.getByRole("button", { name: "Update" }));

		expect(armUpdateReload).toHaveBeenCalledTimes(1);
	});

	it("navigates to the config page from the cog beside the menu", () => {
		renderMenu(vi.fn());

		fireEvent.click(screen.getByRole("button", { name: "Config" }));

		expect(screen.getByText("config page")).toBeTruthy();
	});

	it("does not launch when the update is cancelled", () => {
		const launchAssist = vi.fn();
		renderMenu(launchAssist);

		fireEvent.click(screen.getByRole("button", { name: "Open menu" }));
		fireEvent.click(screen.getByText("Update assist"));
		fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

		expect(launchAssist).not.toHaveBeenCalled();
	});

	it("offers a single restart item", () => {
		renderMenu(vi.fn());

		fireEvent.click(screen.getByRole("button", { name: "Open menu" }));

		expect(screen.getAllByText("Restart daemon")).toHaveLength(1);
		expect(screen.queryByText("Restart webserver")).toBeNull();
		expect(screen.queryByText("Restart both")).toBeNull();
	});

	it("restarts the daemon and web server together on confirm", () => {
		renderMenu(vi.fn());

		fireEvent.click(screen.getByRole("button", { name: "Open menu" }));
		fireEvent.click(screen.getByText("Restart daemon"));
		fireEvent.click(screen.getByRole("button", { name: "Restart" }));

		expect(fetchMock).toHaveBeenCalledWith("/api/restart?target=both", {
			method: "POST",
		});
	});

	it("does not restart when the restart is cancelled", () => {
		renderMenu(vi.fn());

		fireEvent.click(screen.getByRole("button", { name: "Open menu" }));
		fireEvent.click(screen.getByText("Restart daemon"));
		fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

		expect(fetchMock).not.toHaveBeenCalled();
	});
});
