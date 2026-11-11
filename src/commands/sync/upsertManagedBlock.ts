export const MANAGED_BLOCK_BEGIN =
	"# >>> assist codex hooks (managed) — do not edit >>>";

export const MANAGED_BLOCK_END = "# <<< assist codex hooks (managed) <<<";

const TABLE_HEADER = /^\s*\[/;

const MANAGED_HEADER = /^\s*\[\[\s*hooks\.[A-Za-z]+(\.hooks)?\s*\]\]\s*$/;

export function upsertManagedBlock(existing: string, body: string): string {
	const block = `${MANAGED_BLOCK_BEGIN}\n${body.trim()}\n${MANAGED_BLOCK_END}`;
	const begin = existing.indexOf(MANAGED_BLOCK_BEGIN);
	if (begin === -1) {
		const base = existing.replace(/\s*$/, "");
		return base ? `${base}\n\n${block}\n` : `${block}\n`;
	}
	const endMarker = existing.indexOf(MANAGED_BLOCK_END, begin);
	const innerEnd = endMarker === -1 ? existing.length : endMarker;
	const after =
		endMarker === -1 ? existing.length : endMarker + MANAGED_BLOCK_END.length;
	const foreign = splitForeignTables(
		existing.slice(begin + MANAGED_BLOCK_BEGIN.length, innerEnd),
	);
	const before = existing.slice(0, begin).replace(/\s*$/, "");
	const rest = [foreign, existing.slice(after).trim()]
		.filter(Boolean)
		.join("\n\n");
	const head = before ? `${before}\n\n${block}` : block;
	return rest ? `${head}\n\n${rest}\n` : `${head}\n`;
}

function splitForeignTables(inner: string): string {
	const lines = inner.split("\n");
	const start = lines.findIndex(
		(line) => TABLE_HEADER.test(line) && !MANAGED_HEADER.test(line),
	);
	return start === -1 ? "" : lines.slice(start).join("\n").trim();
}
