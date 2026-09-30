import { describe, expect, it } from "vitest";
import { pickupsError } from "./pickupsError";

describe("pickupsError", () => {
	it("explains a missing project scope with the command to add it", () => {
		const error = Object.assign(new Error("exit 1"), {
			stderr:
				"gh: Your token has not been granted the required scopes to execute this query. The 'projectV2' field requires one of the following scopes: ['read:project']\n",
		});
		expect(pickupsError("o/3", error)).toMatch(
			/no project scope.*gh auth refresh -h github.com -s project/,
		);
	});

	it("prefixes other failures with the project", () => {
		expect(pickupsError("o/3", new Error("No project 3 owned by o"))).toBe(
			"o/3: No project 3 owned by o",
		);
	});
});
