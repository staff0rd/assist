import { useRef, useState } from "react";
import { FilterDropdown } from "./FilterDropdown";
import { FilterTrigger } from "./FilterTrigger";

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
	const [open, setOpen] = useState(false);
	const wrapperRef = useRef<HTMLFieldSetElement>(null);

	const toggle = (project: string) => {
		const next = new Set(selected);
		if (next.has(project)) next.delete(project);
		else next.add(project);
		onChange(next);
	};

	return (
		<fieldset
			ref={wrapperRef}
			style={{ position: "relative", border: "none", margin: 0, padding: 0 }}
			onBlur={(e) => {
				if (!wrapperRef.current?.contains(e.relatedTarget as Node))
					setOpen(false);
			}}
		>
			<FilterTrigger
				label={filterLabel(selected)}
				open={open}
				onClick={() => setOpen(!open)}
			/>
			{open && (
				<FilterDropdown
					items={projects}
					selected={selected}
					onToggle={toggle}
				/>
			)}
		</fieldset>
	);
}
