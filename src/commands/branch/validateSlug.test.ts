import { describe, expect, it } from "vitest";
import { validateSlug } from "./validateSlug";

describe("validateSlug", () => {
	it("accepts a plain kebab-case slug", () => {
		expect(validateSlug("add-login-form")).toBeNull();
	});

	it("rejects an empty slug", () => {
		expect(validateSlug("")).toMatch(/required/);
	});

	it("rejects a non-kebab-case slug", () => {
		expect(validateSlug("AddLoginForm")).toMatch(/kebab-case/);
	});

	it("rejects a #<number> backlog reference", () => {
		expect(validateSlug("fix-#537-bug")).toMatch(/backlog/);
	});

	it("rejects a bare 1-4 digit numeric segment", () => {
		expect(validateSlug("fix-404-page")).toMatch(/backlog/);
		expect(validateSlug("537")).toMatch(/backlog/);
		expect(validateSlug("add-12-thing")).toMatch(/backlog/);
	});

	it("accepts a slug whose digits are attached to letters", () => {
		expect(validateSlug("add-oauth2-login")).toBeNull();
		expect(validateSlug("v2-migration")).toBeNull();
	});
});
