import { DropdownWrapper } from "./DropdownWrapper";
import { FilterDropdown } from "./FilterDropdown";

function filterLabel(selected: Set<string>): string {
	if (selected.size === 0) return "All projects";
	if (selected.size === 1) return [...selected][0];
	return `${selected.size} projects`;
}

export function ProjectFilter({
	projects,
	selected,
	onChange,
}: {
	projects: string[];
	selected: Set<string>;
	onChange: (next: Set<string>) => void;
}) {
	const toggle = (project: string) => {
		const next = new Set(selected);
		if (next.has(project)) next.delete(project);
		else next.add(project);
		onChange(next);
	};

	return (
		<DropdownWrapper label={filterLabel(selected)}>
			{() => (
				<FilterDropdown
					items={projects}
					selected={selected}
					onToggle={toggle}
				/>
			)}
		</DropdownWrapper>
	);
}
