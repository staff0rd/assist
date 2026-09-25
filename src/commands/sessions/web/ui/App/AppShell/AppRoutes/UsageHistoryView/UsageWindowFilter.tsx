import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import type { UsagePeakWindow } from "../../../../../../../../shared/db/listUsagePeaks";
import { useHarnessCapabilities } from "../../../../useHarnessCapabilities";
import { usagePeakWindow } from "./usagePeakWindow";

export type UsageWindowFilterValue = UsagePeakWindow | "all";

const claudeWindows: UsagePeakWindow[] = ["five_hour", "seven_day"];
const codexWindows: UsagePeakWindow[] = ["codex:five_hour", "codex:seven_day"];

function filterOptions(
	exposeCodex: boolean,
): { value: UsageWindowFilterValue; label: string }[] {
	const windows = exposeCodex
		? [...claudeWindows, ...codexWindows]
		: claudeWindows;
	return [
		{ value: "all", label: "All" },
		...windows.map((value) => ({
			value,
			label: usagePeakWindow(value).label,
		})),
	];
}

export function UsageWindowFilter({
	window,
	onChange,
}: {
	window: UsageWindowFilterValue;
	onChange: (window: UsageWindowFilterValue) => void;
}) {
	const { exposeCodexActions } = useHarnessCapabilities();
	return (
		<ToggleButtonGroup
			size="small"
			exclusive
			value={window}
			onChange={(_, value) => value && onChange(value)}
			aria-label="Filter peaks by rate-limit window"
		>
			{filterOptions(exposeCodexActions).map((option) => (
				<ToggleButton key={option.value} value={option.value}>
					{option.label}
				</ToggleButton>
			))}
		</ToggleButtonGroup>
	);
}
