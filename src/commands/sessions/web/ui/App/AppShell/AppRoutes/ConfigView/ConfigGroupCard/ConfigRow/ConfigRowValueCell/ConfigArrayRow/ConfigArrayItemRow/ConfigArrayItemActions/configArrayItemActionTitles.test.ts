import { describe, expect, it } from "vitest";
import { configArrayItemActionTitles } from "./configArrayItemActionTitles";

const base = { label: "run[1]", repoKey: "assist" };

describe("configArrayItemActionTitles", () => {
	it("names the file an item moves and is removed within", () => {
		expect(
			configArrayItemActionTitles({
				...base,
				ownerScope: "repo",
				canMoveUp: true,
				canMoveDown: true,
			}),
		).toEqual({
			moveUp: "Move run[1] up in repos.assist in ~/.assist.yml",
			moveDown: "Move run[1] down in repos.assist in ~/.assist.yml",
			remove: "Remove run[1] from repos.assist in ~/.assist.yml",
		});
	});

	it("explains that an item at the edge of its layer cannot cross scopes", () => {
		const titles = configArrayItemActionTitles({
			...base,
			ownerScope: "project",
			canMoveUp: false,
			canMoveDown: false,
		});

		expect(titles.moveUp).toBe(
			"run[1] is the first entry in this repo's assist.yml — entries cannot move across scopes",
		);
		expect(titles.moveDown).toBe(
			"run[1] is the last entry in this repo's assist.yml — entries cannot move across scopes",
		);
	});

	it("explains that a schema default item is not in any file", () => {
		expect(
			configArrayItemActionTitles({
				...base,
				ownerScope: undefined,
				canMoveUp: false,
				canMoveDown: false,
			}).remove,
		).toBe(
			"run[1] comes from the schema default — it is not set in any file yet",
		);
	});
});
