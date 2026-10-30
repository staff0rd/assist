import { describe, expect, it } from "vitest";
import type { SessionInfo } from "../types";
import { groupSessionsByStatus } from "./groupSessionsByStatus";

function session(
	id: string,
	status: SessionInfo["status"],
	extra: Partial<SessionInfo> = {},
): SessionInfo {
	return {
		id,
		name: id,
		status,
		commandType: "claude",
		startedAt: 0,
		...extra,
	};
}

const ids = (list: SessionInfo[]) => list.map((s) => s.id);

describe("groupSessionsByStatus", () => {
	it("puts waiting and error sessions in Needs you", () => {
		const groups = groupSessionsByStatus([
			session("a", "running"),
			session("b", "waiting"),
			session("c", "error"),
			session("d", "done"),
			session("e", "stopped"),
		]);

		expect(ids(groups.needsYou)).toEqual(["b", "c"]);
		expect(ids(groups.running)).toEqual(["a"]);
		expect(ids(groups.done)).toEqual(["d", "e"]);
	});

	it("treats a running session with a blocking preview as needing you", () => {
		const groups = groupSessionsByStatus([
			session("a", "running", {
				pendingPrPreview: {
					requestId: "r",
					title: "PR",
					body: "",
					prNumber: 1,
					kind: "pr",
				},
			}),
		]);

		expect(ids(groups.needsYou)).toEqual(["a"]);
	});
});
