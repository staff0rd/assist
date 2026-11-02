import { afterEach, describe, expect, it, vi } from "vitest";
import { findAzureDevopsClone } from "./findAzureDevopsClone";
import { planGithubReview } from "./planGithubReview";
import { planPrReview } from "./planPrReview";

vi.mock("./findAzureDevopsClone", () => ({ findAzureDevopsClone: vi.fn() }));
vi.mock("./planGithubReview", () => ({ planGithubReview: vi.fn() }));

const mockFind = vi.mocked(findAzureDevopsClone);
const URL = "https://dev.azure.com/acme/proj/_git/site/pullrequest/42";
const CHECKOUT = ["review", "--checkout-only"];

afterEach(() => vi.clearAllMocks());

describe("planPrReview", () => {
	it("checks an Azure DevOps PR out in its clone", () => {
		mockFind.mockReturnValue("/base/site");
		expect(planPrReview({ url: URL, args: CHECKOUT }, "/base")).toEqual({
			ok: true,
			cwd: "/base/site",
			assistArgs: ["review", "--checkout-only", "42"],
		});
		expect(mockFind).toHaveBeenCalledWith(
			expect.objectContaining({ org: "acme", project: "proj", repo: "site" }),
			"/base",
		);
	});

	it.each([["review-pr-comments"], ["review-pr-comments", "--auto"]])(
		"passes Address Comments args %j through with the PR id",
		(...args) => {
			mockFind.mockReturnValue("/base/site");
			expect(planPrReview({ url: URL, args }, "/base")).toMatchObject({
				ok: true,
				assistArgs: [...args, "42"],
			});
		},
	);

	it.each([
		[["review"]],
		[["fix-conflict"]],
		[["review-pr-comments", "-x"]],
		[["review-pr-comments", "--batch"]],
	])("rejects args Azure DevOps does not support: %j", (args) => {
		expect(planPrReview({ url: URL, args }, "/base")).toMatchObject({
			ok: false,
			status: 400,
		});
		expect(mockFind).not.toHaveBeenCalled();
	});

	it("reports 404 when no clone has the PR's remote", () => {
		mockFind.mockReturnValue(undefined);
		expect(planPrReview({ url: URL, args: CHECKOUT }, "/base")).toEqual({
			ok: false,
			status: 404,
			error:
				"acme/proj/site is not cloned under /base; clone https://dev.azure.com/acme/proj/_git/site there and retry",
		});
	});

	it.each([
		["https://dev.azure.com/acme/proj/_git/site/pullrequests"],
		["https://acme.visualstudio.com/proj/_git/site"],
	])("reports 400 for an Azure DevOps URL that is not a PR: %s", (url) => {
		expect(planPrReview({ url, args: CHECKOUT }, "/base")).toMatchObject({
			ok: false,
			status: 400,
			error: expect.stringContaining(`Not an Azure DevOps PR URL: ${url}`),
		});
		expect(planGithubReview).not.toHaveBeenCalled();
	});

	it("hands GitHub URLs to planGithubReview", () => {
		const body = { url: "https://github.com/o/r/pull/1", args: CHECKOUT };
		planPrReview(body, "/base");
		expect(planGithubReview).toHaveBeenCalledWith(body, "/base");
	});
});
