import { describe, expect, it } from "vitest";
import {
	closeDiffPanel,
	type DiffPanelMap,
	pruneDiffPanels,
	toggleDiffPanel,
	toggleDiffPanelMode,
} from "./toggleDiffPanel";

const target = { cwd: "/repo", claudeSessionId: "sess-1", scope: "all" };

describe("diff panel mode", () => {
	it("opens a new panel in half mode", () => {
		expect(toggleDiffPanel({}, "card-1", target)["card-1"]?.mode).toBe("half");
	});

	it("switches half to full and back", () => {
		const half = toggleDiffPanel({}, "card-1", target);

		const full = toggleDiffPanelMode(half, "card-1");
		expect(full["card-1"]?.mode).toBe("full");

		expect(toggleDiffPanelMode(full, "card-1")["card-1"]?.mode).toBe("half");
	});

	it("keeps the mode when the panel switches scope", () => {
		const full = toggleDiffPanelMode(
			toggleDiffPanel({}, "card-1", target),
			"card-1",
		);

		const switched = toggleDiffPanel(full, "card-1", {
			...target,
			scope: "uncommitted",
		});

		expect(switched["card-1"]).toEqual({
			...target,
			scope: "uncommitted",
			mode: "full",
		});
	});

	it("leaves the map untouched for a session with no panel", () => {
		const panels: DiffPanelMap = {};

		expect(toggleDiffPanelMode(panels, "card-1")).toBe(panels);
	});

	it("does not disturb another session's mode", () => {
		const both = toggleDiffPanel(
			toggleDiffPanel({}, "card-1", target),
			"card-2",
			target,
		);

		const toggled = toggleDiffPanelMode(both, "card-1");

		expect(toggled["card-2"]?.mode).toBe("half");
	});
});

describe("pruneDiffPanels", () => {
	const both = toggleDiffPanel(
		toggleDiffPanel({}, "card-1", target),
		"card-2",
		target,
	);

	it("drops panels for sessions that are gone", () => {
		expect(Object.keys(pruneDiffPanels(both, ["card-2"]))).toEqual(["card-2"]);
	});

	it("drops every panel when no sessions are left", () => {
		expect(pruneDiffPanels(both, [])).toEqual({});
	});

	it("keeps the map identical when every session is still present", () => {
		expect(pruneDiffPanels(both, ["card-1", "card-2"])).toBe(both);
	});

	it("ignores sessions that never had a panel", () => {
		const one = closeDiffPanel(both, "card-2");

		expect(pruneDiffPanels(one, ["card-1", "card-3"])).toBe(one);
	});

	it("reopens at half after a session comes back", () => {
		const full = toggleDiffPanelMode(both, "card-1");

		const reopened = toggleDiffPanel(
			pruneDiffPanels(full, ["card-2"]),
			"card-1",
			target,
		);

		expect(reopened["card-1"]?.mode).toBe("half");
	});
});
