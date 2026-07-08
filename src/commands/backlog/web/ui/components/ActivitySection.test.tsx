// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import type { GitRef } from "../types";
import { ActivitySection } from "./ActivitySection";

afterEach(cleanup);

describe("ActivitySection", () => {
	it("renders nothing when there are no refs", () => {
		const { container } = render(<ActivitySection gitRefs={[]} />);

		expect(container.firstChild).toBeNull();
	});

	it("renders branch, commit, and PR with clickable links", () => {
		const refs: GitRef[] = [
			{ kind: "branch", ref: "feature", url: "https://gh/tree/feature" },
			{
				kind: "commit",
				ref: "abcdef1234",
				title: "Do it",
				url: "https://gh/commit/abcdef1234",
			},
			{
				kind: "pr",
				ref: "42",
				title: "My PR",
				state: "OPEN",
				url: "https://gh/pull/42",
			},
		];

		render(<ActivitySection gitRefs={refs} />);

		expect(screen.getByText("Activity")).toBeTruthy();
		expect(
			screen.getByRole("link", { name: "feature" }).getAttribute("href"),
		).toBe("https://gh/tree/feature");
		expect(screen.getByRole("link", { name: "abcdef12 Do it" })).toBeTruthy();
		expect(screen.getByRole("link", { name: "#42 My PR (open)" })).toBeTruthy();
	});

	it("renders gracefully without a link when the branch or PR is gone", () => {
		const refs: GitRef[] = [
			{ kind: "branch", ref: "deleted-branch" },
			{ kind: "pr", ref: "9" },
		];

		render(<ActivitySection gitRefs={refs} />);

		expect(screen.queryByRole("link")).toBeNull();
		expect(screen.getByText("deleted-branch")).toBeTruthy();
		expect(screen.getByText("#9")).toBeTruthy();
	});

	it("orders refs newest-first and caps commits with an overflow indicator", () => {
		const commits: GitRef[] = Array.from({ length: 13 }, (_, i) => ({
			kind: "commit",
			ref: `commit${i}`,
		}));

		render(<ActivitySection gitRefs={commits} />);

		expect(screen.getAllByText(/^commit\d+$/)).toHaveLength(10);
		expect(screen.getByText("commit12")).toBeTruthy();
		expect(screen.queryByText("commit0")).toBeNull();
		expect(screen.getByText("… and 3 more commits")).toBeTruthy();
	});
});
