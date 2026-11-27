// @vitest-environment jsdom
import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { makeSessionInfo } from "../../../../../../../test/mothers/makeSessionInfo";
import type { Transcript } from "../../../types";
import { useTranscriptState } from "../../../useSessionSocket/useWsConnection/useTranscriptState";
import { HistorySearchQueryProvider } from "../../useHistorySearchQuery";
import { LiveTranscriptArea } from "./LiveTranscriptArea";

beforeAll(() => {
	Element.prototype.scrollIntoView = vi.fn();
});

afterEach(cleanup);

const sessions = {
	a: makeSessionInfo({ id: "a", sdk: true }),
	b: makeSessionInfo({ id: "b", sdk: true }),
};

function transcriptOf(sessionId: string): Transcript {
	return {
		sessionId,
		messages: [{ role: "assistant", text: `reply from ${sessionId}` }],
	};
}

function renderSwitcher() {
	const fetchSessionTranscript = vi.fn();
	let receive: (t: Transcript) => void = () => {};
	function Harness({ activeId }: { activeId: "a" | "b" }) {
		const { liveTranscripts, setLiveTranscript } = useTranscriptState();
		receive = setLiveTranscript;
		return (
			<HistorySearchQueryProvider>
				<LiveTranscriptArea
					session={sessions[activeId]}
					liveTranscripts={liveTranscripts}
					fetchSessionTranscript={fetchSessionTranscript}
				/>
			</HistorySearchQueryProvider>
		);
	}
	const view = render(<Harness activeId="a" />);
	return {
		fetchSessionTranscript,
		show: (id: "a" | "b") => view.rerender(<Harness activeId={id} />),
		receive: (t: Transcript) => act(() => receive(t)),
	};
}

describe("LiveTranscriptArea", () => {
	it("shows A's transcript on switching A → B → A, even when B's reply lands last", () => {
		const { fetchSessionTranscript, show, receive } = renderSwitcher();
		receive(transcriptOf("a"));
		show("b");
		show("a");
		receive(transcriptOf("b"));

		expect(screen.getByText("reply from a")).toBeTruthy();
		expect(screen.queryByText("Loading transcript…")).toBeNull();
		expect(fetchSessionTranscript.mock.calls.map(([id]) => id)).toEqual([
			"a",
			"b",
			"a",
		]);
	});
});
