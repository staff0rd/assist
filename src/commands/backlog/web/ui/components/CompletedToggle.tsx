import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import type { BacklogFilter } from "../../parseBacklogFilter";
import { useBacklogFilter } from "../useBacklogFilter";

export function CompletedToggle() {
	const [filter, setFilter] = useBacklogFilter();

	return (
		<ToggleButtonGroup
			value={filter}
			exclusive
			size="small"
			aria-label="Status filter"
			onChange={(_event, next: BacklogFilter | null) => {
				if (next !== null) setFilter(next);
			}}
		>
			<ToggleButton value="todo">Todo</ToggleButton>
			<ToggleButton value="done">Done</ToggleButton>
			<ToggleButton value="all">All</ToggleButton>
		</ToggleButtonGroup>
	);
}
