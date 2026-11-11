import { readFileSync } from "node:fs";
import { createProgram } from "../../createProgram";
import { docsPaths } from "../docsPaths";
import { collectAgentCommands } from "./collectAgentCommands";
import { collectCliCommands } from "./collectCliCommands";
import { collectConfigKeys } from "./collectConfigKeys";
import { collectWebRoutes } from "./collectWebRoutes";
import type { InventoryItem } from "./InventoryItem";

export function collectDocsInventory(): InventoryItem[] {
	return [
		...collectCliCommands(createProgram()),
		...collectAgentCommands(docsPaths.agentDir),
		...collectConfigKeys(),
		...collectWebRoutes(readFileSync(docsPaths.appRoutes, "utf8")),
	];
}
