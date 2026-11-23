import { asc } from "drizzle-orm";
import { items } from "../../shared/db/schema";

export const itemOrder = [
	asc(items.origin),
	asc(items.priority),
	asc(items.id),
] as const;
