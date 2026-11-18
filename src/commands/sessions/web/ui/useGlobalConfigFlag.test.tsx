// @vitest-environment jsdom
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { fetchEntries } from "./App/ConfigView/useConfigEntries/fetchEntries";
import { ApiNodeContext } from "./useApiNode";
import { useGlobalConfigFlag } from "./useGlobalConfigFlag";

vi.mock("./App/ConfigView/useConfigEntries/fetchEntries", () => ({
	fetchEntries: vi.fn(async () => [{ key: "sessions.cardMode", value: true }]),
}));

function onRemoteNode({ children }: { children: ReactNode }) {
	return (
		<ApiNodeContext.Provider value="remote">{children}</ApiNodeContext.Provider>
	);
}

describe("useGlobalConfigFlag", () => {
	it("reads the selected node's config by default", async () => {
		renderHook(() => useGlobalConfigFlag("sessions.cardMode", "/repo"), {
			wrapper: onRemoteNode,
		});

		await waitFor(() =>
			expect(fetchEntries).toHaveBeenLastCalledWith("/repo", "remote"),
		);
	});

	it("reads the local node's config when local only", async () => {
		const { result } = renderHook(
			() => useGlobalConfigFlag("sessions.cardMode", "/repo", true),
			{ wrapper: onRemoteNode },
		);

		await waitFor(() => expect(result.current[0]).toBe(true));
		expect(fetchEntries).toHaveBeenLastCalledWith("/repo", undefined);
	});
});
