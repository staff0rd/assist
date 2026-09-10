import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import { ALL_STATUSES, type UsageItemStatus } from "./fetchUsageItems";

const options: { value: UsageItemStatus; label: string }[] = [
	{ value: ALL_STATUSES, label: "All" },
	{ value: "done", label: "Done" },
	{ value: "running", label: "Running" },
];

export function UsageItemStatusFilter({
	status,
	onChange,
}: {
	status: UsageItemStatus;
	onChange: (status: UsageItemStatus) => void;
}) {
	return (
		<ToggleButtonGroup
			size="small"
			exclusive
			value={status}
			onChange={(_, value: UsageItemStatus | null) => value && onChange(value)}
			aria-label="Filter items by status"
		>
			{options.map((option) => (
				<ToggleButton key={option.value} value={option.value}>
					{option.label}
				</ToggleButton>
			))}
		</ToggleButtonGroup>
	);
}
