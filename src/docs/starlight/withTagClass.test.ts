import { describe, expect, it } from "vitest";
import { withTagClass } from "./withTagClass";

describe("withTagClass", () => {
	it("appends to an existing class attribute", () => {
		expect(withTagClass('<article id="a" class="card">', "x")).toBe(
			'<article id="a" class="card x">',
		);
	});

	it("adds a class attribute when there is none", () => {
		expect(withTagClass("<div>", "x")).toBe('<div class="x">');
	});
});
