import Link from "@mui/material/Link";
import Tooltip from "@mui/material/Tooltip";
import { useEffect, useState } from "react";
import { Link as RouterLink } from "react-router";
import type { BackupRow } from "../../../../shared/db/listBackups";
import { formatRelativeTime } from "./formatRelativeTime";

async function fetchLatestBackup(): Promise<BackupRow | undefined> {
	const res = await fetch("/api/backups/list");
	const backups: BackupRow[] = await res.json();
	return backups[0];
}

/** 'Last backed up <relative>' link to the /backups view; hidden until a backup exists. */
export function LastBackedUp() {
	const [latest, setLatest] = useState<BackupRow>();

	useEffect(() => {
		fetchLatestBackup().then(setLatest);
	}, []);

	if (!latest) return null;

	return (
		<Tooltip title={new Date(latest.createdAt).toLocaleString()}>
			<Link
				component={RouterLink}
				to="/backups"
				underline="hover"
				color="text.secondary"
				variant="body2"
			>
				Last backed up {formatRelativeTime(String(latest.createdAt))}
			</Link>
		</Tooltip>
	);
}
