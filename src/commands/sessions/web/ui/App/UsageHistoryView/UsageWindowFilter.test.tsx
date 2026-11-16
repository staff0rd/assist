// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { UsageWindowFilter } from "./UsageWindowFilter";

const capabilities = vi.hoisted(() => ({ exposeCodexActions: false }));

vi.mock("../../useHarnessCapabilities", () => ({
	useHarnessCapabilities: () => capabilities,
}));

afterEach(cleanup);

function buttonLabels() {
	render(<UsageWindowFilter window="all" onChange={() => {}} />);
	return screen.getAllByRole("button").map((button) => button.textContent);
}

describe("UsageWindowFilter", () => {
	it("shows Codex 7d but not Codex 5h when Codex actions are exposed", () => {
		capabilities.exposeCodexActions = true;
		expect(buttonLabels()).toEqual(["All", "5h", "7d", "Codex 7d"]);
	});

	it("shows only Claude windows when Codex actions are hidden", () => {
		capabilities.exposeCodexActions = false;
		expect(buttonLabels()).toEqual(["All", "5h", "7d"]);
	});
});
