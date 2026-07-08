const ITEM_ID_ENV = "ASSIST_BACKLOG_ITEM_ID";

export function resolveSessionItemId(): number | null {
	const raw = process.env[ITEM_ID_ENV];
	if (!raw) return null;
	const id = Number.parseInt(raw, 10);
	return Number.isInteger(id) && id > 0 ? id : null;
}
