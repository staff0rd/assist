import { useMemo } from "react";
import type { HighLevelPreviewPayload } from "../../../../../../../review/highLevel/types";
import type { HighLevelDiffComments } from "../HighLevelDiffComments";
import { HighLevelStructureView } from "../HighLevelStructureView";
import { tagHighLevelStructure } from "./tagHighLevelStructure";

export function HighLevelAllFiles({
	payload,
	subject,
	comments,
}: {
	payload: HighLevelPreviewPayload;
	subject: string;
	comments?: HighLevelDiffComments | undefined;
}) {
	const structure = useMemo(
		() =>
			tagHighLevelStructure(
				payload.structure,
				payload.slices ?? [],
				new Set(payload.criticalDiffs.map((diff) => diff.path)),
			),
		[payload],
	);
	return (
		<HighLevelStructureView
			structure={structure}
			collapsedPaths={payload.collapsedPaths}
			subject={subject}
			comments={comments}
		/>
	);
}
