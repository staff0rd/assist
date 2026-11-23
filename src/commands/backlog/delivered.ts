import { recordItemLine } from "./recordItemLine";

export function delivered(id: string, text: string): Promise<void> {
	return recordItemLine("delivered", id, text);
}
