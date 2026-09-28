import { stripAnsi } from "../../shared/stripAnsi";

export function lastLines(scrollback: string, count: number): string[] {
	const lines = stripAnsi(scrollback).split(/\r?\n/);
	if (lines.at(-1) === "") lines.pop();
	return lines.slice(-count);
}
