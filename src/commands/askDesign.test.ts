import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockRequestPreviewDecision = vi.fn();
const mockIsLiveDaemonSession = vi.fn();

vi.mock("./sessions/shared/requestPreviewDecision", () => ({
	requestPreviewDecision: (request: unknown) =>
		mockRequestPreviewDecision(request),
}));

vi.mock("./sessions/shared/isLiveDaemonSession", () => ({
	isLiveDaemonSession: (id: string) => mockIsLiveDaemonSession(id),
}));

import { askDesign } from "./askDesign";

const url = "https://claude.ai/artifact/abc-123";
const comments = [{ quote: "sticky bar", note: "make it collapsible" }];

describe("askDesign", () => {
	let logged: string[];
	let errored: string[];

	beforeEach(() => {
		vi.clearAllMocks();
		logged = [];
		errored = [];
		vi.spyOn(console, "log").mockImplementation((message: string) => {
			logged.push(message);
		});
		vi.spyOn(console, "error").mockImplementation((message: string) => {
			errored.push(message);
		});
		vi.spyOn(process, "exit").mockImplementation(((code?: number) => {
			throw new Error(`process.exit(${code})`);
		}) as never);
		vi.stubEnv("ASSIST_SESSION", "1");
		vi.stubEnv("ASSIST_SESSION_ID", "s1");
		mockIsLiveDaemonSession.mockResolvedValue(true);
	});

	afterEach(() => {
		vi.unstubAllEnvs();
	});

	it.each([
		"https://example.com/artifact/abc",
		"http://claude.ai/artifact/abc",
		"https://claude.ai/chat/abc",
		"not a url",
	])("rejects the non-artifact url %s", async (bad) => {
		await expect(askDesign({ url: bad, title: "Design" })).rejects.toThrow(
			"process.exit(1)",
		);
		expect(errored.join("\n")).toContain("claude.ai artifact link");
		expect(mockRequestPreviewDecision).not.toHaveBeenCalled();
	});

	it("accepts a code artifact url", async () => {
		mockRequestPreviewDecision.mockResolvedValue({ decision: "approve" });

		await askDesign({
			url: "https://claude.ai/code/artifact/6f1e2d3c-aaaa-bbbb-cccc-1234567890ab",
			title: "Design",
		});

		expect(logged).toContain("Approved.");
	});

	it("prints the url and body outside a web session", async () => {
		vi.stubEnv("ASSIST_SESSION", "");

		await askDesign({ url, title: "Design", body: "Summary" });

		expect(logged).toEqual([`Design: ${url}`, "\nSummary"]);
		expect(mockRequestPreviewDecision).not.toHaveBeenCalled();
	});

	it("prints the url when the session is not live in the daemon", async () => {
		mockIsLiveDaemonSession.mockResolvedValue(false);

		await askDesign({ url, title: "Design" });

		expect(logged).toEqual([`Design: ${url}`]);
		expect(mockRequestPreviewDecision).not.toHaveBeenCalled();
	});

	it("requests a design preview with the artifact link and prints comments on approve", async () => {
		mockRequestPreviewDecision.mockResolvedValue({
			decision: "approve",
			comments,
		});

		await askDesign({ url, title: "Inbox", body: "Summary" });

		expect(mockRequestPreviewDecision).toHaveBeenCalledWith(
			expect.objectContaining({
				sessionId: "s1",
				title: "Inbox",
				body: "Summary",
				kind: "design",
				metadata: [{ label: "Design", value: url, url }],
			}),
		);
		const out = logged.join("\n");
		expect(out).toContain("Approved.");
		expect(out).toContain("  > sticky bar\n   Comment: make it collapsible");
	});

	it("falls back to a default body when none is given", async () => {
		mockRequestPreviewDecision.mockResolvedValue({ decision: "approve" });

		await askDesign({ url, title: "Inbox" });

		expect(mockRequestPreviewDecision).toHaveBeenCalledWith(
			expect.objectContaining({
				body: expect.stringContaining("Open the design"),
			}),
		);
	});

	it("exits 0 as superseded when a newer review replaces it", async () => {
		mockRequestPreviewDecision.mockResolvedValue("superseded");

		await expect(askDesign({ url, title: "Inbox" })).rejects.toThrow(
			"process.exit(0)",
		);
		expect(logged).not.toContain("Approved.");
	});

	it("exits non-zero with the reason and comments on reject", async () => {
		mockRequestPreviewDecision.mockResolvedValue({
			decision: "reject",
			reason: "too busy",
			comments,
		});

		await expect(askDesign({ url, title: "Inbox" })).rejects.toThrow(
			"process.exit(1)",
		);

		const err = errored.join("\n");
		expect(err).toContain("Inbox rejected: too busy");
		expect(err).toContain("Comment: make it collapsible");
		expect(err).toContain("re-run `assist ask-design`");
	});
});
