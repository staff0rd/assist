import { randomUUID } from "node:crypto";

export const TRACE_HEADER = "x-assist-trace-id";

export function newTraceId(): string {
	return randomUUID().slice(0, 8);
}
