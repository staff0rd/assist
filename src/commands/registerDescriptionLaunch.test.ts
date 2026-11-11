import { Command } from "commander";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { draftFeature } from "../shared/harnessAdapters/harnessFeatures";

vi.mock("./backlog/launchMode", () => ({
	launchMode: vi.fn(),
}));

vi.mock("./backlog/resolveHarness", () => ({
	resolveHarness: vi.fn((value?: string) => value ?? "codex"),
}));

vi.mock("./backlog/resolveModel", () => ({
	resolveModel: vi.fn((value?: string | false) => value || undefined),
}));

import { launchMode } from "./backlog/launchMode";
import { resolveModel } from "./backlog/resolveModel";
import { resolveHarness } from "./backlog/resolveHarness";
import { registerDescriptionLaunch } from "./registerDescriptionLaunch";

async function parse(name: "draft" | "bug", args: string[]): Promise<void> {
	const program = new Command();
	registerDescriptionLaunch(program, name, name, "", draftFeature, "");
	await program.parseAsync(["node", "assist", name, ...args]);
}

describe("registerDescriptionLaunch", () => {
	beforeEach(() => vi.clearAllMocks());

	it.each(["draft", "bug"] as const)(
		"resolves the %s type's default harness when --harness is omitted",
		async (name) => {
			await parse(name, ["a thing"]);

			expect(resolveHarness).toHaveBeenCalledWith(undefined, name);
			expect(launchMode).toHaveBeenCalledWith(
				name,
				expect.objectContaining({ harness: "codex", description: "a thing" }),
			);
		},
	);

	it("passes an explicit --harness through", async () => {
		await parse("draft", ["--harness", "pi"]);

		expect(resolveHarness).toHaveBeenCalledWith("pi", "draft");
		expect(launchMode).toHaveBeenCalledWith(
			"draft",
			expect.objectContaining({ harness: "pi" }),
		);
	});

	it("resolves the type's model for the resolved harness", async () => {
		await parse("bug", ["--model", "opus"]);

		expect(resolveModel).toHaveBeenCalledWith("opus", "bug", "codex");
		expect(launchMode).toHaveBeenCalledWith(
			"bug",
			expect.objectContaining({ model: "opus" }),
		);
	});

	it("passes --no-model through as no model", async () => {
		await parse("draft", ["--no-model"]);

		expect(resolveModel).toHaveBeenCalledWith(false, "draft", "codex");
	});

	it("leaves the model unset when neither flag is given", async () => {
		await parse("draft", []);

		expect(resolveModel).toHaveBeenCalledWith(undefined, "draft", "codex");
	});
});
