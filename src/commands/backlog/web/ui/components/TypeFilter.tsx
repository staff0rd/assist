import { ToggleButton, ToggleButtonGroup } from "@mui/material";

export type TypeFilterValue = "all" | "story" | "bug";

type TypeFilterProps = {
	value: TypeFilterValue;
	onChange: (value: TypeFilterValue) => void;
};

export function TypeFilter({ value, onChange }: TypeFilterProps) {
	return (
		<ToggleButtonGroup
			value={value}
			exclusive
			size="small"
			onChange={(_event, next: TypeFilterValue | null) => {
				if (next !== null) onChange(next);
			}}
		>
			<ToggleButton value="all">All</ToggleButton>
			<ToggleButton value="story">Stories</ToggleButton>
			<ToggleButton value="bug">Bugs</ToggleButton>
		</ToggleButtonGroup>
	);
}
