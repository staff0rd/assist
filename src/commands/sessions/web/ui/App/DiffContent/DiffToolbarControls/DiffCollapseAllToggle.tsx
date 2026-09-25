import UnfoldLessIcon from "@mui/icons-material/UnfoldLess";
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";
import IconButton from "@mui/material/IconButton";

export function DiffCollapseAllToggle({
	allCollapsed,
	onToggleCollapseAll,
}: {
	allCollapsed: boolean;
	onToggleCollapseAll: () => void;
}) {
	const label = allCollapsed ? "Expand all files" : "Collapse all files";
	const Icon = allCollapsed ? UnfoldMoreIcon : UnfoldLessIcon;

	return (
		<IconButton
			size="small"
			onClick={onToggleCollapseAll}
			title={label}
			aria-label={label}
			aria-pressed={allCollapsed}
			sx={{
				color: allCollapsed ? "text.primary" : "text.disabled",
				"&:hover": { color: "text.primary" },
			}}
		>
			<Icon sx={{ fontSize: 16 }} />
		</IconButton>
	);
}
