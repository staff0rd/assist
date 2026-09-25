import FilterListIcon from "@mui/icons-material/FilterList";
import Badge from "@mui/material/Badge";
import IconButton from "@mui/material/IconButton";
import {
	diffChangeTypeLabel,
	diffChangeTypeOptions,
	toDiffChangeType,
} from "./diffChangeTypeOptions";
import { DiffOptionMenu } from "./DiffOptionMenu";
import type { DiffChangeType } from "./filterDiffFiles";
import { useMenuAnchor } from "./useMenuAnchor";

export function DiffChangeTypeMenu({
	changeType,
	onChange,
}: {
	changeType: DiffChangeType;
	onChange: (changeType: DiffChangeType) => void;
}) {
	const menu = useMenuAnchor();
	const filtered = changeType !== "all";
	const label = filtered
		? `Change type: ${diffChangeTypeLabel(changeType)}`
		: "Filter by change type";

	return (
		<>
			<IconButton
				size="small"
				title={label}
				aria-label={label}
				aria-haspopup="true"
				aria-expanded={menu.isOpen}
				onClick={menu.open}
				sx={{
					color: filtered ? "text.primary" : "text.disabled",
					"&:hover": { color: "text.primary" },
				}}
			>
				<Badge variant="dot" color="primary" invisible={!filtered}>
					<FilterListIcon sx={{ fontSize: 16 }} />
				</Badge>
			</IconButton>
			<DiffOptionMenu
				anchorEl={menu.anchorEl}
				options={diffChangeTypeOptions}
				selected={changeType}
				onClose={menu.close}
				onPick={(value) => onChange(toDiffChangeType(value))}
			/>
		</>
	);
}
