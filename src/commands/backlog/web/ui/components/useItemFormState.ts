import { useRef, useState } from "react";
import type { ItemFields } from "../submitForm";
import type { BacklogItem } from "../types";
import { getDefaults } from "./getDefaults";

export function useItemFormState(item?: BacklogItem) {
	const defaults = getDefaults(item);
	const [type, setType] = useState<"story" | "bug">(
		defaults.type as "story" | "bug",
	);
	const [name, setName] = useState(defaults.name);
	const [description, setDescription] = useState(defaults.description);
	const acRef = useRef<string[]>(defaults.ac);

	return {
		defaults,
		type,
		setType,
		name,
		setName,
		description,
		setDescription,
		setAc(v: string[]) {
			acRef.current = v;
		},
		fields(): ItemFields {
			return { type, name, description, criteria: acRef.current };
		},
	};
}
