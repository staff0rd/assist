// @vitest-environment jsdom
import { cleanup, render } from "@testing-library/react";
import { useEffect } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TranscriptArea } from "./TranscriptArea";
import type { Transcript } from "../../../types";
import {
	HistorySearchQueryProvider,
	useHistorySearchQuery,
} from "../../useHistorySearchQuery";

const scrollIntoView = vi.fn();

beforeEach(() => {
	Element.prototype.scrollIntoView = scrollIntoView;
});

afterEach(() => {
	cleanup();
	scrollIntoView.mockReset();
});

const transcript: Transcript = {
	sessionId: "sid",
	messages: [
		{ role: "user", text: "find the Needle" },
		{ role: "tool", tool: "Read", target: "needle.ts" },
		{ role: "assistant", text: "a needle and another NEEDLE" },
	],
};

function SearchState({ query, viewed }: { query: string; viewed: string }) {
	const { setQuery, setViewedTerm } = useHistorySearchQuery();
	useEffect(() => {
		setQuery(query);
		setViewedTerm(viewed);
	}, [query, viewed, setQuery, setViewedTerm]);
	return null;
}

function renderArea(query: string, viewed: string) {
	return render(
		<HistorySearchQueryProvider>
			<SearchState query={query} viewed={viewed} />
			<TranscriptArea sessionId="sid" transcript={transcript} />
		</HistorySearchQueryProvider>,
	);
}

const marks = () =>
	[...document.querySelectorAll("mark")].map((m) => m.textContent);

describe("TranscriptArea", () => {
	it("highlights every match in user and assistant text", () => {
		renderArea("needle", "needle");

		expect(marks()).toEqual(["Needle", "needle", "NEEDLE"]);
	});

	it("scrolls the first match into view", () => {
		renderArea("needle", "needle");

		expect(scrollIntoView).toHaveBeenCalled();
		expect(scrollIntoView.mock.contexts[0]).toBe(
			document.querySelector("mark"),
		);
	});

	it("does not highlight a transcript opened without a search", () => {
		renderArea("needle", "");

		expect(marks()).toEqual([]);
		expect(scrollIntoView).not.toHaveBeenCalled();
	});

	it("drops the highlight once the search is cleared", () => {
		renderArea("", "needle");

		expect(marks()).toEqual([]);
	});
});

describe("TranscriptArea markdown", () => {
	it("renders assistant markdown when not searching", () => {
		const { container } = render(
			<HistorySearchQueryProvider>
				<TranscriptArea
					sessionId="sid"
					transcript={{
						sessionId: "sid",
						messages: [
							{ role: "assistant", text: "**Not across the board.**" },
						],
					}}
				/>
			</HistorySearchQueryProvider>,
		);
		expect(container.querySelector("strong")?.textContent).toBe(
			"Not across the board.",
		);
	});
});
