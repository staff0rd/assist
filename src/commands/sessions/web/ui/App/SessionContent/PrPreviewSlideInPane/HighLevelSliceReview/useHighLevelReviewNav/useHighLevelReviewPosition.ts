import { useCallback, useState } from "react";
import {
	loadPersisted,
	prunePersisted,
	savePersisted,
} from "../../../../loadPersisted";
import type { HighLevelArea } from "../highLevelAreaCheck";

const PREFIX = "assist:high-level-position:";

export type HighLevelReviewHead = {
	repo: string;
	prNumber: number;
	headSha: string;
};

type HighLevelReviewPosition = {
	index: number;
	area: HighLevelArea | undefined;
};

const START: HighLevelReviewPosition = { index: 0, area: undefined };

function positionKey(head: HighLevelReviewHead | undefined) {
	return head?.repo && head.headSha
		? `${PREFIX}${head.repo}#${head.prNumber}@${head.headSha}`
		: undefined;
}

function loadPosition(key: string | undefined): HighLevelReviewPosition {
	if (!key) return START;
	prunePersisted(PREFIX);
	const [saved] = loadPersisted<HighLevelReviewPosition>(key);
	return saved && Number.isInteger(saved.index) && saved.index >= 0
		? { index: saved.index, area: saved.area }
		: START;
}

export function useHighLevelReviewPosition(
	head: HighLevelReviewHead | undefined,
): [HighLevelReviewPosition, (next: HighLevelReviewPosition) => void] {
	const key = positionKey(head);
	const [state, setState] = useState(() => ({
		key,
		position: loadPosition(key),
	}));
	const current =
		state.key === key ? state : { key, position: loadPosition(key) };
	if (current !== state) setState(current);

	const setPosition = useCallback(
		(position: HighLevelReviewPosition) => {
			if (key) savePersisted(key, [position]);
			setState({ key, position });
		},
		[key],
	);
	return [current.position, setPosition];
}
