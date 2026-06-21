import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import type { BackupRow as BackupRowData } from "../../../../shared/db/listBackups";
import { formatBytes } from "./formatBytes";

export function BackupRow({ backup }: { backup: BackupRowData }) {
	return (
		<TableRow>
			<TableCell>{new Date(backup.createdAt).toLocaleString()}</TableCell>
			<TableCell sx={{ fontFamily: "monospace", wordBreak: "break-all" }}>
				{backup.filePath}
			</TableCell>
			<TableCell align="right">{formatBytes(backup.sizeBytes)}</TableCell>
			<TableCell align="right">
				{backup.durationMs == null
					? "—"
					: `${(backup.durationMs / 1000).toFixed(1)}s`}
			</TableCell>
		</TableRow>
	);
}
