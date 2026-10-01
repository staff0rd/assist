import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockRequestPreviewDecision = vi.fn();

vi.mock("./sessions/shared/requestPreviewDecision", () => ({
	requestPreviewDecision: (request: unknown) =>
		mockRequestPreviewDecision(request),
}));

import { ask } from "./ask";

const comments = [
	{ quote: "line one\nline two", note: "tighten this" },
	{ quote: "step 3", note: "drop it" },
];

describe("ask", () => {
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
	});

	afterEach(() => {
		vi.unstubAllEnvs();
	});

	it("prints the body and returns outside a web session", async () => {
		vi.stubEnv("ASSIST_SESSION", "");

		await ask({ title: "Plan", body: "# Plan" });

		expect(logged).toEqual(["# Plan"]);
		expect(mockRequestPreviewDecision).not.toHaveBeenCalled();
	});

	it("errors on an empty body", async () => {
		await expect(ask({ title: "Plan", body: "  " })).rejects.toThrow(
			"process.exit(1)",
		);
		expect(errored.join("\n")).toContain("--body is empty");
	});

	it("requests an ask preview and prints comments on approve", async () => {
		mockRequestPreviewDecision.mockResolvedValue({
			decision: "approve",
			comments,
		});

		await ask({ title: "Plan", body: "# Plan" });

		expect(mockRequestPreviewDecision).toHaveBeenCalledWith(
			expect.objectContaining({
				sessionId: "s1",
				title: "Plan",
				body: "# Plan",
				kind: "ask",
			}),
		);
		const out = logged.join("\n");
		expect(out).toContain("Approved.");
		expect(out).toContain(
			"  > line one\n  > line two\n   Comment: tighten this",
		);
		expect(out).toContain("  > step 3\n   Comment: drop it");
	});

	it("exits non-zero with the reason and every comment on reject", async () => {
		mockRequestPreviewDecision.mockResolvedValue({
			decision: "reject",
			reason: "wrong approach",
			comments,
		});

		await expect(ask({ title: "Plan", body: "# Plan" })).rejects.toThrow(
			"process.exit(1)",
		);

		const err = errored.join("\n");
		expect(err).toContain("Plan rejected: wrong approach");
		expect(err).toContain(
			"  > line one\n  > line two\n   Comment: tighten this",
		);
		expect(err).toContain("  > step 3\n   Comment: drop it");
		expect(err).toContain("re-run `assist ask`");
		expect(logged).not.toContain("Approved.");
	});
});
