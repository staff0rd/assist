import { describe, expect, it } from "vitest";
import { aggregateCommitters } from "./aggregateCommitters";

describe("aggregateCommitters", () => {
	it("sums commit counts per author across repos ordered by total", () => {
		expect(
			aggregateCommitters([
				[
					{ author: "alice", commitCount: 3 },
					{ author: "bob", commitCount: 1 },
				],
				[
					{ author: "bob", commitCount: 4 },
					{ author: "carol", commitCount: 2 },
				],
			]),
		).toEqual([
			{ author: "bob", commitCount: 5 },
			{ author: "alice", commitCount: 3 },
			{ author: "carol", commitCount: 2 },
		]);
	});

	it("returns an empty list for no input", () => {
		expect(aggregateCommitters([])).toEqual([]);
	});
});
