// @vitest-environment jsdom
import { ThemeProvider } from "@mui/material/styles";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createDesignTheme } from "../designSystem/createDesignTheme";
import { HomeNodeContext } from "../HomeNodeGate/useHomeNodeContext";
import type { HomeNodeApi } from "../HomeNodeGate/useHomeNode";
import type { NodeSelection } from "../useNodeSelection";
import { PhoneNodesSheet } from "./PhoneNodesSheet";
import { usePhoneNodeUpdates } from "./PhoneNodeUpdates/usePhoneNodeUpdates";

afterEach(cleanup);

const status = (running: string) => ({
	nodeName: "x",
	installDir: "/git/assist",
	running,
	built: running,
	restart: [],
	daemonReachable: true,
	loop: { phase: "waiting", since: new Date().toISOString() },
	history: [],
});

const nodes = {
	local: "mac",
	links: [{ name: "win", state: "connected" }],
} as unknown as NodeSelection["nodes"];
const selection: NodeSelection = {
	nodes,
	names: ["mac", "win"],
	visible: true,
	selected: "mac",
	select: () => {},
};

const homeNode = {
	loaded: true,
	nodes: [{ url: "https://mac.ts.net:3100", name: "Mac" }],
	home: { url: "https://mac.ts.net:3100", name: "Mac" },
	connection: { kind: "connected", health: { version: "1.3.0" } },
	choose: () => {},
} as unknown as HomeNodeApi;

function Harness() {
	const updates = usePhoneNodeUpdates(selection, false);
	return (
		<PhoneNodesSheet
			view={{ kind: "list" }}
			onView={() => {}}
			updates={updates}
		/>
	);
}

describe("PhoneNodesSheet updates", () => {
	it("lists each node's update state", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn(async (url: string) => ({
				ok: true,
				json: async () => status(url.includes("node=win") ? "1.2.0" : "1.3.0"),
			})),
		);
		render(
			<ThemeProvider theme={createDesignTheme("dark")}>
				<HomeNodeContext.Provider value={homeNode}>
					<Harness />
				</HomeNodeContext.Provider>
			</ThemeProvider>,
		);
		await waitFor(() =>
			expect(screen.getByTestId("phone-update-row-win").textContent).toContain(
				"v1.3.0 available",
			),
		);
	});
});
