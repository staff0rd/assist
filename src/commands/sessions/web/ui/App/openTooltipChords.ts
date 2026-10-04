import { act, fireEvent, screen } from "@testing-library/react";

export async function openTooltipChords(
	target: HTMLElement,
	via: "hover" | "focus" = "hover",
): Promise<{ text: string; chords: string[] }> {
	await act(async () => {
		if (via === "hover") fireEvent.mouseOver(target);
		else {
			fireEvent.keyDown(document.body, { key: "Tab" });
			target.focus();
		}
	});
	const tooltip = await screen.findByRole("tooltip");
	return {
		text: tooltip.textContent ?? "",
		chords: Array.from(tooltip.querySelectorAll("kbd")).map(
			(kbd) => kbd.textContent ?? "",
		),
	};
}
