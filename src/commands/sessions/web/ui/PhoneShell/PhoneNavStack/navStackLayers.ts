import type { Location } from "react-router";
import type { NavStackState } from "./nextNavStack";
import { uniqueLayers } from "./uniqueLayers";

export type NavStackLayer = {
	location: Location;
	below?: Location;
	isCurrent: boolean;
	isMoving: boolean;
	shown: boolean;
};

export function navStackLayers({
	stack,
	leaving,
	transition,
	gesture,
}: NavStackState) {
	const top = stack[stack.length - 1];
	const beneath = stack.at(-2);
	const swiping = !transition && gesture !== undefined;
	const pushing = swiping || transition?.kind === "push";
	const moving = pushing ? top : transition && leaving;
	const under = pushing ? beneath : transition && top;
	const layers = uniqueLayers([beneath, top, leaving]).map(
		(location): NavStackLayer => {
			const index = stack.findIndex(({ key }) => key === location.key);
			const isMoving = location.key === moving?.key;
			return {
				location,
				below: index > 0 ? stack[index - 1] : undefined,
				isCurrent: location === top,
				isMoving,
				shown: location === top || isMoving || location === under,
			};
		},
	);
	return { layers, moving, under };
}
