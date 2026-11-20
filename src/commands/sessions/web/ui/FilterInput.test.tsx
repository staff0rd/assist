// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { FilterInput } from "./FilterInput";

afterEach(cleanup);

describe("FilterInput", () => {
	it("turns off browser autocomplete", () => {
		render(<FilterInput value="" onChange={() => {}} placeholder="Filter" />);
		expect(
			screen.getByPlaceholderText("Filter").getAttribute("autocomplete"),
		).toBe("off");
	});
});
