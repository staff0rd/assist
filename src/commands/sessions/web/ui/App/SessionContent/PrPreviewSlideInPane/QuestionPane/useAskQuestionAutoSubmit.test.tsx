// @vitest-environment jsdom
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { saveConfigValue } from "../../../ConfigView/ConfigRowValueCell/saveConfigValue";
import { fetchEntries } from "../../../ConfigView/useConfigEntries/fetchEntries";
import { ApiNodeContext } from "../../../../useApiNode";
import { useAskQuestionAutoSubmit } from "./useAskQuestionAutoSubmit";

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
	return [{ key: "sessions.askQuestionAutoSubmit", value }] as Awaited<
		ReturnType<typeof fetchEntries>
	>;
}

function renderToggle(node?: string) {
	const wrapper = ({ children }: { children: ReactNode }) => (
		<ApiNodeContext.Provider value={node}>{children}</ApiNodeContext.Provider>
	);
	return renderHook(() => useAskQuestionAutoSubmit("/repo"), { wrapper });
}

describe("useAskQuestionAutoSubmit", () => {
	it("loads the node's current value", async () => {
		fetchMock.mockResolvedValue(entries(true));
		const { result } = renderToggle("laptop");

		await waitFor(() => expect(result.current.enabled).toBe(true));
		expect(fetchMock).toHaveBeenCalledWith("/repo", "laptop");
	});

	it("saves changes at node scope for the session's node", async () => {
		fetchMock.mockResolvedValue(entries(false));
		saveMock.mockResolvedValue({});
		const { result } = renderToggle("laptop");
		await waitFor(() => expect(fetchMock).toHaveBeenCalled());

		act(() => result.current.setEnabled(true));

		expect(result.current.enabled).toBe(true);
		expect(saveMock).toHaveBeenCalledWith(
			{
				key: "sessions.askQuestionAutoSubmit",
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

		act(() => result.current.setEnabled(true));

		await waitFor(() => expect(result.current.enabled).toBe(false));
	});

	it("holds a pick made before the flag loads until it arrives", async () => {
		let resolve: (value: ReturnType<typeof entries>) => void = () => {};
		fetchMock.mockReturnValue(
			new Promise((r) => {
				resolve = r;
			}),
		);
		const { result } = renderToggle();
		const run = vi.fn();

		act(() => result.current.whenLoaded(run));
		expect(run).not.toHaveBeenCalled();

		await act(async () => resolve(entries(true)));

		expect(run).toHaveBeenCalledExactlyOnceWith(true);
	});

	it("drops a held pick when cancelled", async () => {
		let resolve: (value: ReturnType<typeof entries>) => void = () => {};
		fetchMock.mockReturnValue(
			new Promise((r) => {
				resolve = r;
			}),
		);
		const { result } = renderToggle();
		const run = vi.fn();

		act(() => {
			result.current.whenLoaded(run);
			result.current.cancel();
		});
		await act(async () => resolve(entries(true)));

		expect(run).not.toHaveBeenCalled();
	});

	it("still runs a held pick with auto submit off when the load fails", async () => {
		fetchMock.mockRejectedValue(new Error("down"));
		const { result } = renderToggle();
		const run = vi.fn();

		act(() => result.current.whenLoaded(run));

		await waitFor(() => expect(run).toHaveBeenCalledExactlyOnceWith(false));
	});
});
