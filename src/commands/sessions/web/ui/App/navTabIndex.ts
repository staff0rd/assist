import { altChordCode } from "./altChordCode";

const NAV_TAB_DIGIT = /^Digit([1-5])$/;

export function navTabIndex(event: KeyboardEvent): number | undefined {
	const match = NAV_TAB_DIGIT.exec(altChordCode(event) ?? "");
	return match ? Number(match[1]) - 1 : undefined;
}
