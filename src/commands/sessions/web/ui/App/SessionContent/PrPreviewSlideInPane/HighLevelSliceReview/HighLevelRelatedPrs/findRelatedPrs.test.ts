import { describe, expect, it } from "vitest";
import { findRelatedPrs } from "./findRelatedPrs";

describe("findRelatedPrs", () => {
	it("normalises shorthand and pull URLs with their source line", () => {
		expect(
			findRelatedPrs(
				"Pairs with acme/web#412, which renders the new field.\n  Deploy after https://github.com/acme/infra/pull/88 merges.",
				"acme/api",
				7,
			),
		).toEqual([
			{
				reference: "acme/web#412",
				url: "https://github.com/acme/web/pull/412",
				line: "Pairs with acme/web#412, which renders the new field.",
			},
			{
				reference: "acme/infra#88",
				url: "https://github.com/acme/infra/pull/88",
				line: "Deploy after https://github.com/acme/infra/pull/88 merges.",
			},
		]);
	});

	it("accepts a pull URL without a scheme", () => {
		expect(
			findRelatedPrs("See github.com/acme/infra/pull/88", "acme/api", 7).map(
				(pr) => pr.reference,
			),
		).toEqual(["acme/infra#88"]);
	});

	it("excludes the reviewed PR and lists duplicates once", () => {
		expect(
			findRelatedPrs(
				"Follows Acme/API#7 and acme/web#1.\nAlso https://github.com/acme/web/pull/1 and https://github.com/acme/api/pull/7",
				"acme/api",
				7,
			).map((pr) => pr.reference),
		).toEqual(["acme/web#1"]);
	});

	it("ignores issue URLs and bare same-repo references", () => {
		expect(
			findRelatedPrs(
				"Fixes #3 and https://github.com/acme/web/issues/9",
				"acme/api",
				7,
			),
		).toEqual([]);
	});
});
