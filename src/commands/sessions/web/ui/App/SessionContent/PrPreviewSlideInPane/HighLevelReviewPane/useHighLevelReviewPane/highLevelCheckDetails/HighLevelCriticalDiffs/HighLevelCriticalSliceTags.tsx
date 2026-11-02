import { HighLevelTreeTag } from "../../../../HighLevelStructureView/HighLevelTreeRows/HighLevelTreeTag";
import { selectHighLevelSlice } from "../../../../selectHighLevelSlice";

export function HighLevelCriticalSliceTags({
	slices,
}: {
	slices: { number: number; title: string }[];
}) {
	return slices.map(({ number, title }) => (
		<HighLevelTreeTag
			key={number}
			label={`slice ${number}`}
			title={`Show slice ${number}: ${title}`}
			onClick={() => selectHighLevelSlice(number)}
		/>
	));
}
