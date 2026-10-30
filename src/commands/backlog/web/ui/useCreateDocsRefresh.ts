import { useState } from "react";
import { useNavigate } from "react-router";
import { createDocsRefresh } from "./api";
import { itemDetailPath } from "./itemDetailPath";

export function useCreateDocsRefresh(
	cwd: string | undefined,
	node: string | undefined,
	onDone: () => void,
): { creating: boolean; create: () => Promise<void> } {
	const navigate = useNavigate();
	const [creating, setCreating] = useState(false);
	const create = async () => {
		setCreating(true);
		try {
			const result = await createDocsRefresh(cwd, node);
			if (result.outcome !== "nothing-unswept")
				navigate(itemDetailPath(result.id, cwd, node));
		} finally {
			setCreating(false);
			onDone();
		}
	};
	return { creating, create };
}
