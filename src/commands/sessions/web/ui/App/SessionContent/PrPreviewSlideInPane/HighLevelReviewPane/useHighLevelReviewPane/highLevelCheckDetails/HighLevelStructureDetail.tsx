import { highLevelChangedFileCount } from "../../../../../../../../../review/highLevel/highLevelChangedFileCount";
import type { HighLevelPreviewPayload } from "../../../../../../../../../review/highLevel/types";
import type { HighLevelDiffComments } from "../../../HighLevelDiffComments";
import { HighLevelStructureView } from "../../../HighLevelStructureView";
import { HighLevelCheckDetail } from "./HighLevelCheckDetail";

export function HighLevelStructureDetail({
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
			label={`Changed files (${highLevelChangedFileCount(payload.structure)})`}
		>
			<HighLevelStructureView
				structure={payload.structure}
				collapsedPaths={payload.collapsedPaths}
				subject={subject}
				comments={comments}
			/>
		</HighLevelCheckDetail>
	);
}
