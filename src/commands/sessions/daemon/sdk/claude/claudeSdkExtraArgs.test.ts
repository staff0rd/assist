import { beforeEach, describe, expect, it, vi } from "vitest";
import { loadConfigFrom } from "../../../../../shared/loadConfigFrom";
import { daemonLog } from "../../daemonLog";
import { claudeSdkExtraArgs } from "./claudeSdkExtraArgs";

vi.mock("../../../../../shared/loadConfigFrom", () => ({
	loadConfigFrom: vi.fn(),
}));
vi.mock("../../daemonLog", () => ({ daemonLog: vi.fn() }));

function withChrome(claudeSdkChrome: boolean | undefined) {
	vi.mocked(loadConfigFrom).mockReturnValue({
		harness: { claudeSdkChrome },
	} as unknown as ReturnType<typeof loadConfigFrom>);
}

describe("claudeSdkExtraArgs", () => {
	beforeEach(() => vi.clearAllMocks());

	it("passes --chrome when the key is unset", () => {
		withChrome(undefined);
		expect(claudeSdkExtraArgs("/repo", "s1")).toEqual({ chrome: null });
		expect(daemonLog).toHaveBeenCalledWith(
			"claude-sdk s1: Claude in Chrome on (--chrome)",
		);
	});

	it("passes --chrome when the key is true", () => {
		withChrome(true);
		expect(claudeSdkExtraArgs("/repo", "s1")).toEqual({ chrome: null });
	});

	it("passes no extra args when the key is false", () => {
		withChrome(false);
		expect(claudeSdkExtraArgs("/repo", "s1")).toEqual({});
		expect(daemonLog).toHaveBeenCalledWith(
			"claude-sdk s1: Claude in Chrome off",
		);
	});
});
