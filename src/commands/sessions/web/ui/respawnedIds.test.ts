import { describe, expect, it } from "vitest";
import { respawnedIds } from "./respawnedIds";
import type { SessionInfo } from "./types";

function session(
	overrides: Partial<SessionInfo> & { id: string },
): SessionInfo {
	return {
		name: "s",
		commandType: "assist",
		status: "running",
		startedAt: 1,
		...overrides,
	};
}

describe("respawnedIds", () => {
	it("flags an id whose startedAt changed", () => {
		const prev = new Map([["1", 100]]);
		expect(respawnedIds(prev, [session({ id: "1", startedAt: 200 })])).toEqual([
			"1",
		]);
	});

	it("ignores ids seen for the first time", () => {
		expect(
			respawnedIds(new Map(), [session({ id: "1", startedAt: 1 })]),
		).toEqual([]);
	});

	it("ignores ids whose startedAt is unchanged", () => {
		const prev = new Map([["1", 100]]);
		expect(respawnedIds(prev, [session({ id: "1", startedAt: 100 })])).toEqual(
			[],
		);
	});
});
