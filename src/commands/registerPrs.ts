import type { Command } from "commander";
import { configHelp } from "../shared/configHelp";
import { prsConfigHelp } from "./prs/prsConfigHelp";
import { registerPrsComments } from "./registerPrsComments";
import { registerPrsEdit } from "./registerPrsEdit";
import { registerPrsRaise } from "./registerPrsRaise";
import { registerPrsStatus } from "./registerPrsStatus";
import { registerReadTime } from "./registerReadTime";
import { lazyAction } from "../shared/lazyAction";

export function registerPrs(program: Command): void {
	const prsCommand = program
		.command("prs")
		.description("Pull request utilities")
		.option("--open", "List only open pull requests")
		.option("--closed", "List only closed pull requests")
		.action(lazyAction(() => import("./prs/prs"), "prs"));

	registerPrsRaise(prsCommand);
	registerPrsStatus(prsCommand);
	registerPrsEdit(prsCommand);
	registerPrsComments(prsCommand);
	registerReadTime(prsCommand);

	configHelp(prsCommand, prsConfigHelp);
}
