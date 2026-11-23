// @vitest-environment jsdom
import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { apiFetch } from "../../../../apiFetch";
import { useCwdConfigured } from "./useCwdConfigured";

let configured = false;

vi.mock("../../../../apiFetch", () => ({
	apiFetch: vi.fn(async () => ({
		ok: true,
		json: async () => ({ configured }),
	})),
}));

afterEach(() => {
	configured = false;
	vi.clearAllMocks();
});

describe("useCwdConfigured", () => {
	it("picks up config set after the page loaded when the window regains focus", async () => {
		const { result } = renderHook(() =>
			useCwdConfigured("/api/autopilot/configured", "/repo"),
		);
		await waitFor(() => expect(result.current).toBe(false));

		configured = true;
		act(() => {
			globalThis.dispatchEvent(new Event("focus"));
		});

		await waitFor(() => expect(result.current).toBe(true));
		expect(apiFetch).toHaveBeenCalledTimes(2);
	});
});
