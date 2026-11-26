import { regroupHighLevelTests } from "../../../../../../../review/highLevel/regroupHighLevelTests";
import type {
	HighLevelTestFile,
	HighLevelTestRegrouping,
} from "../../../../../../../review/highLevel/types";
import {
	type HighLevelTestsGrouping,
	useHighLevelTestsGrouping,
} from "./useHighLevelTestsGrouping";

export function useRegroupedTests(
	files: HighLevelTestFile[],
	regrouping: HighLevelTestRegrouping | undefined,
	subject: string,
): {
	shown: HighLevelTestFile[];
	grouping: HighLevelTestsGrouping | undefined;
	setGrouping: (grouping: HighLevelTestsGrouping) => void;
} {
	const [grouping, setGrouping] = useHighLevelTestsGrouping(subject);
	if (!regrouping) return { shown: files, grouping: undefined, setGrouping };
	return {
		shown:
			grouping === "when" ? regroupHighLevelTests(files, regrouping) : files,
		grouping,
		setGrouping,
	};
}
