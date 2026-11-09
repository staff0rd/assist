// @vitest-environment jsdom
import {
	act,
	cleanup,
	fireEvent,
	render,
	screen,
} from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SessionLaunchContext } from "../../../../sessions/web/ui/useSessionLaunchContext";
import { PlayAction } from "./PlayAction";

function mockHarness({
	exposeCodexActions = false,
	exposePiActions = false,
}: {
	exposeCodexActions?: boolean;
	exposePiActions?: boolean;
}) {
	const resolution = (available: boolean) =>
		available
			? { available: true }
			: {
					available: false,
					reasons: [
						{
							capability: "harness.enabled",
							reason: "off",
							remediation: "turn it on",
						},
					],
				};
	const capabilities = {
		exposeCodexActions,
		exposePiActions,
		engine: "claude",
		features: {
			build: {
				claude: resolution(true),
				codex: resolution(exposeCodexActions),
				pi: resolution(exposePiActions),
			},
		},
	};
	vi.stubGlobal(
		"fetch",
		vi.fn().mockResolvedValue({ json: () => Promise.resolve(capabilities) }),
	);
}

function renderPlay(launchAssist: () => void, compact = false) {
	return render(
		<MemoryRouter initialEntries={["/backlog"]}>
			<SessionLaunchContext.Provider
				value={{
					launchAssist,
					launchAgentInStream: () => {},
					resumeSession: () => {},
					armUpdateReload: () => {},
					activateSession: () => {},
					sendInput: () => {},
				}}
			>
				<PlayAction
					itemId={775}
					compact={compact ? { onClosed: () => Promise.resolve() } : undefined}
				/>
			</SessionLaunchContext.Provider>
		</MemoryRouter>,
	);
}

afterEach(() => {
	cleanup();
	vi.unstubAllGlobals();
});

describe("PlayAction harness dropdown", () => {
	it("builds the item under Codex from the dropdown", async () => {
		mockHarness({ exposeCodexActions: true });
		const launchAssist = vi.fn();
		renderPlay(launchAssist);

		fireEvent.click(
			await screen.findByRole("button", {
				name: "Build with a different harness",
			}),
		);
		fireEvent.click(screen.getByRole("menuitem", { name: "with Codex" }));

		expect(launchAssist).toHaveBeenCalledWith(
			["backlog", "run", "a775", "--harness", "codex"],
			undefined,
		);
	});

	it("joins the dropdown to Build", async () => {
		mockHarness({ exposeCodexActions: true });
		renderPlay(vi.fn());

		const dropdown = await screen.findByRole("button", {
			name: "Build with a different harness",
		});
		const build = screen.getByRole("button", { name: "Build" });
		expect(dropdown.closest(".MuiButtonGroup-root")).toBe(
			build.closest(".MuiButtonGroup-root"),
		);
	});

	it("offers no dropdown when no other harness is available", async () => {
		mockHarness({});
		renderPlay(vi.fn());

		await screen.findByRole("button", { name: "Build" });
		expect(
			screen.queryByRole("button", { name: "Build with a different harness" }),
		).toBeNull();
	});

	it("offers Claude from the dropdown when the engine is another harness", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn().mockResolvedValue({
				json: () =>
					Promise.resolve({
						engine: "codex",
						features: {
							build: {
								claude: { available: true },
								codex: { available: true },
							},
						},
					}),
			}),
		);
		const launchAssist = vi.fn();
		renderPlay(launchAssist);

		fireEvent.click(
			await screen.findByRole("button", {
				name: "Build with a different harness",
			}),
		);
		expect(screen.queryByRole("menuitem", { name: "with Codex" })).toBeNull();
		fireEvent.click(screen.getByRole("menuitem", { name: "with Claude" }));

		expect(launchAssist).toHaveBeenCalledWith(
			["backlog", "run", "a775", "--harness", "claude"],
			undefined,
		);
	});

	it("offers no dropdown on the compact variant even when Codex is exposed", async () => {
		mockHarness({ exposeCodexActions: true });
		renderPlay(vi.fn(), true);

		await screen.findByRole("button", { name: "Build" });
		await act(() => new Promise((resolve) => setTimeout(resolve, 0)));
		expect(
			screen.queryByRole("button", { name: "Build with a different harness" }),
		).toBeNull();
	});
});
