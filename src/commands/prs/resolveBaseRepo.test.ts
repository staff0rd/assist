import { beforeEach, describe, expect, it, vi } from "vitest";
import { loadConfig } from "../../shared/loadConfig";
import type * as loadConfigMockModule from "../../test/mocks/loadConfigMock";
import { makeAssistConfig } from "../../test/mothers/makeAssistConfig";

const mockGetPreferredRemoteRepo = vi.fn();
vi.mock("./getPreferredRemoteRepo", () => ({
	getPreferredRemoteRepo: () => mockGetPreferredRemoteRepo(),
}));

const mockFindForkParent = vi.fn();
vi.mock("./findForkParent", () => ({
	findForkParent: (...args: unknown[]) => mockFindForkParent(...args),
}));

const mockLoadConfig = vi.mocked(loadConfig);
vi.mock("../../shared/loadConfig", async () =>
	(
		await vi.importActual<typeof loadConfigMockModule>(
			"../../test/mocks/loadConfigMock",
		)
	).loadConfigMock(),
);

import { resolveBaseRepo } from "./resolveBaseRepo";

const ORIGIN = { org: "Turtlator", repo: "assist" };
const PARENT = { org: "staff0rd", repo: "assist" };

function pin(baseRepo: "auto" | "origin" | "parent") {
	mockLoadConfig.mockReturnValue(makeAssistConfig({ prs: { baseRepo } }));
}

beforeEach(() => {
	vi.clearAllMocks();
	mockGetPreferredRemoteRepo.mockReturnValue(ORIGIN);
	mockFindForkParent.mockReturnValue(PARENT);
	mockLoadConfig.mockReturnValue(makeAssistConfig());
});

describe("resolveBaseRepo", () => {
	describe("with the default auto mode", () => {
		it("should target the parent when origin is a fork", () => {
			expect(resolveBaseRepo()).toEqual({
				base: PARENT,
				origin: ORIGIN,
				mode: "auto",
			});
		});

		it("should target origin when origin is not a fork", () => {
			mockFindForkParent.mockReturnValue("not-a-fork");

			expect(resolveBaseRepo()?.base).toEqual(ORIGIN);
		});

		it("should fall back to origin when the fork lookup fails", () => {
			mockFindForkParent.mockReturnValue("lookup-failed");

			expect(resolveBaseRepo()?.base).toEqual(ORIGIN);
		});
	});

	describe("when prs.baseRepo pins origin", () => {
		it("should target origin without looking up the parent", () => {
			pin("origin");

			expect(resolveBaseRepo()).toEqual({
				base: ORIGIN,
				origin: ORIGIN,
				mode: "origin",
			});
			expect(mockFindForkParent).not.toHaveBeenCalled();
		});
	});

	describe("when prs.baseRepo pins parent", () => {
		beforeEach(() => pin("parent"));

		it("should target the parent", () => {
			expect(resolveBaseRepo()?.base).toEqual(PARENT);
		});

		it("should throw when origin is not a fork", () => {
			mockFindForkParent.mockReturnValue("not-a-fork");

			expect(() => resolveBaseRepo()).toThrow("Turtlator/assist is not a fork");
		});

		it("should throw when the fork lookup fails", () => {
			mockFindForkParent.mockReturnValue("lookup-failed");

			expect(() => resolveBaseRepo()).toThrow("Could not look up the parent");
		});
	});

	describe("with an override", () => {
		it("should target origin over a config pinned to parent", () => {
			pin("parent");

			expect(resolveBaseRepo("origin")?.base).toEqual(ORIGIN);
		});

		it("should target the parent over a config pinned to origin", () => {
			pin("origin");

			expect(resolveBaseRepo("parent")?.base).toEqual(PARENT);
		});
	});

	describe("when no GitHub remote resolves", () => {
		it("should return null", () => {
			mockGetPreferredRemoteRepo.mockReturnValue(null);

			expect(resolveBaseRepo()).toBeNull();
			expect(mockFindForkParent).not.toHaveBeenCalled();
		});
	});
});
