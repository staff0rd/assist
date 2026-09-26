import { sessionRefKeys } from "./isLinkCreate";
import { splitNodeSessionId } from "./splitNodeSessionId";

type Msg = Record<string, unknown>;

export function toPeerMessage(data: Msg): Msg {
	const { node: _node, ...stripped } = data;
	for (const key of sessionRefKeys(data.type)) {
		const value = stripped[key];
		if (typeof value !== "string") continue;
		stripped[key] = splitNodeSessionId(value)?.id ?? value;
	}
	return stripped;
}
