import { useState } from "react";
import type { ViewType } from "react-diff-view";
import type { DiffChangeType } from "../filterDiffFiles";
import { useDiffViewType } from "../../useDiffViewType";

export function useDiffFilters(): {
	viewType: ViewType;
	onChange: (viewType: ViewType) => void;
	search: string;
	onSearchChange: (search: string) => void;
	changeType: DiffChangeType;
	onChangeTypeChange: (changeType: DiffChangeType) => void;
} {
	const { viewType, onChange } = useDiffViewType();
	const [search, setSearch] = useState("");
	const [changeType, setChangeType] = useState<DiffChangeType>("all");

	return {
		viewType,
		onChange,
		search,
		onSearchChange: setSearch,
		changeType,
		onChangeTypeChange: setChangeType,
	};
}
