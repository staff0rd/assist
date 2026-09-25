import ViewSidebarOutlined from "@mui/icons-material/ViewSidebarOutlined";
import IconButton from "@mui/material/IconButton";

const smallIconSx = { fontSize: 16 } as const;

export function SidebarCollapseToggle({
	collapsed,
	onToggleCollapsed,
	size = "medium",
}: {
	collapsed: boolean;
	onToggleCollapsed: () => void;
	size?: "small" | "medium";
}) {
	const label = collapsed ? "Show sidebar" : "Hide sidebar";

	return (
		<IconButton
			size={size}
			onClick={onToggleCollapsed}
			title={label}
			aria-label={label}
			aria-pressed={!collapsed}
			sx={{
				color: collapsed ? "text.disabled" : "text.primary",
				"&:hover": { color: "text.primary" },
			}}
		>
			<ViewSidebarOutlined sx={size === "small" ? smallIconSx : undefined} />
		</IconButton>
	);
}
