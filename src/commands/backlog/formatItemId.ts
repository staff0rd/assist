export class InvalidItemIdError extends Error {
	override name = "InvalidItemIdError";
}

export function formatItemId(id: number | string): string {
	return `a${id}`;
}

const itemIdPattern = /^a?(\d+)$/;

export function parseItemId(input: string): number {
	const match = itemIdPattern.exec(input.trim());
	if (!match) {
		throw new InvalidItemIdError(
			`Invalid backlog item id "${input}" (e.g. a574 or 574).`,
		);
	}
	return Number.parseInt(match[1], 10);
}
