import { describe, expect, it } from "vitest";
import { mergeDenyRules, mergeRawConfigs } from "./mergeDenyRules";

describe("mergeDenyRules", () => {
	it("returns undefined when both are undefined", () => {
		expect(mergeDenyRules(undefined, undefined)).toBeUndefined();
	});

	it("returns project deny when global is undefined", () => {
		const project = [{ pattern: "rm", message: "no rm" }];
		expect(mergeDenyRules(undefined, project)).toEqual(project);
	});

	it("returns global deny when project is undefined", () => {
		const global = [{ pattern: "rm", message: "no rm" }];
		expect(mergeDenyRules(global, undefined)).toEqual(global);
	});

	it("concatenates non-overlapping rules with global first", () => {
		const global = [{ pattern: "rm", message: "global no rm" }];
		const project = [{ pattern: "git push --force", message: "no force" }];
		expect(mergeDenyRules(global, project)).toEqual([
			{ pattern: "rm", message: "global no rm" },
			{ pattern: "git push --force", message: "no force" },
		]);
	});

	it("project overrides global on matching pattern", () => {
		const global = [{ pattern: "rm", message: "global msg" }];
		const project = [{ pattern: "rm", message: "project msg" }];
		expect(mergeDenyRules(global, project)).toEqual([
			{ pattern: "rm", message: "project msg" },
		]);
	});

	it("mixes overrides and unique rules", () => {
		const global = [
			{ pattern: "rm", message: "global rm" },
			{ pattern: "kill", message: "global kill" },
		];
		const project = [
			{ pattern: "rm", message: "project rm" },
			{ pattern: "drop", message: "project drop" },
		];
		expect(mergeDenyRules(global, project)).toEqual([
			{ pattern: "kill", message: "global kill" },
			{ pattern: "rm", message: "project rm" },
			{ pattern: "drop", message: "project drop" },
		]);
	});
});

describe("mergeRawConfigs subtasks", () => {
	it("leaves subtasks unset when neither side has them", () => {
		expect(mergeRawConfigs({}, {})).not.toHaveProperty("subtasks");
	});

	it("combines global and project subtasks with global first", () => {
		const merged = mergeRawConfigs(
			{ subtasks: [{ title: "global" }] },
			{ subtasks: [{ title: "project" }] },
		);
		expect(merged.subtasks).toEqual([
			{ title: "global" },
			{ title: "project" },
		]);
	});

	it("keeps global-only subtasks", () => {
		const merged = mergeRawConfigs({ subtasks: [{ title: "global" }] }, {});
		expect(merged.subtasks).toEqual([{ title: "global" }]);
	});

	it("keeps project-only subtasks", () => {
		const merged = mergeRawConfigs({}, { subtasks: [{ title: "project" }] });
		expect(merged.subtasks).toEqual([{ title: "project" }]);
	});
});
