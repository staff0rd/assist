// @vitest-environment jsdom
import {
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import type { ExtensionUpdateStatus } from "../../../../../shared/ExtensionUpdateStatus";
import type { NodeUpdateStatus } from "../../../../../shared/NodeUpdateStatus";
import { NodeUpdatesContext } from "../useNodeUpdatesContext";
import { ExtensionUpdateToast } from "./ExtensionUpdateToast";

function renderWith(extension: ExtensionUpdateStatus) {
	const status = { extension } as NodeUpdateStatus;
	return render(
		<NodeUpdatesContext.Provider
			value={{
				entries: [{ name: "here", local: true, status }],
				loading: false,
				refresh: () => {},
			}}
		>
			<ExtensionUpdateToast />
		</NodeUpdatesContext.Provider>,
	);
}

describe("ExtensionUpdateToast", () => {
	afterEach(cleanup);

	it("offers the signed .xpi when the extension is behind", () => {
		renderWith({
			connected: "0.984.0",
			latest: "0.985.0",
			updateLink: "https://x/a.xpi",
			behind: true,
		});
		expect(screen.getByText(/v0\.984\.0 → v0\.985\.0/)).toBeTruthy();
		expect(screen.getByRole("link", { name: "Install" })).toHaveProperty(
			"href",
			"https://x/a.xpi",
		);
	});

	it("shows nothing when up to date", () => {
		renderWith({ connected: "0.985.0", latest: "0.985.0", behind: false });
		expect(screen.queryByText(/→/)).toBeNull();
	});

	it("stays dismissed for that version", async () => {
		renderWith({
			connected: "0.984.0",
			latest: "0.985.0",
			updateLink: "https://x/a.xpi",
			behind: true,
		});
		fireEvent.click(screen.getByRole("button", { name: "Dismiss" }));
		await waitFor(() =>
			expect(screen.queryByRole("link", { name: "Install" })).toBeNull(),
		);
	});
});
