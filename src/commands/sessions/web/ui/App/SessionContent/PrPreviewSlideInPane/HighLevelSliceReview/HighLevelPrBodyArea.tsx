import type { HighLevelPreviewPayload } from "../../../../../../../review/highLevel/types";
import { HighLevelDescription } from "./HighLevelDescription";
import { HighLevelRelatedPrs } from "./HighLevelRelatedPrs";

export function HighLevelPrBodyArea({
	area,
	payload,
}: {
	area: "description" | "related";
	payload: HighLevelPreviewPayload;
}) {
	if (area === "related")
		return (
			<HighLevelRelatedPrs
				body={payload.body}
				repo={payload.repo}
				prNumber={payload.prNumber}
			/>
		);
	return (
		<HighLevelDescription
			body={payload.body}
			repo={payload.repo}
			prNumber={payload.prNumber}
			checks={payload.checks}
		/>
	);
}
