// @vitest-environment jsdom
import { ThemeProvider } from "@mui/material/styles";
import {
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { PrPreview } from "../../../shared/SessionInfoBase";
import { createDesignTheme } from "../designSystem/createDesignTheme";
import { PhoneCheckCard } from "./PhoneCheckCard";

afterEach(cleanup);

const preview: PrPreview = {
	requestId: "r1",
	title: "PIN shows on the Mac",
	body: JSON.stringify({
		title: "PIN shows on the Mac",
		before: ["Restart both daemons"],
		steps: ["Run `assist docs unlock`", "The PIN appears on the Mac"],
		changed: "The docs PIN goes to the controlling node.",
	}),
	prNumber: null,
	kind: "check",
};

const laterPreview: PrPreview = {
	...preview,
	body: JSON.stringify({
		...JSON.parse(preview.body),
		laterPhases: [
			{ number: 3, name: "Wire the API" },
			{ number: 4, name: "Review" },
		],
	}),
};

function card(shown: PrPreview = preview) {
	const onDecision = vi.fn();
	render(
		<ThemeProvider theme={createDesignTheme("dark")}>
			<PhoneCheckCard
				preview={shown}
				phase="1/2"
				keyboardOpen={false}
				onDecision={onDecision}
			/>
		</ThemeProvider>,
	);
	return onDecision;
}

const button = (name: string) =>
	screen.getByRole("button", { name }) as HTMLButtonElement;

describe("PhoneCheckCard", () => {
	it("shows the phase, title, before chips and steps", () => {
		card();

		expect(screen.getByText("phase 1/2")).toBeTruthy();
		expect(screen.getByText("PIN shows on the Mac")).toBeTruthy();
		expect(screen.getByText("Restart both daemons")).toBeTruthy();
		expect(screen.getAllByRole("listitem")).toHaveLength(2);
		expect(screen.getByText("assist docs unlock").tagName).toBe("CODE");
	});

	it("copies a step's inline code exactly with its copy button", async () => {
		const writeText = vi.fn().mockResolvedValue(undefined);
		Object.defineProperty(navigator, "clipboard", {
			value: { writeText },
			configurable: true,
		});
		card({
			...preview,
			body: JSON.stringify({
				title: "Download is throttled",
				steps: [
					"Run `curl --limit-rate 20k -o /dev/null https://proof.ovh.net/files/100Mb.dat`",
					"It downloads slowly",
				],
			}),
		});

		const copy = screen.getByRole("button", { name: "Copy" });
		fireEvent.click(copy);

		expect(writeText).toHaveBeenCalledWith(
			"curl --limit-rate 20k -o /dev/null https://proof.ovh.net/files/100Mb.dat",
		);
		await waitFor(() => expect(copy.classList).toContain("copied"));
	});

	it("sends works in one tap without a note", () => {
		const onDecision = card();

		fireEvent.click(button("Works"));

		expect(onDecision).toHaveBeenCalledWith(
			"approve",
			expect.objectContaining({ answers: { result: "works" } }),
		);
		expect(button("Works").disabled).toBe(true);
	});

	it("offers no later phase choice without later phases", () => {
		card();

		expect(screen.queryByRole("button", { name: "Later phase" })).toBeNull();
	});

	it("lists each later phase and sends the picked one", () => {
		const onDecision = card(laterPreview);

		fireEvent.click(button("Later phase"));
		expect(button("Phase 3: Wire the API")).toBeTruthy();
		fireEvent.click(button("Phase 4: Review"));

		expect(onDecision).toHaveBeenCalledWith(
			"approve",
			expect.objectContaining({
				answers: { result: "later", phase: "4" },
			}),
		);
		expect(button("Works").disabled).toBe(true);
	});

	it("sends doesn't work with the trimmed note", () => {
		const onDecision = card();

		fireEvent.change(screen.getByRole("textbox", { name: "Note" }), {
			target: { value: "  PIN showed on work-wsl \n" },
		});
		fireEvent.click(button("Doesn't work"));

		expect(onDecision).toHaveBeenCalledWith(
			"approve",
			expect.objectContaining({
				answers: { result: "doesn't work", note: "PIN showed on work-wsl" },
			}),
		);
	});

	it("dismisses without a note and disables every action", () => {
		const onDecision = card();

		fireEvent.click(button("Dismiss"));

		expect(onDecision).toHaveBeenCalledWith(
			"reject",
			expect.not.objectContaining({ answers: expect.anything() }),
		);
		for (const name of ["Dismiss", "Works", "Doesn't work"]) {
			expect(button(name).disabled).toBe(true);
		}
	});

	it("dismisses with the trimmed note", () => {
		const onDecision = card();

		fireEvent.change(screen.getByRole("textbox", { name: "Note" }), {
			target: { value: "  not now \n" },
		});
		fireEvent.click(button("Dismiss"));

		expect(onDecision).toHaveBeenCalledWith(
			"reject",
			expect.objectContaining({ answers: { note: "not now" } }),
		);
	});
});
