import type { NextPickup } from "../../../../../../../next/types";

export function nextPickupWhy(
	pickup: NextPickup,
	pickable: number,
	othersClear: boolean,
): string {
	const priority = pickup.priority
		? `${pickup.priority} on ${pickup.projectTitle}, `
		: `On ${pickup.projectTitle}, `;
	const rank =
		pickable > 1
			? `the highest priority of ${pickable} unassigned project items`
			: "the only unassigned project item";
	const clear = othersClear
		? ", and nothing is assigned to you or awaiting your review"
		: "";
	return `${priority}${pickup.status} — ${rank} you could pick up${clear}.`;
}
