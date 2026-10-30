import { getProjectRoot } from "../../shared/loadConfig";
import { findBacklogUp } from "./findBacklogUp";

let _backlogDir: string | undefined;

export function setBacklogDir(dir: string | undefined): void {
	_backlogDir = dir;
}

export function getBacklogDir(): string {
	return _backlogDir ?? findBacklogUp(process.cwd()) ?? getProjectRoot();
}
