import { describe, expect, it } from "vitest";
import { sortSessionsByStar } from "./sortSessionsByStar";
import type { SessionInfo } from "./types";

function session(id: string): SessionInfo {
	return {
		id,
		name: id,
		commandType: "run",
		status: "running",
		startedAt: 0,
	};
}

describe("sortSessionsByStar", () => {
	it("pins starred sessions first, preserving order within each group", () => {
		const sessions = ["a", "b", "c", "d"].map(session);
		const starred = new Set(["b", "d"]);

		const sorted = sortSessionsByStar(sessions, (s) => starred.has(s.id));

		expect(sorted.map((s) => s.id)).toEqual(["b", "d", "a", "c"]);
	});

	it("leaves the order unchanged when nothing is starred", () => {
		const sessions = ["a", "b", "c"].map(session);
		const sorted = sortSessionsByStar(sessions, () => false);
		expect(sorted.map((s) => s.id)).toEqual(["a", "b", "c"]);
	});
});
