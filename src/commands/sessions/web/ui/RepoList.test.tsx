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

function renderList(list: string[] = repos) {
	const onSelect = vi.fn();
	const close = vi.fn();
	render(
		<RepoList repos={list} selected="" onSelect={onSelect} close={close} />,
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

describe("RepoList filtering", () => {
	const homeRepos = [
		"/home/stafford/git/assist",
		"/home/stafford/git/home",
		"/home/stafford/git/homebrew-tap",
	];

	it("matches the repo name, not parent path segments", () => {
		const { input } = renderList(homeRepos);
		fireEvent.change(input, { target: { value: "home" } });
		expect(screen.getByText("home")).toBeTruthy();
		expect(screen.getByText("homebrew-tap")).toBeTruthy();
		expect(screen.queryByText("assist")).toBeNull();
	});

	it("does not match a query found only in a parent path segment", () => {
		const { input } = renderList(homeRepos);
		fireEvent.change(input, { target: { value: "stafford" } });
		expect(screen.queryByText("assist")).toBeNull();
		expect(screen.queryByText("home")).toBeNull();
	});
});
