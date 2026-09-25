// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { SessionStatusDot } from "./SessionStatusDot";

afterEach(cleanup);

describe("SessionStatusDot", () => {
	it("names the status alongside the dot when labelled", () => {
		render(<SessionStatusDot status="running" label />);

		expect(screen.getByText("● running")).toBeTruthy();
	});

	it("carries the status in a tooltip when it stands alone", () => {
		render(<SessionStatusDot status="running" />);

		const dot = screen.getByTitle("running");
		expect(dot.textContent).toBe("●");
		expect(getComputedStyle(dot).fontSize).toBe("1.68rem");
	});

	it("pulses a waiting session so it stands out with no text", () => {
		render(<SessionStatusDot status="waiting" />);

		expect(getComputedStyle(screen.getByTitle("waiting")).animation).toContain(
			"1.4s",
		);
	});

	it("holds still for a session that needs no attention", () => {
		render(<SessionStatusDot status="running" />);

		expect(getComputedStyle(screen.getByTitle("running")).animation).toBe("");
	});

	it("leaves the labelled dot unanimated", () => {
		render(<SessionStatusDot status="waiting" label />);

		expect(getComputedStyle(screen.getByText("● waiting")).animation).toBe("");
	});
});
