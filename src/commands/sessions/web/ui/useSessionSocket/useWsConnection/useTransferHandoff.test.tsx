// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { useRef, useState } from "react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import type { SessionInfo } from "../../types";
import { useActiveIdReconciler } from "./useActiveIdReconciler";
import { useTransferHandoff } from "./useTransferHandoff";
import { makeSessionInfo } from "../../../../../../test/mothers/makeSessionInfo";

const source = makeSessionInfo({ id: "7", name: "source" });
const other = makeSessionInfo({ id: "8", name: "other" });
const moved = makeSessionInfo({ id: "mac:3", name: "moved" });

function renderHandoff(initialActive: string) {
	return renderHook(
		({ sessions }: { sessions: SessionInfo[] }) => {
			const [activeId, setActiveId] = useState<string | null>(initialActive);
			const activeRef = useRef(activeId);
			activeRef.current = activeId;
			useActiveIdReconciler(sessions, setActiveId, null);
			const { handoffTransfer } = useTransferHandoff(
				sessions,
				() => activeRef.current,
				setActiveId,
			);
			return { activeId, handoffTransfer };
		},
		{
			initialProps: { sessions: [source, other] },
			wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
		},
	);
}

describe("useTransferHandoff", () => {
	it("selects the new session once it is listed when the source was selected", () => {
		const { result, rerender } = renderHandoff("7");

		act(() => result.current.handoffTransfer("7", "mac:3"));
		rerender({ sessions: [other] });
		expect(result.current.activeId).toBe("8");

		rerender({ sessions: [other, moved] });
		expect(result.current.activeId).toBe("mac:3");
	});

	it("selects the new session at once when it is already listed", () => {
		const { result, rerender } = renderHandoff("7");
		rerender({ sessions: [source, other, moved] });

		act(() => result.current.handoffTransfer("7", "mac:3"));
		expect(result.current.activeId).toBe("mac:3");
	});

	it("leaves the selection alone when the source was not selected", () => {
		const { result, rerender } = renderHandoff("8");

		act(() => result.current.handoffTransfer("7", "mac:3"));
		rerender({ sessions: [other] });
		rerender({ sessions: [other, moved] });
		expect(result.current.activeId).toBe("8");
	});
});
