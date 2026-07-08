import type { GitRefRow } from "../../shared/db/schema";
import type { Relations } from "./loadRelations";
import type { BacklogItem, GitRef } from "./types";

function rowToGitRef(r: GitRefRow): GitRef {
	const ref: GitRef = {
		kind: r.kind as GitRef["kind"],
		ref: r.ref,
	};
	if (r.title != null) ref.title = r.title;
	if (r.url != null) ref.url = r.url;
	if (r.state != null) ref.state = r.state;
	if (r.createdAt != null) ref.createdAt = new Date(r.createdAt).toISOString();
	return ref;
}

export function attachGitRefs(
	item: BacklogItem,
	rel: Relations,
	id: number,
): void {
	const gitRefs = (rel.gitRefs.get(id) ?? []).map(rowToGitRef);
	if (gitRefs.length > 0) item.gitRefs = gitRefs;
}
