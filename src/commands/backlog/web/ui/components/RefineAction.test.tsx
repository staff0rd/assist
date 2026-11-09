// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiNodeContext } from "../../../../sessions/web/ui/useApiNode";
import { SessionLaunchContext } from "../../../../sessions/web/ui/useSessionLaunchContext";
import { RefineAction } from "./RefineAction";

function LocationProbe() {
	const location = useLocation();
	return <div data-testid="location">{location.pathname}</div>;
}

function renderRefine(launchAssist: () => void, node?: string) {
	return render(
		<MemoryRouter initialEntries={["/backlog/items/279"]}>
			<ApiNodeContext.Provider value={node}>
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
					<RefineAction itemId={279} />
					<LocationProbe />
				</SessionLaunchContext.Provider>
			</ApiNodeContext.Provider>
		</MemoryRouter>,
	);
}

const available = { available: true };
const unavailable = {
	available: false,
	reasons: [{ capability: "skills.native", reason: "r", remediation: "m" }],
};

function mockRefine(
	refine: { claude?: boolean; codex?: boolean; pi?: boolean },
	engine = "claude",
) {
	const cell = (on?: boolean) => (on ? available : unavailable);
	const fetchMock = vi.fn().mockResolvedValue({
		json: () =>
			Promise.resolve({
				engine,
				features: {
					refine: {
						claude: cell(refine.claude ?? true),
						codex: cell(refine.codex),
						pi: cell(refine.pi),
					},
				},
			}),
	});
	vi.stubGlobal("fetch", fetchMock);
	return fetchMock;
}

const dropdown = () =>
	screen.findByRole("button", { name: "Refine with a different harness" });

afterEach(() => {
	cleanup();
	vi.unstubAllGlobals();
});

describe("RefineAction", () => {
	beforeEach(() => {
		mockRefine({});
	});

	it("launches a refine session and navigates to /sessions", () => {
		const launchAssist = vi.fn();
		renderRefine(launchAssist);

		fireEvent.click(screen.getByRole("button", { name: "Refine" }));

		expect(launchAssist).toHaveBeenCalledWith(
			["refine", "--once", "a279"],
			undefined,
		);
		expect(screen.getByTestId("location").textContent).toBe("/sessions");
	});

	it("does not spawn a second session on double-click (latched)", () => {
		const launchAssist = vi.fn();
		renderRefine(launchAssist);

		const button = screen.getByRole("button", { name: "Refine" });
		fireEvent.click(button);
		fireEvent.click(button);

		expect(launchAssist).toHaveBeenCalledTimes(1);
	});

	it("hides the harness dropdown when Refine resolves unavailable on every other harness", () => {
		renderRefine(vi.fn());

		expect(
			screen.queryByRole("button", {
				name: "Refine with a different harness",
			}),
		).toBeNull();
	});
});

describe("RefineAction harness menu from the resolver", () => {
	it("launches refine under codex when Refine resolves available on codex", async () => {
		mockRefine({ codex: true });
		const launchAssist = vi.fn();
		renderRefine(launchAssist);

		fireEvent.click(await dropdown());
		fireEvent.click(screen.getByRole("menuitem", { name: "with Codex" }));

		expect(launchAssist).toHaveBeenCalledWith(
			["refine", "--once", "--harness", "codex", "a279"],
			undefined,
		);
		expect(screen.getByTestId("location").textContent).toBe("/sessions");
	});

	it("launches refine under pi when Refine resolves available on pi", async () => {
		mockRefine({ pi: true });
		const launchAssist = vi.fn();
		renderRefine(launchAssist);

		fireEvent.click(await dropdown());
		fireEvent.click(screen.getByRole("menuitem", { name: "with pi" }));

		expect(launchAssist).toHaveBeenCalledWith(
			["refine", "--once", "--harness", "pi", "a279"],
			undefined,
		);
	});

	it("omits a harness whose Refine cell is unavailable", async () => {
		mockRefine({ codex: true, pi: false });
		renderRefine(vi.fn());

		fireEvent.click(await dropdown());

		expect(screen.getByRole("menuitem", { name: "with Codex" })).toBeTruthy();
		expect(screen.queryByRole("menuitem", { name: "with pi" })).toBeNull();
	});

	it("offers Claude and not the engine when the configured engine is codex", async () => {
		mockRefine({ claude: true, codex: true }, "codex");
		const launchAssist = vi.fn();
		renderRefine(launchAssist);

		fireEvent.click(await dropdown());
		expect(screen.queryByRole("menuitem", { name: "with Codex" })).toBeNull();
		fireEvent.click(screen.getByRole("menuitem", { name: "with Claude" }));

		expect(launchAssist).toHaveBeenCalledWith(
			["refine", "--once", "--harness", "claude", "a279"],
			undefined,
		);
	});

	it("resolves against the linked node and launches there", async () => {
		const fetchMock = mockRefine({ codex: true });
		const launchAssist = vi.fn();
		renderRefine(launchAssist, "peer");

		fireEvent.click(await dropdown());
		fireEvent.click(screen.getByRole("menuitem", { name: "with Codex" }));

		expect(fetchMock.mock.calls[0][0]).toBe("/api/harness?node=peer");
		expect(launchAssist).toHaveBeenCalledWith(
			["refine", "--once", "--harness", "codex", "a279"],
			undefined,
			{ node: "peer" },
		);
	});
});
