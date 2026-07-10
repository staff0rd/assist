import { describe, expect, it } from "vitest";
import { deriveBranchSlug, isConciseSlug } from "./deriveBranchSlug";
import { validateSlug } from "./validateSlug";

describe("deriveBranchSlug", () => {
	it("slugs a short name unchanged", () => {
		expect(deriveBranchSlug("Add login form")).toBe("add-login-form");
	});

	it("caps a long name to a handful of words at word boundaries", () => {
		expect(
			deriveBranchSlug(
				"Fix branch naming so we don't ever get huge branch names",
			),
		).toBe("fix-branch-naming-so-we");
	});

	it("drops bare numeric tokens that look like backlog ids", () => {
		expect(deriveBranchSlug("Fix 404 page")).toBe("fix-page");
		expect(deriveBranchSlug("#537 broken layout")).toBe("broken-layout");
	});

	it("keeps digits attached to letters", () => {
		expect(deriveBranchSlug("Add oauth2 login")).toBe("add-oauth2-login");
	});

	it("falls back to 'story' when nothing usable remains", () => {
		expect(deriveBranchSlug("###")).toBe("story");
		expect(deriveBranchSlug("42")).toBe("story");
	});

	it("always produces a slug that passes validateSlug", () => {
		for (const name of [
			"Fix branch naming so we don't ever get huge branch names",
			"Fix 404 page",
			"#537 broken layout",
			"Add oauth2 login",
			"###",
		]) {
			expect(validateSlug(deriveBranchSlug(name))).toBeNull();
		}
	});
});

describe("isConciseSlug", () => {
	it("accepts slugs within the word cap", () => {
		expect(isConciseSlug("fix-branch-naming")).toBe(true);
	});

	it("rejects slugs beyond the word cap", () => {
		expect(isConciseSlug("fix-branch-naming-so-we-dont-ever-get")).toBe(false);
	});
});
