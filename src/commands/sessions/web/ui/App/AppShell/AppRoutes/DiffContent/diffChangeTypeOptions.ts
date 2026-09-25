import type { DiffChangeType } from "./filterDiffFiles";

export const diffChangeTypeOptions: {
	value: DiffChangeType;
	label: string;
}[] = [
	{ value: "all", label: "All files" },
	{ value: "modified", label: "Modified" },
	{ value: "added", label: "Added" },
	{ value: "removed", label: "Removed" },
	{ value: "renamed", label: "Renamed" },
];

export function toDiffChangeType(value: string): DiffChangeType {
	return (
		diffChangeTypeOptions.find((option) => option.value === value)?.value ??
		"all"
	);
}

export function diffChangeTypeLabel(changeType: DiffChangeType): string {
	return (
		diffChangeTypeOptions.find((option) => option.value === changeType)
			?.label ?? "All files"
	);
}
