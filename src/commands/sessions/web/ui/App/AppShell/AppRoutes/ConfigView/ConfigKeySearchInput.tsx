import CloseIcon from "@mui/icons-material/Close";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";

export function ConfigKeySearchInput({
	search,
	onChange,
}: {
	search: string;
	onChange: (search: string) => void;
}) {
	return (
		<TextField
			size="small"
			value={search}
			onChange={(e) => onChange(e.target.value)}
			placeholder="Search"
			sx={{ width: 240 }}
			slotProps={{
				htmlInput: { "aria-label": "Filter config keys and descriptions" },
				input: {
					sx: { fontSize: 12 },
					endAdornment: search ? (
						<IconButton
							size="small"
							aria-label="Clear config filter"
							onClick={() => onChange("")}
						>
							<CloseIcon fontSize="inherit" />
						</IconButton>
					) : undefined,
				},
			}}
		/>
	);
}
