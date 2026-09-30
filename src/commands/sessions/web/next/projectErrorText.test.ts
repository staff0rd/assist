import { describe, expect, it } from "vitest";
import { projectErrorText } from "./projectErrorText";

describe("projectErrorText", () => {
	it("explains a missing project scope with the command to add it", () => {
		const error = Object.assign(new Error("exit 1"), {
			stderr:
				"gh: Your token has not been granted the required scopes to execute this query. The 'projectV2' field requires one of the following scopes: ['read:project']\n",
		});
		expect(projectErrorText(error)).toMatch(
			/no project scope.*gh auth refresh -h github.com -s project/,
		);
	});

	it("passes other failures through", () => {
		expect(projectErrorText(new Error("No project 3 owned by o"))).toBe(
			"No project 3 owned by o",
		);
	});
});
