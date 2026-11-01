import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import type { UsageJobFilters } from "../fetchUsageJobs";
import { usageJobLabels } from "../usageJobLabels";

const kindOptions = [
	{ value: "", label: "All jobs" },
	...Object.entries(usageJobLabels).map(([value, label]) => ({ value, label })),
];

const triggerOptions = [
	{ value: "", label: "Any" },
	{ value: "scheduled", label: "Scheduled" },
	{ value: "manual", label: "Manual" },
];

function FilterSelect({
	label,
	value,
	options,
	onChange,
}: {
	label: string;
	value: string;
	options: { value: string; label: string }[];
	onChange: (value: string) => void;
}) {
	return (
		<TextField
			select
			size="small"
			label={label}
			value={value}
			onChange={(event) => onChange(event.target.value)}
		>
			{options.map((option) => (
				<MenuItem key={option.value} value={option.value}>
					{option.label}
				</MenuItem>
			))}
		</TextField>
	);
}

export function UsageJobsFilters({
	filters,
	onChange,
}: {
	filters: UsageJobFilters;
	onChange: (filters: UsageJobFilters) => void;
}) {
	return (
		<Stack
			direction="row"
			spacing={2}
			useFlexGap
			sx={{ flexWrap: "wrap", alignItems: "center", mb: 2 }}
		>
			<FilterSelect
				label="Job"
				value={filters.kind}
				options={kindOptions}
				onChange={(kind) => onChange({ ...filters, kind })}
			/>
			<FilterSelect
				label="Trigger"
				value={filters.trigger}
				options={triggerOptions}
				onChange={(trigger) => onChange({ ...filters, trigger })}
			/>
			<Typography variant="caption" color="text.secondary">
				A PR review records one row per reviewer. Cached reviewer results are
				not re-recorded.
			</Typography>
		</Stack>
	);
}
