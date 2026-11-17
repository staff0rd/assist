import { anchorPosition } from "./anchorPosition";
import { MIN_WIDTH, hostWidthStyle } from "./hostWidthStyle";

export function mountHost(host: HTMLElement, anchor: HTMLElement): () => void {
	const dialog = anchor.closest<HTMLElement>('dialog, [role="dialog"]');
	const style = dialog ? topLayerHostStyle : pageHostStyle;
	const place = () => {
		host.style.cssText = style(anchor, host.offsetWidth || MIN_WIDTH);
	};
	place();
	if (dialog) {
		host.setAttribute("popover", "manual");
		dialog.append(host);
		host.showPopover?.();
	} else document.body.append(host);
	const resize =
		typeof ResizeObserver === "undefined"
			? undefined
			: new ResizeObserver(place);
	resize?.observe(host);
	window.addEventListener("resize", place);
	return () => {
		resize?.disconnect();
		window.removeEventListener("resize", place);
	};
}

function pageHostStyle(anchor: HTMLElement, width: number): string {
	const { top, left } = anchorPosition(anchor, width);
	return [
		"position: absolute",
		`top: ${top + window.scrollY}px`,
		`left: ${left + window.scrollX}px`,
		...hostWidthStyle(),
		"z-index: 2147483646",
	].join(";");
}

function topLayerHostStyle(anchor: HTMLElement, width: number): string {
	const { top, left } = anchorPosition(anchor, width);
	return [
		"position: fixed",
		"inset: auto",
		`top: ${top}px`,
		`left: ${left}px`,
		...hostWidthStyle(),
		"height: auto",
		"margin: 0",
		"padding: 0",
		"border: 0",
		"background: transparent",
		"overflow: visible",
	].join(";");
}
