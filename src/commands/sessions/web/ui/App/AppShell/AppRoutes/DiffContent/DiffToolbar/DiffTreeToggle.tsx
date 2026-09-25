import AccountTreeOutlined from "@mui/icons-material/AccountTreeOutlined";
import IconButton from "@mui/material/IconButton";

export function DiffTreeToggle({
	treeVisible,
	onToggleTree,
}: {
	treeVisible: boolean;
	onToggleTree: () => void;
}) {
	const label = treeVisible ? "Hide file tree" : "Show file tree";

	return (
		<IconButton
			size="small"
			onClick={onToggleTree}
			title={label}
			aria-label={label}
			aria-pressed={treeVisible}
			sx={{
				color: treeVisible ? "text.primary" : "text.disabled",
				"&:hover": { color: "text.primary" },
			}}
		>
			<AccountTreeOutlined sx={{ fontSize: 16 }} />
		</IconButton>
	);
}
