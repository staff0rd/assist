import type { BackupRow } from "../../../../shared/db/listBackups";
import { BackupsTable } from "./BackupsTable";
import { ListPage } from "./ListPage";

async function fetchBackups(): Promise<BackupRow[]> {
	const res = await fetch("/api/backups/list");
	return res.json();
}

export function BackupsView() {
	return (
		<ListPage
			title="Backups"
			emptyMessage="No backups recorded yet."
			fetchRows={fetchBackups}
		>
			{(backups) => <BackupsTable backups={backups} />}
		</ListPage>
	);
}
