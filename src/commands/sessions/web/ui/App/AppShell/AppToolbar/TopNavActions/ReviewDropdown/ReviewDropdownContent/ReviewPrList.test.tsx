// @vitest-environment jsdom
import {
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import type { PrSummary } from "../../../../../../../prList";
import { ReviewPrList } from "./ReviewPrList";

const prs: PrSummary[] = [
	{
		number: 1,
		title: "Add login page",
		author: "ada",
		createdAt: "2026-09-20T00:00:00Z",
		url: "https://example.test/1",
	},
	{
		number: 2,
		title: "Fix cache eviction",
		author: "grace",
		createdAt: "2026-09-20T00:00:00Z",
		url: "https://example.test/2",
	},
	{
		number: 3,
		title: "Bump deps",
		author: "linus",
		createdAt: "2026-09-20T00:00:00Z",
		url: "https://example.test/3",
	},
];

beforeAll(() => {
	Element.prototype.scrollIntoView = vi.fn();
});

afterEach(() => {
	cleanup();
	vi.unstubAllGlobals();
});

async function renderList() {
	vi.stubGlobal(
		"fetch",
		vi.fn().mockResolvedValue({ json: async () => ({ prs }) }),
	);
	const onPick = vi.fn();
	const close = vi.fn();
	render(<ReviewPrList cwd="/repo" onPick={onPick} close={close} />);
	const input = await screen.findByPlaceholderText("Filter PRs...");
	return { onPick, close, input };
}

describe("ReviewPrList keyboard navigation", () => {
	it("focuses the filter field once the PRs load", async () => {
		const { input } = await renderList();
		await waitFor(() => expect(document.activeElement).toBe(input));
	});

	it("Enter picks the highlighted PR and closes", async () => {
		const { onPick, close, input } = await renderList();
		fireEvent.keyDown(input, { key: "ArrowDown" });
		fireEvent.keyDown(input, { key: "Enter" });
		expect(onPick).toHaveBeenCalledWith(prs[1]);
		expect(close).toHaveBeenCalled();
	});

	it("ArrowUp wraps to the last PR", async () => {
		const { onPick, input } = await renderList();
		fireEvent.keyDown(input, { key: "ArrowUp" });
		fireEvent.keyDown(input, { key: "Enter" });
		expect(onPick).toHaveBeenCalledWith(prs[2]);
	});

	it("Escape closes without picking", async () => {
		const { onPick, close, input } = await renderList();
		fireEvent.keyDown(input, { key: "Escape" });
		expect(close).toHaveBeenCalled();
		expect(onPick).not.toHaveBeenCalled();
	});

	it("filtering by author narrows the list and Enter picks the match", async () => {
		const { onPick, input } = await renderList();
		fireEvent.change(input, { target: { value: "grace" } });
		expect(screen.queryByText("Add login page")).toBeNull();
		fireEvent.keyDown(input, { key: "Enter" });
		expect(onPick).toHaveBeenCalledWith(prs[1]);
	});

	it("shows a message when nothing matches", async () => {
		const { input } = await renderList();
		fireEvent.change(input, { target: { value: "zzz" } });
		expect(screen.getByText("No PRs match")).toBeTruthy();
	});

	it("clicking a PR picks it and closes", async () => {
		const { onPick, close } = await renderList();
		fireEvent.click(screen.getByText("Bump deps"));
		expect(onPick).toHaveBeenCalledWith(prs[2]);
		expect(close).toHaveBeenCalled();
	});
});
