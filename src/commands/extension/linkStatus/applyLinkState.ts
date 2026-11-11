import type { LinkState } from "../../sessions/web/linkStatus/LinkState";
import { linkStateStyles } from "./linkStateStyles";

const SVG_NS = "http://www.w3.org/2000/svg";
const ICON_ATTR = "data-assist-link-icon";

function stateIcon(label: string, paths: string[]): SVGSVGElement {
	const svg = document.createElementNS(SVG_NS, "svg");
	svg.setAttribute(ICON_ATTR, "");
	svg.setAttribute("viewBox", "0 0 16 16");
	svg.setAttribute("width", "16");
	svg.setAttribute("height", "16");
	svg.setAttribute("role", "img");
	svg.setAttribute("aria-label", label);
	svg.setAttribute(
		"style",
		"fill: currentColor; vertical-align: text-bottom; margin-right: 2px",
	);
	for (const d of paths) {
		const path = document.createElementNS(SVG_NS, "path");
		path.setAttribute("d", d);
		svg.append(path);
	}
	return svg;
}

export function clearLinkState(anchor: HTMLAnchorElement): void {
	for (const icon of anchor.querySelectorAll(`[${ICON_ATTR}]`)) icon.remove();
	anchor.style.removeProperty("color");
	anchor.style.removeProperty("white-space");
}

export function applyLinkState(
	anchor: HTMLAnchorElement,
	state: LinkState,
): void {
	const style = linkStateStyles[state];
	if (!style) return;
	clearLinkState(anchor);
	anchor.style.color = style.color;
	anchor.style.whiteSpace = "nowrap";
	anchor.prepend(stateIcon(style.label, style.paths));
}
