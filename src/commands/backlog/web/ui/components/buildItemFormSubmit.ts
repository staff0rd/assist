import type { FormEvent } from "react";
import type { BacklogItem } from "../types";
import { handleSubmit } from "./getDefaults";

type Args = {
	type: "story" | "bug";
	name: string;
	description: string;
	criteria: string[];
	item: BacklogItem | undefined;
	cwd: string | undefined;
	onSaved: (id: number) => void | Promise<void>;
};

export function buildItemFormSubmit(args: Args) {
	return (e: FormEvent<HTMLFormElement>) =>
		handleSubmit(
			e,
			args.type,
			args.name,
			args.description,
			args.criteria,
			args.item,
			args.cwd,
			args.onSaved,
		);
}
