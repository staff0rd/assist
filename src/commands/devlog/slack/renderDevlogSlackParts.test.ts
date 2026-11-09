import { describe, expect, it } from "vitest";
import type { DevEntryFile } from "./readDevEntryFile";
import { renderDevlogSlackParts } from "./renderDevlogSlackParts";

const yoke: DevEntryFile = {
	project: "yoke",
	week: "2026-W43",
	title: "yoke bootstrap, `/pr` skill",
	dates: { first: "2026-10-19", last: "2026-10-23" },
	versions: { first: "v0.1.0", last: "v0.2.0" },
	added: [
		{ text: "`yoke sync` installs the `/pr` skill" },
		{ text: "`yoke pr raise`" },
	],
	changed: [{ text: "Release summary shows the version" }],
	lede: "yoke's first week.",
};

describe("renderDevlogSlackParts", () => {
	it("renders a short parent and the lists as a threaded reply", () => {
		expect(renderDevlogSlackParts(yoke, "yoke", "2026-W43")).toEqual([
			"**yoke · 2026-W43** · v0.1.0 → v0.2.0\n**yoke bootstrap, `/pr` skill**\n\nyoke's first week.\n\n2 added · 1 changed",
			"**Added**\n- `yoke sync` installs the `/pr` skill\n- `yoke pr raise`\n\n**Changed**\n- Release summary shows the version",
		]);
	});

	it("falls back to the date range and collapses an equal range", () => {
		const [parent] = renderDevlogSlackParts(
			{
				...yoke,
				versions: undefined,
				dates: { first: "2026-10-19", last: "2026-10-19" },
			},
			"yoke",
			"2026-W43",
		);
		expect(parent.split("\n")[0]).toBe("**yoke · 2026-W43** · 2026-10-19");
	});

	it("renders the parent only when the entry has no list items", () => {
		const parts = renderDevlogSlackParts(
			{ ...yoke, added: [], changed: undefined },
			"yoke",
			"2026-W43",
		);
		expect(parts).toEqual([
			"**yoke · 2026-W43** · v0.1.0 → v0.2.0\n**yoke bootstrap, `/pr` skill**\n\nyoke's first week.",
		]);
	});
});
