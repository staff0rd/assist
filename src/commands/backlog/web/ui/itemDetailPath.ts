import { formatItemId } from "../../formatItemId";

export function itemDetailPath(id: number, cwd?: string): string {
	const base = `/backlog/items/${formatItemId(id)}`;
	return cwd ? `${base}?cwd=${encodeURIComponent(cwd)}` : base;
}
