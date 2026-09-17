import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { printPrsStatus } from "./printPrsStatus";
import type { PrStatus } from "./types";

let output: string[] = [];
let log: ReturnType<typeof vi.spyOn>;

function printed(): string {
	return output.join("\n");
}

function prStatus(overrides: Partial<PrStatus> = {}): PrStatus {
	return {
		number: 12,
		title: "Add a thing",
		url: "https://github.com/org/foo/pull/12",
		author: "alice",
		isBot: false,
		isDraft: false,
		createdAt: "2026-09-10T09:00:00Z",
		updatedAt: "2026-09-16T12:00:00Z",
		age: "2d",
		ageHours: 48,
		reviewDecision: null,
		reviews: [],
		checks: { failing: [], pending: [] },
		mergeable: "MERGEABLE",
		...overrides,
	};
}

beforeEach(() => {
	output = [];
	log = vi
		.spyOn(console, "log")
		.mockImplementation((message?: unknown) => output.push(String(message)));
});

afterEach(() => {
	log.mockRestore();
});

describe("printPrsStatus", () => {
	it("heads each repo with its open count and lists its pull requests", () => {
		printPrsStatus({
			repos: [
				{ repo: "org/foo", pullRequests: [prStatus()] },
				{ repo: "org/bar", pullRequests: [] },
			],
			errors: [],
		});

		expect(printed()).toContain("org/foo");
		expect(printed()).toContain("(1 open)");
		expect(printed()).toContain("#12 Add a thing");
		expect(printed()).toContain("(alice, updated 2d ago)");
		expect(printed()).toContain("https://github.com/org/foo/pull/12");
		expect(printed()).toContain("no open pull requests");
	});

	it("marks drafts and bot authors", () => {
		printPrsStatus({
			repos: [
				{
					repo: "org/foo",
					pullRequests: [prStatus({ isDraft: true, isBot: true })],
				},
			],
			errors: [],
		});

		expect(printed()).toContain("[draft, bot]");
	});

	it("reports the review decision, reviewers, checks and conflicts", () => {
		printPrsStatus({
			repos: [
				{
					repo: "org/foo",
					pullRequests: [
						prStatus({
							reviewDecision: "CHANGES_REQUESTED",
							reviews: [{ reviewer: "bob", state: "CHANGES_REQUESTED" }],
							checks: { failing: ["lint"], pending: ["e2e"] },
							mergeable: "CONFLICTING",
						}),
					],
				},
			],
			errors: [],
		});

		expect(printed()).toContain(
			"review: CHANGES_REQUESTED | bob: CHANGES_REQUESTED",
		);
		expect(printed()).toContain("failing: lint");
		expect(printed()).toContain("pending: e2e");
		expect(printed()).toContain("conflicting");
	});

	it("reports an unknown mergeable state and an unknown age", () => {
		printPrsStatus({
			repos: [
				{
					repo: "org/foo",
					pullRequests: [
						prStatus({ mergeable: "UNKNOWN", age: "unknown", ageHours: null }),
					],
				},
			],
			errors: [],
		});

		expect(printed()).toContain("mergeable: unknown");
		expect(printed()).toContain("updated unknown");
	});

	describe("when a repo could not be read", () => {
		it("lists it under errors beside the repos that succeeded", () => {
			printPrsStatus({
				repos: [{ repo: "org/foo", pullRequests: [prStatus()] }],
				errors: [{ repo: "org/gone", error: "HTTP 404" }],
			});

			expect(printed()).toContain("Errors");
			expect(printed()).toContain("org/gone");
			expect(printed()).toContain("HTTP 404");
		});

		it("prints no error section when every repo was read", () => {
			printPrsStatus({
				repos: [{ repo: "org/foo", pullRequests: [prStatus()] }],
				errors: [],
			});

			expect(printed()).not.toContain("Errors");
		});
	});
});
