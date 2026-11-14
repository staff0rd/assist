// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { PhoneSectionHeader } from "./PhoneSectionHeader";

afterEach(cleanup);

describe("PhoneSectionHeader", () => {
	it("marks pending checks with a wrench head", () => {
		render(<PhoneSectionHeader label="Needs you" count={3} checks={2} />);

		const checks = screen.getByTestId("section-check-count");
		expect(checks.querySelector("[data-testid='wrench-head']")).not.toBeNull();
		expect(checks.textContent).toBe(" 2");
	});
});
