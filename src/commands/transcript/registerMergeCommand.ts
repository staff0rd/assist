import type { Command } from "commander";
import { merge } from "./merge";

export function registerMergeCommand(cmd: Command): void {
	cmd
		.command("merge <path...>")
		.description(
			"Collapse several .vtt files into one transcript with NOTE provenance",
		)
		.option("--out <path>", "write the merged transcript to this path")
		.option(
			"--select <file|->",
			"keep/removed JSON naming the passages to keep (- for stdin)",
		)
		.option(
			"--no-provenance",
			"omit every NOTE: the Collapsed-from header, the per-passage source marks and the removed count",
		)
		.option(
			"--widen-audience",
			"delete the casual asides that fit the people in the call but not a reader who was not there: intensifiers, emphasis after a wh-word, standalone interjections and cues that are nothing but one",
		)
		.action(merge);
}
