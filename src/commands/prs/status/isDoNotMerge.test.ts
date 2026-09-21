import { describe, expect, it } from "vitest";
import { isDoNotMerge } from "./isDoNotMerge";

describe("isDoNotMerge", () => {
	it.each([
		"[DO NOT REVIEW] - added new extra models",
		"[DO NOT MERGE] spike",
		"[do not merge yet] spike",
		"[DO-NOT-MERGE] spike",
		"[DNM] spike",
		"(DNM) spike",
		"  [dnm] spike",
	])("flags %s", (title) => {
		expect(isDoNotMerge(title)).toBe(true);
	});

	it.each([
		"feat: do not merge on Fridays",
		"[WIP] spike",
		"[BigInterview] Add AI feedback",
		"fix(dnm): tidy up",
	])("leaves %s alone", (title) => {
		expect(isDoNotMerge(title)).toBe(false);
	});
});
