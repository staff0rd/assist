import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import InputBase from "@mui/material/InputBase";

const fieldSx = {
	display: "flex",
	alignItems: "center",
	gap: 0.5,
	flex: "1 1 90px",
	maxWidth: 260,
	minWidth: 90,
	height: 28,
	pl: 0.75,
	borderRadius: 1,
	bgcolor: "action.hover",
} as const;

export function DiffFileSearchField({
	search,
	onChange,
	onDismiss,
}: {
	search: string;
	onChange: (search: string) => void;
	onDismiss: () => void;
}) {
	return (
		<Box sx={fieldSx}>
			<SearchIcon sx={{ fontSize: 16, color: "text.disabled" }} />
			<InputBase
				autoFocus
				value={search}
				onChange={(event) => onChange(event.target.value)}
				onKeyDown={(event) => {
					if (event.key === "Escape") onDismiss();
				}}
				placeholder="Filter files"
				inputProps={{ "aria-label": "Filter files" }}
				sx={{ flex: 1, minWidth: 0, fontSize: 13 }}
			/>
			<IconButton
				size="small"
				title="Clear file filter"
				aria-label="Clear file filter"
				onClick={onDismiss}
				sx={{ color: "text.disabled", "&:hover": { color: "text.primary" } }}
			>
				<CloseIcon sx={{ fontSize: 14 }} />
			</IconButton>
		</Box>
	);
}
