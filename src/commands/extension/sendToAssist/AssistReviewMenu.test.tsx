// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { reviewPrCommentsFeature } from "../../../shared/harnessAdapters/prFeatures";
import { reviewRefineFeature } from "../../../shared/harnessAdapters/reviewFeatures";
import { AssistReviewMenu } from "./AssistReviewMenu";

const available = { available: true };

function stubHarness(result: unknown) {
	const sendMessage = vi.fn(async () => result);
	(globalThis as { browser?: unknown }).browser = {
		runtime: { sendMessage, onMessage: { addListener: vi.fn() } },
	};
	return sendMessage;
}

const capabilities = {
	exposeCodexActions: true,
	exposePiActions: false,
	engine: "claude",
	features: {
		[reviewRefineFeature.id]: { claude: available, codex: available },
		[reviewPrCommentsFeature.id]: { claude: available, codex: available },
	},
};

beforeEach(() => {
	stubHarness({ ok: true, capabilities });
});

afterEach(() => {
	cleanup();
	delete (globalThis as { browser?: unknown }).browser;
});

describe("AssistReviewMenu", () => {
	it("launches a GitHub action on Codex from its harness button", async () => {
		const onPick = vi.fn();
		render(<AssistReviewMenu onPick={onPick} onClose={vi.fn()} />);
		fireEvent.click(
			await screen.findByRole("button", {
				name: "Run Review & refine on Codex",
			}),
		);
		expect(onPick).toHaveBeenCalledWith([
			"review",
			"--refine",
			"--harness",
			"codex",
		]);
	});

	it("launches on the engine without --harness from the row", async () => {
		const onPick = vi.fn();
		render(<AssistReviewMenu onPick={onPick} onClose={vi.fn()} />);
		await screen.findByRole("button", { name: "Run Review & refine on Codex" });
		fireEvent.click(screen.getByRole("menuitem", { name: /^Review & refine/ }));
		expect(onPick).toHaveBeenCalledWith(["review", "--refine"]);
	});

	it("offers Codex on Azure DevOps Address Comments only", async () => {
		const onPick = vi.fn();
		render(<AssistReviewMenu actionsOnly onPick={onPick} onClose={vi.fn()} />);
		fireEvent.click(
			await screen.findByRole("button", {
				name: "Run Address Comments (auto) on Codex",
			}),
		);
		expect(onPick).toHaveBeenCalledWith([
			"review-pr-comments",
			"--auto",
			"--harness",
			"codex",
		]);
		expect(
			screen.queryByRole("button", { name: "Run Checkout on Codex" }),
		).toBeNull();
	});

	it("shows no harness buttons when the server is unreachable", async () => {
		const sendMessage = stubHarness({ ok: false, message: "unreachable" });
		render(<AssistReviewMenu onPick={vi.fn()} onClose={vi.fn()} />);
		await vi.waitFor(() => expect(sendMessage).toHaveBeenCalled());
		expect(screen.queryByRole("button", { name: /^Run / })).toBeNull();
	});
});

describe("AssistReviewMenu prompt field", () => {
	function field(): HTMLTextAreaElement {
		return screen.getByLabelText("Instructions for assist");
	}

	it("shows no prompt field without onPrompt", () => {
		render(<AssistReviewMenu onPick={vi.fn()} onClose={vi.fn()} />);
		expect(screen.queryByLabelText("Instructions for assist")).toBeNull();
	});

	it("starts focus in the field above the menu rows", () => {
		render(
			<AssistReviewMenu
				onPick={vi.fn()}
				onPrompt={vi.fn()}
				onClose={vi.fn()}
			/>,
		);
		expect(document.activeElement).toBe(field());
		const menu = screen.getByRole("menu");
		expect(
			field().compareDocumentPosition(menu) & Node.DOCUMENT_POSITION_FOLLOWING,
		).toBeTruthy();
	});

	it("prompts with the typed question on Enter", () => {
		const onPrompt = vi.fn();
		render(
			<AssistReviewMenu
				onPick={vi.fn()}
				onPrompt={onPrompt}
				onClose={vi.fn()}
			/>,
		);
		fireEvent.change(field(), { target: { value: "Why the retry?" } });
		fireEvent.keyDown(field(), { key: "Enter" });
		expect(onPrompt).toHaveBeenCalledWith("Why the retry?");
	});

	it("prompts from the Prompt button", () => {
		const onPrompt = vi.fn();
		render(
			<AssistReviewMenu
				onPick={vi.fn()}
				onPrompt={onPrompt}
				onClose={vi.fn()}
			/>,
		);
		fireEvent.change(field(), { target: { value: "Summarise" } });
		fireEvent.click(screen.getByRole("button", { name: "Prompt" }));
		expect(onPrompt).toHaveBeenCalledWith("Summarise");
	});

	it.each(["ArrowDown", "Tab"])("moves into the menu rows on %s", (key) => {
		render(
			<AssistReviewMenu
				onPick={vi.fn()}
				onPrompt={vi.fn()}
				onClose={vi.fn()}
			/>,
		);
		fireEvent.keyDown(field(), { key });
		expect(document.activeElement).toBe(screen.getAllByRole("menuitem")[0]);
	});

	it("closes on Escape from the field and from a row", () => {
		const onClose = vi.fn();
		render(
			<AssistReviewMenu
				onPick={vi.fn()}
				onPrompt={vi.fn()}
				onClose={onClose}
			/>,
		);
		fireEvent.keyDown(field(), { key: "Escape" });
		fireEvent.keyDown(screen.getAllByRole("menuitem")[0], { key: "Escape" });
		expect(onClose).toHaveBeenNthCalledWith(1, true);
		expect(onClose).toHaveBeenNthCalledWith(2, true);
	});

	it("stays open when focus moves from the field into the menu", () => {
		const onClose = vi.fn();
		render(
			<AssistReviewMenu
				onPick={vi.fn()}
				onPrompt={vi.fn()}
				onClose={onClose}
			/>,
		);
		fireEvent.blur(field(), {
			relatedTarget: screen.getAllByRole("menuitem")[0],
		});
		expect(onClose).not.toHaveBeenCalled();
	});
});
