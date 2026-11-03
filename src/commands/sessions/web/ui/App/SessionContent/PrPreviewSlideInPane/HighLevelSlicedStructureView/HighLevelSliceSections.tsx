import type { ReactNode } from "react";
import type { HighLevelDiffComments } from "../HighLevelDiffComments";
import { HighLevelStructureToolbar } from "../HighLevelStructureView/HighLevelStructureToolbar";
import { HighLevelSliceSection } from "./HighLevelSliceSection";
import type { useSlicedStructureView } from "./useSlicedStructureView";

type SlicedView = ReturnType<typeof useSlicedStructureView>;

export function HighLevelSliceSections({
	toolbar,
	sections,
	bar,
	subject,
	comments,
}: {
	toolbar: SlicedView["toolbar"];
	sections: SlicedView["sections"];
	bar: ReactNode;
	subject: string;
	comments?: HighLevelDiffComments | undefined;
}) {
	return (
		<>
			<HighLevelStructureToolbar {...toolbar}>{bar}</HighLevelStructureToolbar>
			{sections.map((section) => (
				<HighLevelSliceSection
					key={`${section.number}:${section.slice.title}`}
					{...section}
					subject={subject}
					comments={comments}
				/>
			))}
		</>
	);
}
