import { beforeEach, describe, expect, it, vi } from "vitest";

const mockReadDistVersion = vi.fn<() => string | undefined>();
const mockReadBuiltVersion = vi.fn<() => string>();

vi.mock("./readDistVersion", () => ({
	readDistVersion: () => mockReadDistVersion(),
}));

vi.mock("./readBuiltVersion", () => ({
	readBuiltVersion: () => mockReadBuiltVersion(),
}));

import { isDistBehind } from "./isDistBehind";

beforeEach(() => {
	mockReadBuiltVersion.mockReturnValue("0.1058.2");
});

describe("isDistBehind", () => {
	it("is behind when dist was built from an older package.json", () => {
		mockReadDistVersion.mockReturnValue("0.1058.1");
		expect(isDistBehind()).toBe(true);
	});

	it("is not behind when dist matches package.json", () => {
		mockReadDistVersion.mockReturnValue("0.1058.2");
		expect(isDistBehind()).toBe(false);
	});

	it("is not behind when dist carries no version stamp", () => {
		mockReadDistVersion.mockReturnValue(undefined);
		expect(isDistBehind()).toBe(false);
	});
});
