import { recordItemLine } from "./recordItemLine";

export function result(id: string, text: string): Promise<void> {
	return recordItemLine("result", id, text);
}
