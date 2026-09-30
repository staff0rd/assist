import { describe, expect, it } from "vitest";
import { selectPickups } from "./selectPickups";
import type { GhProjectItemNode } from "./types";

function item(
	number: number,
	overrides: {
		status?: string | null;
		priority?: string;
		assignees?: number;
		state?: string;
		repo?: string;
		draft?: boolean;
	} = {},
): GhProjectItemNode {
	const status = overrides.status === undefined ? "Ready" : overrides.status;
	return {
		id: `PVTI_${number}`,
		status: status ? { name: status } : null,
		priority: overrides.priority ? { name: overrides.priority } : null,
		content: overrides.draft
			? {}
			: {
					number,
					title: `Item ${number}`,
					url: `https://github.com/${overrides.repo ?? "o/r"}/issues/${number}`,
					createdAt: `2026-09-${String(number).padStart(2, "0")}T00:00:00Z`,
					state: overrides.state ?? "OPEN",
					author: { login: "alice" },
					repository: { nameWithOwner: overrides.repo ?? "o/r" },
					assignees: { totalCount: overrides.assignees ?? 0 },
					labels: { nodes: [{ name: "bug" }] },
				},
	};
}

const numbers = (
	nodes: GhProjectItemNode[],
	statuses = ["Ready", "Todo"],
	priorities = ["P0", "P1", "P2"],
) => selectPickups(nodes, statuses, priorities).map((p) => p.number);

describe("selectPickups", () => {
	it("keeps unassigned open issues in a pick status, case-insensitively", () => {
		expect(
			numbers([item(1), item(2, { status: "todo" })], ["ready", "Todo"]),
		).toEqual([1, 2]);
	});

	it("excludes items in other statuses or with no status", () => {
		expect(
			numbers([item(1, { status: "In Progress" }), item(2, { status: null })]),
		).toEqual([]);
	});

	it("excludes assigned, closed and draft items", () => {
		expect(
			numbers([
				item(1, { assignees: 1 }),
				item(2, { state: "CLOSED" }),
				item(3, { draft: true }),
			]),
		).toEqual([]);
	});

	it("orders by priority option order, unprioritised last, then oldest", () => {
		expect(
			numbers([
				item(1),
				item(2, { priority: "P2" }),
				item(3, { priority: "P0" }),
				item(4, { priority: "P2" }),
				item(5, { priority: "Unknown" }),
			]),
		).toEqual([3, 2, 4, 1, 5]);
	});

	it("takes each item's repo from its issue", () => {
		const [pickup] = selectPickups(
			[item(1, { repo: "other/web", priority: "P1" })],
			["Ready"],
			["P1"],
		);
		expect(pickup).toMatchObject({
			repo: "other/web",
			itemId: "PVTI_1",
			status: "Ready",
			priority: "P1",
			labels: ["bug"],
		});
	});
});
