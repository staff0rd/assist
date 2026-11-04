import { highLevelTestCount } from "../../../../../../../../../review/highLevel/highLevelTestCount";
import type { HighLevelPreviewPayload } from "../../../../../../../../../review/highLevel/types";
import type { HighLevelDiffComments } from "../../../HighLevelDiffComments";
import { HighLevelTestsView } from "../../../HighLevelTestsView";
import { HighLevelCheckDetail } from "./HighLevelCheckDetail";

export function HighLevelTestsDetail({
	payload,
	subject,
	comments,
}: {
	payload: HighLevelPreviewPayload;
	subject: string;
	comments?: HighLevelDiffComments | undefined;
}) {
	return (
		<HighLevelCheckDetail
			label={`Changed tests (${highLevelTestCount(payload.tests)})`}
		>
			<HighLevelTestsView
				files={payload.tests}
				testPaths={payload.testPaths}
				subject={subject}
				comments={comments}
			/>
		</HighLevelCheckDetail>
	);
}
