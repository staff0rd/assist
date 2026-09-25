import { DiffChangeTypeChip } from "./DiffChangeTypeChip";
import { DiffCountsSummary } from "./DiffToolbarSubject/DiffCountsSummary";
import { DiffScopeButton } from "./DiffToolbarSubject/DiffScopeButton";
import type { DiffTotals } from "./diffFileTotals";
import type { DiffChangeType } from "./filterDiffFiles";
import type { DiffScopeState } from "./useDiffScopeState";

export type DiffToolbarSubjectProps = {
	scope: DiffScopeState;
	onScopeChange: (scope: string) => void;
	changeType: DiffChangeType;
	onChangeTypeChange: (changeType: DiffChangeType) => void;
	search: string;
	totals: DiffTotals;
};

export function DiffToolbarSubject({
	scope,
	onScopeChange,
	changeType,
	onChangeTypeChange,
	search,
	totals,
	compact,
}: DiffToolbarSubjectProps & { compact: boolean }) {
	const filtering = changeType !== "all" || search !== "";

	return (
		<>
			<DiffScopeButton {...scope} onChange={onScopeChange} compact={compact} />
			{changeType !== "all" && (
				<DiffChangeTypeChip
					changeType={changeType}
					onClear={() => onChangeTypeChange("all")}
				/>
			)}
			{!filtering && <DiffCountsSummary totals={totals} compact={compact} />}
		</>
	);
}
