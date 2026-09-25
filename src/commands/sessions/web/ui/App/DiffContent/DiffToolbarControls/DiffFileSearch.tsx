import SearchIcon from "@mui/icons-material/Search";
import IconButton from "@mui/material/IconButton";
import { useState } from "react";
import { DiffFileSearchField } from "./DiffFileSearch/DiffFileSearchField";

export function DiffFileSearch({
	search,
	onChange,
}: {
	search: string;
	onChange: (search: string) => void;
}) {
	const [open, setOpen] = useState(false);

	if (open || search !== "")
		return (
			<DiffFileSearchField
				search={search}
				onChange={onChange}
				onDismiss={() => {
					onChange("");
					setOpen(false);
				}}
			/>
		);

	return (
		<IconButton
			size="small"
			title="Filter files by name"
			aria-label="Filter files by name"
			onClick={() => setOpen(true)}
			sx={{ color: "text.disabled", "&:hover": { color: "text.primary" } }}
		>
			<SearchIcon sx={{ fontSize: 16 }} />
		</IconButton>
	);
}
