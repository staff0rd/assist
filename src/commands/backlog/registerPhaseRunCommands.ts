import type { Command } from "commander";
import { registerLandCommand } from "./registerLandCommand";
import { registerRunPhaseCommand } from "./registerRunPhaseCommand";

export function registerPhaseRunCommands(cmd: Command): void {
	registerRunPhaseCommand(cmd);
	registerLandCommand(cmd);
}
