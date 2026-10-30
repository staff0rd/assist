import { useEffect, useState } from "react";
import type { BackupRow } from "../../../../shared/db/listBackups";
import { apiFetch } from "./apiFetch";
import { formatRelativeTime } from "./formatRelativeTime";
import { BackupsLink } from "./LastBackedUp/BackupsLink";

type LatestBackup = { row: BackupRow | null; staleAfterMs: number };

async function fetchLatestBackup(): Promise<LatestBackup> {
	const [listRes, statusRes] = await Promise.all([
		apiFetch("/api/backups/list"),
		apiFetch("/api/backups/status"),
	]);
	const backups: BackupRow[] = await listRes.json();
	const { staleAfterMs }: { staleAfterMs: number } = await statusRes.json();
	return { row: backups[0] ?? null, staleAfterMs };
}

export function LastBackedUp() {
	const [latest, setLatest] = useState<LatestBackup>();

	useEffect(() => {
		fetchLatestBackup().then(setLatest);
	}, []);

	if (latest === undefined) return null;

	const { row, staleAfterMs } = latest;
	if (row === null)
		return (
			<BackupsLink warn tooltip="No backup has been recorded">
				Never backed up
			</BackupsLink>
		);

	const timestamp = new Date(row.createdAt).toLocaleString();
	const stale = Date.now() - new Date(row.createdAt).getTime() > staleAfterMs;

	return (
		<BackupsLink
			warn={stale}
			tooltip={
				stale ? `Backup overdue — last backed up ${timestamp}` : timestamp
			}
		>
			Last backed up {formatRelativeTime(String(row.createdAt))}
		</BackupsLink>
	);
}
