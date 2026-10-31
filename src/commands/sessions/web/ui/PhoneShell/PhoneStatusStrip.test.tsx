// @vitest-environment jsdom
import { ThemeProvider } from "@mui/material/styles";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { createDesignTheme } from "../designSystem/createDesignTheme";
import type { SessionInfo } from "../types";
import { PhoneStatusStrip } from "./PhoneStatusStrip";

afterEach(cleanup);

function renderStrip(extra: Partial<SessionInfo>) {
	const session: SessionInfo = {
		id: "s1",
		name: "s1",
		status: "running",
		commandType: "claude",
		startedAt: 0,
		cwd: "/Users/me/git/assist",
		...extra,
	};
	render(
		<ThemeProvider theme={createDesignTheme("dark", "touch")}>
			<PhoneStatusStrip session={session} localNode="mac" />
		</ThemeProvider>,
	);
}

describe("PhoneStatusStrip", () => {
	it("shows the repo and the local node", () => {
		renderStrip({});
		expect(screen.getByTestId("strip-repo").textContent).toBe("assist");
		expect(screen.getByTestId("strip-node").textContent).toBe("mac");
	});

	it("shows a linked node once", () => {
		renderStrip({ node: "pc" });
		expect(screen.getByTestId("strip-node").textContent).toBe("pc");
		expect(screen.queryByTestId("node-badge")).toBeNull();
	});
});
