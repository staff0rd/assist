// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { makeSessionInfo } from "../../../../../../../../../test/mothers/makeSessionInfo";
import { selectPreviewText } from "../../../../../../../../../test/selectPreviewText";
import { PrPreviewSlideIn } from "./PrPreviewSlideIn";

const show = {
	requestId: "show-1",
	title: "Stacked notes",
	body: "Stacked body text",
	prNumber: null,
	kind: "show" as const,
};

afterEach(cleanup);

describe("PrPreviewSlideIn stacked show", () => {
	it("sends a selection comment from a stacked show pane to the session", async () => {
		const sendInput = vi.fn();
		const onDecision = vi.fn();
		render(
			<PrPreviewSlideIn
				rendered={null}
				stackedShow={show}
				session={makeSessionInfo({
					id: "daemon-1",
					name: "show-42",
					commandType: "claude",
					status: "running",
				})}
				sendInput={sendInput}
				open
				onExited={vi.fn()}
				onDecision={onDecision}
			/>,
		);

		selectPreviewText(document.body, "Stacked body");
		fireEvent.change(screen.getByPlaceholderText("Add a note…"), {
			target: { value: "what does this mean?" },
		});
		fireEvent.click(screen.getByRole("button", { name: "Send to agent" }));

		const data = sendInput.mock.calls.map(([, chunk]) => chunk).join("");
		expect(sendInput.mock.calls[0]?.[0]).toBe("daemon-1");
		expect(data).toContain('Shown "Stacked notes"');
		expect(data).toContain("Stacked body");
		expect(data).toContain("what does this mean?");
		expect(onDecision).not.toHaveBeenCalled();
		expect(await screen.findByText("Question sent to show-42")).toBeTruthy();
	});
});
