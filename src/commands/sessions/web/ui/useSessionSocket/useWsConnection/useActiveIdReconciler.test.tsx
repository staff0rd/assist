// @vitest-environment jsdom
import { act, render, renderHook, screen } from "@testing-library/react";
import { useState } from "react";
import { MemoryRouter, useNavigate } from "react-router";
import { describe, expect, it } from "vitest";
import { resolveActiveId } from "./resolveActiveId";
import type { SessionInfo } from "../../types";
import { useActiveIdReconciler } from "./useActiveIdReconciler";
import { makeSessionInfo } from "../../../../../../test/mothers/makeSessionInfo";

function renderReconciler(
	route: string,
	initial: { sessions: SessionInfo[]; daemonActiveId: string | null },
) {
	return renderHook(
		({ sessions, daemonActiveId }) => {
			const [activeId, setActiveId] = useState<string | null>(null);
			useActiveIdReconciler(sessions, setActiveId, daemonActiveId);
			return activeId;
		},
		{
			initialProps: initial,
			wrapper: ({ children }) => (
				<MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
			),
		},
	);
}

describe("useActiveIdReconciler", () => {
	it("keeps activeId null on /backlog after a dismiss removes a card", () => {
		const { result, rerender } = renderReconciler("/backlog", {
			sessions: [
				makeSessionInfo({ id: "a", cwd: "/repo" }),
				makeSessionInfo({ id: "b", cwd: "/repo" }),
				makeSessionInfo({ id: "c", cwd: "/repo" }),
			],
			daemonActiveId: "b",
		});
		expect(result.current).toBeNull();

		rerender({
			sessions: [
				makeSessionInfo({ id: "b", cwd: "/repo" }),
				makeSessionInfo({ id: "c", cwd: "/repo" }),
			],
			daemonActiveId: "b",
		});

		expect(result.current).toBeNull();
	});

	it("keeps activeId null on /usage", () => {
		const { result } = renderReconciler("/usage", {
			sessions: [
				makeSessionInfo({ id: "a", cwd: "/repo" }),
				makeSessionInfo({ id: "b", cwd: "/repo" }),
				makeSessionInfo({ id: "c", cwd: "/repo" }),
			],
			daemonActiveId: "b",
		});
		expect(result.current).toBeNull();
	});

	it("auto-selects the top card after a dismiss on the sessions route", () => {
		const { result, rerender } = renderReconciler("/sessions", {
			sessions: [
				makeSessionInfo({ id: "a", cwd: "/repo" }),
				makeSessionInfo({ id: "b", cwd: "/repo" }),
				makeSessionInfo({ id: "c", cwd: "/repo" }),
			],
			daemonActiveId: null,
		});
		expect(result.current).toBe("a");

		rerender({
			sessions: [
				makeSessionInfo({ id: "b", cwd: "/repo" }),
				makeSessionInfo({ id: "c", cwd: "/repo" }),
			],
			daemonActiveId: null,
		});

		expect(result.current).toBe("b");
	});
});

let dismiss: () => void = () => {};
let goBacklog: () => void = () => {};

function Harness() {
	const [sessions, setSessions] = useState<SessionInfo[]>([
		makeSessionInfo({ id: "a", cwd: "/repo" }),
		makeSessionInfo({ id: "b", cwd: "/repo" }),
		makeSessionInfo({ id: "c", cwd: "/repo" }),
	]);
	const [activeId, setActiveId] = useState<string | null>(null);
	const navigate = useNavigate();
	const daemonActiveId = resolveActiveId({ "/repo": "a" }, sessions);
	useActiveIdReconciler(sessions, setActiveId, daemonActiveId);

	dismiss = () => setSessions((s) => s.filter((x) => x.id !== "a"));
	goBacklog = () => navigate("/backlog");

	return <div data-testid="active">{activeId ?? "null"}</div>;
}

describe("useActiveIdReconciler navigation flow", () => {
	it("does not select a session after navigating to /backlog and dismissing", () => {
		render(
			<MemoryRouter initialEntries={["/sessions"]}>
				<Harness />
			</MemoryRouter>,
		);
		expect(screen.getByTestId("active").textContent).toBe("a");

		act(() => goBacklog());
		expect(screen.getByTestId("active").textContent).toBe("null");

		act(() => dismiss());
		expect(screen.getByTestId("active").textContent).toBe("null");
	});
});
