import { describe, expect, it } from "vitest";
import { mergeInternalPeople } from "./mergeInternalPeople";

describe("mergeInternalPeople", () => {
	it("merges team status with internal group tester state by email", () => {
		expect(
			mergeInternalPeople({
				members: ["Sam@x.com", "jo@x.com"],
				invitees: ["alex@x.com"],
				groupTesters: [{ email: "sam@x.com", testflight: "installed" }],
			}),
		).toEqual([
			{ email: "alex@x.com", team: "pending", testflight: "not-in-group" },
			{ email: "jo@x.com", team: "joined", testflight: "not-in-group" },
			{ email: "Sam@x.com", team: "joined", testflight: "installed" },
		]);
	});

	it("treats a group tester missing from the team list as joined", () => {
		expect(
			mergeInternalPeople({
				members: [],
				invitees: [],
				groupTesters: [{ email: "a@x.com", testflight: "invited" }],
			}),
		).toEqual([{ email: "a@x.com", team: "joined", testflight: "invited" }]);
	});
});
