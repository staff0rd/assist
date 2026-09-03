// @vitest-environment jsdom
import {
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
	type SelectionAnchor,
	SelectionCommentPopover,
} from "./SelectionCommentPopover";

afterEach(() => {
	cleanup();
	vi.unstubAllGlobals();
});

const rules = [
	{ code: "R2", text: "Name the decision", source: "refinement/CLAUDE.md" },
	{ code: "R1", text: "Keep it tight", source: "CLAUDE.md" },
];

function stubRulesFetch(body: {
	rules: { code: string; title?: string; text: string; source: string }[];
}): ReturnType<typeof vi.fn> {
	const fetchMock = vi.fn(async () => ({ json: async () => body }));
	vi.stubGlobal("fetch", fetchMock);
	return fetchMock;
}

const anchor: SelectionAnchor = {
	quote: "const a = 1;",
	top: 120,
	left: 40,
};

function noteField(): HTMLTextAreaElement {
	return screen.getByPlaceholderText("Add a note…") as HTMLTextAreaElement;
}

describe("SelectionCommentPopover", () => {
	it("keeps the typed note when the refreshed selection re-anchors", () => {
		const { rerender } = render(
			<SelectionCommentPopover
				pending={anchor}
				onAdd={vi.fn()}
				onCancel={vi.fn()}
			/>,
		);
		fireEvent.change(noteField(), { target: { value: "needs a guard" } });

		rerender(
			<SelectionCommentPopover
				pending={{ ...anchor, top: 260 }}
				moved={false}
				onAdd={vi.fn()}
				onCancel={vi.fn()}
			/>,
		);

		expect(noteField().value).toBe("needs a guard");
		expect(screen.getByText(anchor.quote)).toBeTruthy();
	});

	it("submits the typed note after a re-anchor", () => {
		const onAdd = vi.fn();
		const { rerender } = render(
			<SelectionCommentPopover
				pending={anchor}
				onAdd={onAdd}
				onCancel={vi.fn()}
			/>,
		);
		fireEvent.change(noteField(), { target: { value: "needs a guard" } });

		rerender(
			<SelectionCommentPopover
				pending={{ ...anchor, top: 260 }}
				moved
				onAdd={onAdd}
				onCancel={vi.fn()}
			/>,
		);
		fireEvent.click(screen.getByText("Add comment"));

		expect(onAdd).toHaveBeenCalledWith("needs a guard");
	});

	it("warns that the lines changed while keeping the original quote", () => {
		render(
			<SelectionCommentPopover
				pending={anchor}
				moved
				onAdd={vi.fn()}
				onCancel={vi.fn()}
			/>,
		);

		expect(
			screen.getByText(/lines changed since you selected them/),
		).toBeTruthy();
		expect(screen.getByText(anchor.quote)).toBeTruthy();
	});

	it("expands the nearest scope and collapses the ones above it", async () => {
		const fetchMock = stubRulesFetch({ rules });

		render(
			<SelectionCommentPopover
				pending={anchor}
				cwd="/repo"
				path="refinement/spec.md"
				onAdd={vi.fn()}
				onCite={vi.fn()}
				onCancel={vi.fn()}
			/>,
		);

		expect(await screen.findByText("R2")).toBeTruthy();
		expect(screen.getByText("Name the decision")).toBeTruthy();
		expect(screen.queryByText("Keep it tight")).toBeNull();
		expect(screen.getByText("refinement/CLAUDE.md")).toBeTruthy();
		expect(screen.getByText("CLAUDE.md")).toBeTruthy();
		expect(fetchMock.mock.calls[0][0]).toBe(
			"/api/rules?cwd=%2Frepo&path=refinement%2Fspec.md",
		);
	});

	it("shows an ancestor scope's rules once its header is clicked", async () => {
		stubRulesFetch({ rules });

		render(
			<SelectionCommentPopover
				pending={anchor}
				cwd="/repo"
				path="refinement/spec.md"
				onAdd={vi.fn()}
				onCite={vi.fn()}
				onCancel={vi.fn()}
			/>,
		);

		fireEvent.click(await screen.findByText("CLAUDE.md"));

		expect(await screen.findByText("Keep it tight")).toBeTruthy();
	});

	it("shows a rule's title in place of its description", async () => {
		stubRulesFetch({
			rules: [
				{
					code: "R2",
					title: "Name the decision",
					text: "Every option considered gets a recorded outcome.",
					source: "refinement/CLAUDE.md",
				},
			],
		});

		render(
			<SelectionCommentPopover
				pending={anchor}
				cwd="/repo"
				path="refinement/spec.md"
				onAdd={vi.fn()}
				onCite={vi.fn()}
				onCancel={vi.fn()}
			/>,
		);

		expect(await screen.findByText("Name the decision")).toBeTruthy();
		expect(
			screen.queryByText("Every option considered gets a recorded outcome."),
		).toBeNull();
	});

	it("cites the clicked rule", async () => {
		stubRulesFetch({ rules });
		const onCite = vi.fn();

		render(
			<SelectionCommentPopover
				pending={anchor}
				cwd="/repo"
				path="refinement/spec.md"
				onAdd={vi.fn()}
				onCite={onCite}
				onCancel={vi.fn()}
			/>,
		);
		fireEvent.click(await screen.findByText("R2"));

		expect(onCite).toHaveBeenCalledWith(rules[0]);
	});

	it("shows the plain popover when no rules are in scope", async () => {
		stubRulesFetch({ rules: [] });

		render(
			<SelectionCommentPopover
				pending={anchor}
				cwd="/repo"
				path="src/a.ts"
				onAdd={vi.fn()}
				onCite={vi.fn()}
				onCancel={vi.fn()}
			/>,
		);

		await waitFor(() => expect(noteField()).toBeTruthy());
		expect(screen.queryByText("Cite a broken rule")).toBeNull();
	});

	it("asks for no rules when the surface cannot cite them", () => {
		const fetchMock = stubRulesFetch({ rules });

		render(
			<SelectionCommentPopover
				pending={anchor}
				cwd="/repo"
				path="src/a.ts"
				onAdd={vi.fn()}
				onCancel={vi.fn()}
			/>,
		);

		expect(fetchMock).not.toHaveBeenCalled();
	});

	it("drops the draft once the popover has closed", () => {
		const { rerender } = render(
			<SelectionCommentPopover
				pending={anchor}
				onAdd={vi.fn()}
				onCancel={vi.fn()}
			/>,
		);
		fireEvent.change(noteField(), { target: { value: "needs a guard" } });

		rerender(
			<SelectionCommentPopover
				pending={null}
				onAdd={vi.fn()}
				onCancel={vi.fn()}
			/>,
		);
		rerender(
			<SelectionCommentPopover
				pending={anchor}
				onAdd={vi.fn()}
				onCancel={vi.fn()}
			/>,
		);

		expect(noteField().value).toBe("");
	});
});
