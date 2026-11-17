import type { IncomingMessage } from "node:http";
import type { z } from "zod";
import { readJsonBody } from "./readJsonBody";

export async function parseJsonBody<T extends z.ZodType>(
	req: IncomingMessage,
	schema: T,
): Promise<z.infer<T> | undefined> {
	const parsed = schema.safeParse(
		await readJsonBody(req).catch(() => undefined),
	);
	return parsed.success ? parsed.data : undefined;
}
