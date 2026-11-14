import type { HighLevelPreviewPayload } from "../../../../../../../review/highLevel/types";
import type { HighLevelDiffComments } from "../HighLevelDiffComments";
import { HighLevelManualTesting } from "../HighLevelManualTesting";
import { HighLevelAllFiles } from "./HighLevelAllFiles";
import { HighLevelDescription } from "./HighLevelDescription";
import type { HighLevelArea } from "./highLevelAreaCheck";
import { HighLevelSliceAreaContent } from "./HighLevelSliceAreaContent";
import type { HighLevelSliceView } from "./highLevelSliceViews";

export function HighLevelAreaContent({
	area,
	view,
	payload,
	comments,
}: {
	area: HighLevelArea;
	view: HighLevelSliceView | undefined;
	payload: HighLevelPreviewPayload;
	comments?: HighLevelDiffComments | undefined;
}) {
	const subject = `${payload.repo}#${payload.prNumber}`;
	if (view)
		return (
			<HighLevelSliceAreaContent
				area={area}
				view={view}
				payload={payload}
				subject={`${subject}:slice:${view.number}`}
				comments={comments}
			/>
		);
	if (area === "description" || area === "backend")
		return (
			<HighLevelDescription
				body={payload.body}
				repo={payload.repo}
				prNumber={payload.prNumber}
			/>
		);
	if (area === "all")
		return (
			<HighLevelAllFiles
				payload={payload}
				subject={subject}
				comments={comments}
			/>
		);
	if (area === "manual")
		return (
			<HighLevelManualTesting
				manualTesting={payload.manualTesting}
				repo={payload.repo}
				headSha={payload.headSha}
				comments={comments}
			/>
		);
	return null;
}
