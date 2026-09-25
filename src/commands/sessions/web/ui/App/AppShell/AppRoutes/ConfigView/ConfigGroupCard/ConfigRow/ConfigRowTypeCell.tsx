import EditIcon from "@mui/icons-material/Edit";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import TableCell from "@mui/material/TableCell";
import Tooltip from "@mui/material/Tooltip";
import type { ConfigEntry } from "../../../../../../../../../config/readConfigEntries";
import { ConfigSourceChip } from "./ConfigSourceChip";

type Props = {
	entry: ConfigEntry;
	readOnly: boolean;
	canEdit: boolean;
	onEdit: () => void;
};

export function ConfigRowTypeCell({ entry, readOnly, canEdit, onEdit }: Props) {
	return (
		<TableCell align="right" sx={{ verticalAlign: "top" }}>
			<Stack
				direction="row"
				spacing={0.5}
				sx={{ justifyContent: "flex-end", alignItems: "center" }}
			>
				<ConfigSourceChip source={entry.source} repoKey={entry.repoKey} />
				{readOnly && <Chip size="small" variant="outlined" label="read-only" />}
				{canEdit && (
					<Tooltip title={`Edit ${entry.key}`}>
						<span>
							<IconButton
								size="small"
								aria-label={`Edit ${entry.key}`}
								onClick={onEdit}
							>
								<EditIcon fontSize="inherit" />
							</IconButton>
						</span>
					</Tooltip>
				)}
			</Stack>
		</TableCell>
	);
}
