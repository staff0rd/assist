import { useState } from "react";
import {
	loadPersisted,
	prunePersisted,
	savePersisted,
} from "../../../loadPersisted";

const PREFIX = "assist:high-level-tests-grouping:";

export type HighLevelTestsGrouping = "when" | "written";

export function useHighLevelTestsGrouping(
	subject: string,
): [HighLevelTestsGrouping, (grouping: HighLevelTestsGrouping) => void] {
	const key = `${PREFIX}${subject}`;
	const [grouping, setGrouping] = useState<HighLevelTestsGrouping>(() => {
		prunePersisted(PREFIX);
		return loadPersisted<string>(key).includes("written") ? "written" : "when";
	});
	return [
		grouping,
		(next) => {
			savePersisted(key, next === "written" ? ["written"] : []);
			setGrouping(next);
		},
	];
}
