import { describe, expect, it } from "vitest";
import { respawnedIds } from "./respawnedIds";
import { makeSessionInfo } from "../../../../../../../test/mothers/makeSessionInfo";

describe("respawnedIds", () => {
	it("flags an id whose startedAt changed", () => {
		const prev = new Map([["1", 100]]);
		expect(
			respawnedIds(prev, [makeSessionInfo({ id: "1", startedAt: 200 })]),
		).toEqual(["1"]);
	});

	it("ignores ids seen for the first time", () => {
		expect(
			respawnedIds(new Map(), [makeSessionInfo({ id: "1", startedAt: 1 })]),
		).toEqual([]);
	});

	it("ignores ids whose startedAt is unchanged", () => {
		const prev = new Map([["1", 100]]);
		expect(
			respawnedIds(prev, [makeSessionInfo({ id: "1", startedAt: 100 })]),
		).toEqual([]);
	});
});
