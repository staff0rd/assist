import type { BackupRow } from "../../../../../../../shared/db/listBackups";
import { apiFetch } from "../../../apiFetch";
import { BackupsTable } from "./BackupsView/BackupsTable";
import { ListPage } from "./BackupsView/ListPage";

async function fetchBackups(): Promise<BackupRow[]> {
	const res = await apiFetch("/api/backups/list");
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
