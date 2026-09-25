// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { RepoList } from "./RepoList";

beforeAll(() => {
	Element.prototype.scrollIntoView = vi.fn();
});

afterEach(() => {
	cleanup();
});

const repos = ["/repos/alpha", "/repos/beta", "/repos/gamma"];

function renderList() {
	const onSelect = vi.fn();
	const close = vi.fn();
	render(
		<RepoList repos={repos} selected="" onSelect={onSelect} close={close} />,
	);
	const input = screen.getByPlaceholderText("Filter repos...");
	return { onSelect, close, input };
}

describe("RepoList keyboard navigation", () => {
	it("Enter selects the highlighted repo and closes", () => {
		const { onSelect, close, input } = renderList();
		fireEvent.keyDown(input, { key: "ArrowDown" });
		fireEvent.keyDown(input, { key: "Enter" });
		expect(onSelect).toHaveBeenCalledWith("/repos/beta");
		expect(close).toHaveBeenCalled();
	});

	it("ArrowUp wraps to the last repo", () => {
		const { onSelect, input } = renderList();
		fireEvent.keyDown(input, { key: "ArrowUp" });
		fireEvent.keyDown(input, { key: "Enter" });
		expect(onSelect).toHaveBeenCalledWith("/repos/gamma");
	});

	it("ArrowDown wraps back to the first repo", () => {
		const { onSelect, input } = renderList();
		fireEvent.keyDown(input, { key: "ArrowDown" });
		fireEvent.keyDown(input, { key: "ArrowDown" });
		fireEvent.keyDown(input, { key: "ArrowDown" });
		fireEvent.keyDown(input, { key: "Enter" });
		expect(onSelect).toHaveBeenCalledWith("/repos/alpha");
	});

	it("Escape closes without selecting", () => {
		const { onSelect, close, input } = renderList();
		fireEvent.keyDown(input, { key: "Escape" });
		expect(close).toHaveBeenCalled();
		expect(onSelect).not.toHaveBeenCalled();
	});

	it("filtering narrows results and Enter selects the match", () => {
		const { onSelect, input } = renderList();
		fireEvent.change(input, { target: { value: "gam" } });
		fireEvent.keyDown(input, { key: "Enter" });
		expect(onSelect).toHaveBeenCalledWith("/repos/gamma");
	});

	it("clicking a repo selects it", () => {
		const { onSelect, close } = renderList();
		fireEvent.click(screen.getByText("beta"));
		expect(onSelect).toHaveBeenCalledWith("/repos/beta");
		expect(close).toHaveBeenCalled();
	});
});
