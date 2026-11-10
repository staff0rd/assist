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
