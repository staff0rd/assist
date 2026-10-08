import type { NextPickup } from "../../../../../../../../next/types";

export function nextPickupWhy(
	pickup: NextPickup,
	pickable: number,
	othersClear: boolean,
): string {
	const rank =
		pickable > 1
			? `the top of ${pickable} unassigned project items`
			: "the only unassigned project item";
	const clear = othersClear
		? ", and nothing is assigned to you or awaiting your review"
		: "";
	return `${pickup.status} on ${pickup.projectTitle} — ${rank} you could pick up${clear}.`;
}
