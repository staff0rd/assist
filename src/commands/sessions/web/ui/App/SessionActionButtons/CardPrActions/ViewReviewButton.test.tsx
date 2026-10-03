// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { makeSessionInfo } from "../../../../../../../test/mothers/makeSessionInfo";
import { LabelledActionsContext } from "../../useLabelledActionsContext";
import { ViewReviewButton } from "./ViewReviewButton";

afterEach(() => {
	cleanup();
	vi.unstubAllGlobals();
});

const session = makeSessionInfo({
	commandType: "assist",
	assistArgs: ["review-pr-comments", "12"],
	cwd: "/git/repo",
});

function stubFetch(response: () => Promise<unknown>) {
	const fetch = vi.fn(response);
	vi.stubGlobal("fetch", fetch);
	return fetch;
}

function stubReady() {
	return stubFetch(async () => ({
		ok: true,
		status: 200,
		json: async () => ({ synthesis: "## findings" }),
	}));
}

function renderButton(labelled: boolean) {
	render(
		<LabelledActionsContext.Provider value={labelled}>
			<ViewReviewButton session={session} />
		</LabelledActionsContext.Provider>,
	);
}

describe("ViewReviewButton", () => {
	it("shows the Findings label when actions are labelled", async () => {
		stubReady();
		renderButton(true);

		expect(
			await screen.findByRole("button", { name: "View review findings" }),
		).toBeTruthy();
		expect(screen.getByText("Findings")).toBeTruthy();
	});

	it("collapses to icon-only when actions collapse", async () => {
		stubReady();
		renderButton(false);

		expect(
			await screen.findByRole("button", { name: "View review findings" }),
		).toBeTruthy();
		expect(screen.queryByText("Findings")).toBeNull();
	});

	it("renders nothing while the synthesis is still loading", async () => {
		const fetch = stubFetch(() => new Promise(() => {}));
		const { container } = render(<ViewReviewButton session={session} />);

		await waitFor(() => expect(fetch).toHaveBeenCalled());
		expect(container.innerHTML).toBe("");
	});

	it("renders nothing when no synthesis exists", async () => {
		const fetch = stubFetch(async () => ({ ok: false, status: 404 }));
		const { container } = render(<ViewReviewButton session={session} />);

		await waitFor(() => expect(fetch).toHaveBeenCalled());
		await waitFor(() => expect(container.innerHTML).toBe(""));
	});

	it("renders nothing when the synthesis fetch errors", async () => {
		const fetch = stubFetch(async () => {
			throw new Error("offline");
		});
		const { container } = render(<ViewReviewButton session={session} />);

		await waitFor(() => expect(fetch).toHaveBeenCalled());
		await waitFor(() => expect(container.innerHTML).toBe(""));
	});
});
