// @vitest-environment jsdom
import MenuList from "@mui/material/MenuList";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ExtensionUpdateStatus } from "../../../../../../shared/ExtensionUpdateStatus";
import type { NodeUpdateStatus } from "../../../../../../shared/NodeUpdateStatus";
import { NodeUpdatesContext } from "../../useNodeUpdatesContext";
import { FirefoxExtensionMenuItem } from "./FirefoxExtensionMenuItem";

function renderWith(extension: ExtensionUpdateStatus, onClose = () => {}) {
	const status = { extension } as NodeUpdateStatus;
	return render(
		<NodeUpdatesContext.Provider
			value={{
				entries: [{ name: "here", local: true, status }],
				loading: false,
				refresh: () => {},
			}}
		>
			<MenuList>
				<FirefoxExtensionMenuItem onClose={onClose} />
			</MenuList>
		</NodeUpdatesContext.Provider>,
	);
}

const link = "https://x/0.985.0.xpi";

describe("FirefoxExtensionMenuItem", () => {
	afterEach(cleanup);

	it("links to the latest signed build even when up to date, and closes on click", () => {
		const onClose = vi.fn();
		renderWith(
			{
				connected: "0.985.0",
				latest: "0.985.0",
				installLink: link,
				behind: false,
			},
			onClose,
		);
		const item = screen.getByRole("menuitem");
		expect(item.getAttribute("href")).toBe(link);
		expect(
			screen.getByText("v0.985.0 installed · v0.985.0 latest"),
		).toBeTruthy();
		fireEvent.click(item);
		expect(onClose).toHaveBeenCalledTimes(1);
	});

	it("says not connected when no extension is connected", () => {
		renderWith({ latest: "0.985.0", installLink: link, behind: false });
		expect(screen.getByText("not connected · v0.985.0 latest")).toBeTruthy();
		expect(screen.getByRole("menuitem").getAttribute("href")).toBe(link);
	});

	it("is disabled and unavailable when no signed build is known", () => {
		renderWith({ connected: "0.984.0", behind: false });
		const item = screen.getByRole("menuitem");
		expect(item.getAttribute("aria-disabled")).toBe("true");
		expect(item.getAttribute("href")).toBeNull();
		expect(screen.getByText("unavailable")).toBeTruthy();
	});
});
