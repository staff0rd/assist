// @vitest-environment jsdom
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { saveConfigValue } from "../../../ConfigView/ConfigRowValueCell/saveConfigValue";
import { fetchEntries } from "../../../ConfigView/useConfigEntries/fetchEntries";
import { ApiNodeContext } from "../../../../useApiNode";
import { useAskQuestionAutoApprove } from "./useAskQuestionAutoApprove";

vi.mock("../../../ConfigView/useConfigEntries/fetchEntries", () => ({
	fetchEntries: vi.fn(),
}));
vi.mock("../../../ConfigView/ConfigRowValueCell/saveConfigValue", () => ({
	saveConfigValue: vi.fn(),
}));

const fetchMock = vi.mocked(fetchEntries);
const saveMock = vi.mocked(saveConfigValue);

afterEach(() => {
	cleanup();
	vi.resetAllMocks();
});

function entries(value: unknown) {
	return [{ key: "sessions.askQuestionAutoApprove", value }] as Awaited<
		ReturnType<typeof fetchEntries>
	>;
}

function renderToggle(node?: string) {
	const wrapper = ({ children }: { children: ReactNode }) => (
		<ApiNodeContext.Provider value={node}>{children}</ApiNodeContext.Provider>
	);
	return renderHook(() => useAskQuestionAutoApprove("/repo"), { wrapper });
}

describe("useAskQuestionAutoApprove", () => {
	it("loads the node's current value", async () => {
		fetchMock.mockResolvedValue(entries(true));
		const { result } = renderToggle("laptop");

		await waitFor(() => expect(result.current[0]).toBe(true));
		expect(fetchMock).toHaveBeenCalledWith("/repo", "laptop");
	});

	it("saves changes at node scope for the session's node", async () => {
		fetchMock.mockResolvedValue(entries(false));
		saveMock.mockResolvedValue({});
		const { result } = renderToggle("laptop");
		await waitFor(() => expect(fetchMock).toHaveBeenCalled());

		act(() => result.current[1](true));

		expect(result.current[0]).toBe(true);
		expect(saveMock).toHaveBeenCalledWith(
			{
				key: "sessions.askQuestionAutoApprove",
				value: true,
				cwd: "/repo",
				scope: "global",
			},
			"laptop",
		);
	});

	it("reverts when the save fails", async () => {
		fetchMock.mockResolvedValue(entries(false));
		saveMock.mockResolvedValue({ error: "nope" });
		const { result } = renderToggle();
		await waitFor(() => expect(fetchMock).toHaveBeenCalled());

		act(() => result.current[1](true));

		await waitFor(() => expect(result.current[0]).toBe(false));
	});
});
