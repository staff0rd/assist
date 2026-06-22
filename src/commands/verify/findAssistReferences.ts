type AssistReference = { list: "allow" | "deny"; entry: string };

function offendingEntries(list: unknown): string[] {
	if (!Array.isArray(list)) return [];
	return list.filter(
		(entry): entry is string =>
			typeof entry === "string" && /\bassist\b/.test(entry),
	);
}

/**
 * Find every `permissions.allow`/`permissions.deny` entry that references the
 * `assist` binary. The hooks block is intentionally ignored because it
 * legitimately invokes assist; only the permission lists are guarded.
 */
export function findAssistReferences(settings: unknown): AssistReference[] {
	const permissions =
		(settings as { permissions?: { allow?: unknown; deny?: unknown } })
			?.permissions ?? {};
	return [
		...offendingEntries(permissions.allow).map(
			(entry): AssistReference => ({ list: "allow", entry }),
		),
		...offendingEntries(permissions.deny).map(
			(entry): AssistReference => ({ list: "deny", entry }),
		),
	];
}
