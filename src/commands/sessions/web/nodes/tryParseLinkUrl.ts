import { parseLinkUrl } from "../../nodes/parseLinkUrl";

export function tryParseLinkUrl(raw: string): string | null {
	try {
		return parseLinkUrl(raw);
	} catch {
		return null;
	}
}
