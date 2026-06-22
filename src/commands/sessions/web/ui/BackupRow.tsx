import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import Tooltip from "@mui/material/Tooltip";
import type { BackupRow as BackupRowData } from "../../../../shared/db/listBackups";
import { formatBytes } from "./formatBytes";

function basename(filePath: string): string {
	return filePath.split(/[/\\]/).pop() ?? filePath;
}

export function BackupRow({ backup }: { backup: BackupRowData }) {
	return (
		<TableRow>
			<TableCell>{new Date(backup.createdAt).toLocaleString()}</TableCell>
			<TableCell sx={{ fontFamily: "monospace", wordBreak: "break-all" }}>
				<Tooltip title={backup.filePath}>
					<span>{basename(backup.filePath)}</span>
				</Tooltip>
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
