import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import type { BackupRow as BackupRowData } from "../../../../shared/db/listBackups";
import { BackupRow } from "./BackupRow";

export function BackupsTable({ backups }: { backups: BackupRowData[] }) {
	return (
		<TableContainer component={Paper}>
			<Table size="small">
				<TableHead>
					<TableRow>
						<TableCell>Time</TableCell>
						<TableCell>File</TableCell>
						<TableCell align="right">Size</TableCell>
						<TableCell align="right">Duration</TableCell>
					</TableRow>
				</TableHead>
				<TableBody>
					{backups.map((backup) => (
						<BackupRow key={backup.id} backup={backup} />
					))}
				</TableBody>
			</Table>
		</TableContainer>
	);
}
