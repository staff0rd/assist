// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { SessionInfo } from "../../types";
import { useServerRuns } from "../useServerRuns";
import { ServerRunControls } from "./ServerRunControls";

vi.mock("../useServerRuns", () => ({ useServerRuns: vi.fn() }));

afterEach(cleanup);

const servingSession = {
	id: "daemon-1",
	name: "web",
	commandType: "run",
	runName: "web",
	server: true,
	cwd: "/repo",
	startedAt: 0,
	status: "running",
} as SessionInfo;

describe("ServerRunControls", () => {
	it("keeps the Start button for a live served run and shows no Stop button", () => {
		vi.mocked(useServerRuns).mockReturnValue([{ name: "web" }]);

		render(<ServerRunControls session={servingSession} />);

		expect(screen.getByTitle("Start web")).toBeTruthy();
		expect(screen.queryByTitle("Stop server")).toBeNull();
	});
});
