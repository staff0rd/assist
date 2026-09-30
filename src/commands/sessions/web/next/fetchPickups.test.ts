import { beforeEach, describe, expect, it, vi } from "vitest";
import type { GhProjectItemNode, PickupFilter } from "./types";

const readProjectItems = vi.fn();

vi.mock("./readProjectItems", () => ({
	readProjectItems: (...args: unknown[]) => readProjectItems(...args),
}));

import { fetchPickups } from "./fetchPickups";

function item(number: number, priority: string): GhProjectItemNode {
	return {
		id: `PVTI_${number}`,
		status: { name: "Ready" },
		priority: { name: priority },
		content: {
			number,
			title: `Item ${number}`,
			url: `https://github.com/o/r/issues/${number}`,
			createdAt: `2026-09-${String(number).padStart(2, "0")}T00:00:00Z`,
			state: "OPEN",
			repository: { nameWithOwner: "o/r" },
			assignees: { totalCount: 0 },
		},
	};
}

function board(project: string, nodes: GhProjectItemNode[]) {
	return {
		nodes,
		board: { project, title: `Board ${project}`, url: `u/${project}` },
	};
}

const filter: PickupFilter = {
	pickStatuses: ["Ready"],
	excludeLabels: [],
	excludeTypes: [],
};

beforeEach(() => readProjectItems.mockReset());

describe("fetchPickups", () => {
	it("reads nothing and reports nothing when no project is set", async () => {
		expect(await fetchPickups("/repo", [], filter)).toEqual({
			pickups: { items: [], error: null },
			boards: [],
		});
		expect(readProjectItems).not.toHaveBeenCalled();
	});

	it("lists projects in configured order, each in its board order", async () => {
		readProjectItems.mockImplementation(async (_cwd, project: string) =>
			project === "o/3"
				? board("o/3", [item(2, "Low"), item(1, "High")])
				: board("o/5", [item(4, "P2"), item(3, "P0")]),
		);
		const { pickups: section } = await fetchPickups(
			"/repo",
			["o/5", "o/3"],
			filter,
		);
		expect(section.items.map((p) => [p.number, p.project])).toEqual([
			[4, "o/5"],
			[3, "o/5"],
			[2, "o/3"],
			[1, "o/3"],
		]);
		expect(section.error).toBeNull();
	});

	it("keeps other projects' items when one cannot be read", async () => {
		readProjectItems.mockImplementation(async (_cwd, project: string) => {
			if (project === "o/9")
				throw Object.assign(new Error("exit 1"), {
					stderr: "required scopes ['read:project']",
				});
			return board("o/3", [item(1, "High")]);
		});
		const { pickups, boards } = await fetchPickups(
			"/repo",
			["o/3", "o/9"],
			filter,
		);
		expect(pickups.items.map((p) => p.number)).toEqual([1]);
		expect(pickups.error).toMatch(/^o\/9: The gh token has no project scope/);
		expect(boards).toEqual([
			{ project: "o/3", title: "Board o/3", url: "u/o/3" },
		]);
	});
});
