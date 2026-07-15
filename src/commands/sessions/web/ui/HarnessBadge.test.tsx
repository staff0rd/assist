// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { HarnessBadge } from "./HarnessBadge";

afterEach(cleanup);

describe("HarnessBadge", () => {
	it("renders nothing for claude", () => {
		const { container } = render(<HarnessBadge harness="claude" />);
		expect(container.textContent).toBe("");
	});

	it("renders nothing when the harness is absent (defaults to claude)", () => {
		const { container } = render(<HarnessBadge />);
		expect(container.textContent).toBe("");
	});

	it("renders the pi label", () => {
		render(<HarnessBadge harness="pi" />);
		expect(screen.getByText("pi")).toBeTruthy();
	});

	it("renders the codex label", () => {
		render(<HarnessBadge harness="codex" />);
		expect(screen.getByText("Codex")).toBeTruthy();
	});
});
