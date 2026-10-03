import { describe, expect, it } from "vitest";
import { makeSessionInfo } from "../../../../../../../test/mothers/makeSessionInfo";
import { sortSessionsByStar } from "./sortSessionsByStar";

describe("sortSessionsByStar", () => {
	it("pins starred sessions first, preserving order within each group", () => {
		const sessions = ["a", "b", "c", "d"].map((id) => makeSessionInfo({ id }));
		const starred = new Set(["b", "d"]);

		const sorted = sortSessionsByStar(sessions, (s) => starred.has(s.id));

		expect(sorted.map((s) => s.id)).toEqual(["b", "d", "a", "c"]);
	});

	it("leaves the order unchanged when nothing is starred", () => {
		const sessions = ["a", "b", "c"].map((id) => makeSessionInfo({ id }));
		const sorted = sortSessionsByStar(sessions, () => false);
		expect(sorted.map((s) => s.id)).toEqual(["a", "b", "c"]);
	});
});
