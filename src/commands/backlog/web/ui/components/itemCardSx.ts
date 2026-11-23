import { itemCardStyles } from "./itemCardStyles";

export function itemCardSx(inProgress: boolean, running: boolean) {
	if (!inProgress) return itemCardStyles.card;
	return running
		? itemCardStyles.inProgressRunningCard
		: itemCardStyles.inProgressCard;
}
