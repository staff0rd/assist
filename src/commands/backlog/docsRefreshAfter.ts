import { loadConfigFrom } from "../../shared/loadConfigFrom";
import { getBacklogDir } from "./getBacklogDir";

export function docsRefreshAfter(): number | undefined {
	try {
		return loadConfigFrom(getBacklogDir()).docs?.refreshAfter;
	} catch {
		return undefined;
	}
}
