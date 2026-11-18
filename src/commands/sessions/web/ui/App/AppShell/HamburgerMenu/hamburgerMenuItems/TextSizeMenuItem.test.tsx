// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import MenuList from "@mui/material/MenuList";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TextSizeContext } from "../../../useTextSizeContext";
import { TextSizeMenuItem } from "./TextSizeMenuItem";

afterEach(cleanup);

function renderItem(offset: number) {
	const setTextSizeOffset = vi.fn();
	const onParentClick = vi.fn();
	render(
		// biome-ignore lint/a11y/useKeyWithClickEvents: test harness for bubbling
		<div onClick={onParentClick}>
			<TextSizeContext.Provider
				value={{ textSizeOffset: offset, setTextSizeOffset }}
			>
				<MenuList>
					<TextSizeMenuItem />
				</MenuList>
			</TextSizeContext.Provider>
		</div>,
	);
	return { setTextSizeOffset, onParentClick };
}

const smaller = () => screen.getByRole("button", { name: "Smaller text" });
const larger = () => screen.getByRole("button", { name: "Larger text" });

describe("TextSizeMenuItem", () => {
	it("shows the signed value", () => {
		renderItem(2);
		expect(screen.getByText("+2")).toBeTruthy();
	});

	it("steps by one without bubbling to the menu", () => {
		const { setTextSizeOffset, onParentClick } = renderItem(0);
		fireEvent.click(larger());
		expect(setTextSizeOffset).toHaveBeenLastCalledWith(1);
		fireEvent.click(smaller());
		expect(setTextSizeOffset).toHaveBeenLastCalledWith(-1);
		expect(onParentClick).not.toHaveBeenCalled();
	});

	it("disables − at the minimum", () => {
		renderItem(-4);
		expect((smaller() as HTMLButtonElement).disabled).toBe(true);
		expect((larger() as HTMLButtonElement).disabled).toBe(false);
	});

	it("disables + at the maximum", () => {
		renderItem(8);
		expect((larger() as HTMLButtonElement).disabled).toBe(true);
	});

	it("steps with arrow keys", () => {
		const { setTextSizeOffset } = renderItem(3);
		fireEvent.keyDown(screen.getByRole("menuitem"), { key: "ArrowLeft" });
		expect(setTextSizeOffset).toHaveBeenLastCalledWith(2);
	});
});
