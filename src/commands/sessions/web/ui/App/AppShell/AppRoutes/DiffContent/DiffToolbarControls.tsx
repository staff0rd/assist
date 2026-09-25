import type { ViewType } from "react-diff-view";
import { DiffChangeTypeMenu } from "./DiffChangeTypeMenu";
import { DiffCollapseAllToggle } from "./DiffToolbarControls/DiffCollapseAllToggle";
import { DiffFileSearch } from "./DiffToolbarControls/DiffFileSearch";
import { DiffViewTypeToggle } from "../DiffViewTypeToggle";
import type { DiffChangeType } from "./filterDiffFiles";

export type DiffToolbarControlProps = {
	search: string;
	onSearchChange: (search: string) => void;
	changeType: DiffChangeType;
	onChangeTypeChange: (changeType: DiffChangeType) => void;
	allCollapsed: boolean;
	onToggleCollapseAll: () => void;
	viewType: ViewType;
	onChange: (viewType: ViewType) => void;
};

export function DiffToolbarControls({
	search,
	onSearchChange,
	changeType,
	onChangeTypeChange,
	allCollapsed,
	onToggleCollapseAll,
	viewType,
	onChange,
}: DiffToolbarControlProps) {
	return (
		<>
			<DiffFileSearch search={search} onChange={onSearchChange} />
			<DiffChangeTypeMenu
				changeType={changeType}
				onChange={onChangeTypeChange}
			/>
			<DiffCollapseAllToggle
				allCollapsed={allCollapsed}
				onToggleCollapseAll={onToggleCollapseAll}
			/>
			<DiffViewTypeToggle viewType={viewType} onChange={onChange} />
		</>
	);
}
