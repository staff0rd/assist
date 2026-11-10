import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import type { IncomingMessage, ServerResponse } from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, afterEach, describe, expect, it, vi } from "vitest";

const root = join(tmpdir(), "assist-new-session-defaults-test");
const globalConfig = join(root, ".assist.yml");
const apm = join(root, "apm");
const other = join(root, "other");

const mockRespondJson = vi.fn();

vi.mock("../../../shared/web", () => ({
	respondJson: (...args: unknown[]) => mockRespondJson(...args),
}));

vi.mock("node:os", async (importOriginal) => {
	const actual = (await importOriginal()) as Record<string, unknown>;
	return { ...actual, homedir: () => root };
});

vi.mock("../../backlog/getCachedOrigin", () => ({
	getCachedOrigin: (cwd: string) =>
		cwd === apm ? "github.com/org/apm" : "github.com/org/other",
}));

import { newSessionDefaults } from "./newSessionDefaults";

mkdirSync(apm, { recursive: true });
mkdirSync(other, { recursive: true });

afterEach(() => rmSync(globalConfig, { force: true }));
afterAll(() => rmSync(root, { recursive: true, force: true }));

function modeFor(cwd: string): unknown {
	const req = {
		url: `/api/new-session-defaults?cwd=${encodeURIComponent(cwd)}`,
	};
	newSessionDefaults(req as IncomingMessage, {} as ServerResponse);
	return mockRespondJson.mock.lastCall?.[2];
}

describe("newSessionDefaults", () => {
	it("applies the selected repo's override", () => {
		writeFileSync(
			globalConfig,
			"sessions:\n  newSessionMode: bug\nrepos:\n  apm:\n    sessions:\n      newSessionMode: prompt\n",
		);

		expect(modeFor(apm)).toMatchObject({ mode: "prompt" });
		expect(modeFor(other)).toMatchObject({ mode: "bug" });
	});

	it("falls back to draft when nothing is set", () => {
		expect(modeFor(other)).toMatchObject({ mode: "draft" });
	});

	it("still resolves the mode when an unrelated nested key is unknown", () => {
		writeFileSync(
			globalConfig,
			"review:\n  highLevel:\n    futureKey: true\nsessions:\n  newSessionMode: bug\n",
		);

		expect(modeFor(other)).toMatchObject({ mode: "bug" });
	});

	it("falls back to draft beside an unknown key when the mode is unset", () => {
		writeFileSync(globalConfig, "review:\n  highLevel:\n    futureKey: true\n");

		expect(modeFor(other)).toMatchObject({ mode: "draft" });
	});

	it("names the key when the mode itself is invalid", () => {
		writeFileSync(globalConfig, "sessions:\n  newSessionMode: nope\n");

		expect(modeFor(other)).toEqual({
			error: expect.stringContaining("sessions.newSessionMode"),
		});
		expect(mockRespondJson.mock.lastCall?.[1]).toBe(422);
	});

	it("resolves each dialog type's harness, falling back to harness.engine", () => {
		writeFileSync(
			globalConfig,
			"harness:\n  engine: codex\n  defaults:\n    bug:\n      harness: pi\n    run:\n      harness: claude\n",
		);

		expect(modeFor(other)).toEqual({
			mode: "draft",
			harnesses: {
				draft: "codex",
				bug: "pi",
				prompt: "codex",
				design: "codex",
			},
			models: {},
		});
	});

	it("returns each dialog type's configured model", () => {
		writeFileSync(
			globalConfig,
			"harness:\n  defaults:\n    draft:\n      model: fable\n    prompt:\n      model: opus\n    run:\n      model: sonnet\n",
		);

		expect(modeFor(other)).toMatchObject({
			models: { draft: "fable", prompt: "opus" },
		});
	});

	it("names the key when a type's model is invalid", () => {
		writeFileSync(
			globalConfig,
			"harness:\n  defaults:\n    design:\n      model: 3\n",
		);

		expect(modeFor(other)).toEqual({
			error: expect.stringContaining("harness.defaults.design.model"),
		});
	});

	it("applies the selected repo's harness override", () => {
		writeFileSync(
			globalConfig,
			"repos:\n  apm:\n    harness:\n      defaults:\n        design:\n          harness: codex\n",
		);

		expect(modeFor(apm)).toMatchObject({
			harnesses: { draft: "claude", design: "codex" },
		});
		expect(modeFor(other)).toMatchObject({
			harnesses: { design: "claude" },
		});
	});

	it("names the key when a type's harness is invalid", () => {
		writeFileSync(
			globalConfig,
			"harness:\n  defaults:\n    prompt:\n      harness: gpt\n",
		);

		expect(modeFor(other)).toEqual({
			error: expect.stringContaining("harness.defaults.prompt.harness"),
		});
		expect(mockRespondJson.mock.lastCall?.[1]).toBe(422);
	});
});
