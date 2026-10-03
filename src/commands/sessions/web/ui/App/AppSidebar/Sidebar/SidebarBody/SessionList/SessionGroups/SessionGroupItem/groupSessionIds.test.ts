import { describe, expect, it } from "vitest";
import { makeSessionInfo } from "../../../../../../../../../../../test/mothers/makeSessionInfo";
import { groupSessionIds } from "./groupSessionIds";

describe("groupSessionIds", () => {
	it("lists every row and its nested children", () => {
		const rows = [
			{
				session: makeSessionInfo({ id: "run" }),
				children: [
					makeSessionInfo({ id: "review" }),
					makeSessionInfo({ id: "fix" }),
				],
			},
			{ session: makeSessionInfo({ id: "solo" }), children: [] },
		];

		expect(groupSessionIds(rows)).toEqual(["run", "review", "fix", "solo"]);
	});
});
