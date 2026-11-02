import type {
	HighLevelSlice,
	HighLevelStructure,
	HighLevelTestFile,
} from "../../../../../../../review/highLevel/types";
import { useDiffViewType } from "../../../useDiffViewType";
import { useStructureToolbarOffset } from "../HighLevelStructureView/useStructureToolbarOffset";
import { slicedStructureSections } from "./slicedStructureSections";
import { useHighLevelSliceSelection } from "./useHighLevelSliceSelection";
import { useSlicedHighLevelReview } from "./useSlicedHighLevelReview";
import { useSlicedStructureTrees } from "./useSlicedStructureTrees";

export function useSlicedStructureView(props: {
	structure: HighLevelStructure;
	slices: HighLevelSlice[];
	tests: HighLevelTestFile[];
	criticalFiles: string[];
	collapsedPaths: string[];
	subject: string;
}) {
	const sliced = useSlicedHighLevelReview(
		props.structure,
		props.slices,
		props.tests,
		props.criticalFiles,
	);
	const selection = useHighLevelSliceSelection(props.slices.length);
	const trees = useSlicedStructureTrees(
		props.subject,
		sliced.structures,
		props.collapsedPaths,
		selection.inView,
	);
	const { viewType, onChange } = useDiffViewType();
	const { toolbarRef, offsetSx } = useStructureToolbarOffset();

	return {
		selection,
		sections: slicedStructureSections({
			slices: props.slices,
			...sliced,
			views: trees.views,
			inView: selection.inView,
			glob: trees.match.glob,
			sliceMatches: trees.sliceMatches,
			viewType,
		}),
		offsetSx,
		toolbar: {
			ref: toolbarRef,
			bulk: trees.bulk,
			viewType,
			onChangeViewType: onChange,
			...trees.match,
		},
	};
}
