import { existsSync, readFileSync } from "node:fs";
import chalk from "chalk";
import type { z } from "zod";
import { ZodError } from "zod";
import { backlogItemSchema } from "../types";

const addItemSchema = backlogItemSchema.omit({ id: true, status: true });
type AddItem = z.infer<typeof addItemSchema>;

function readJsonFile(filePath: string): unknown | undefined {
	if (!existsSync(filePath)) {
		console.log(chalk.red(`File not found: ${filePath}`));
		process.exitCode = 1;
		return undefined;
	}
	let raw: string;
	try {
		raw = readFileSync(filePath, "utf-8");
	} catch {
		console.log(chalk.red(`Failed to read file: ${filePath}`));
		process.exitCode = 1;
		return undefined;
	}
	try {
		return JSON.parse(raw) as unknown;
	} catch {
		console.log(chalk.red(`Invalid JSON in file: ${filePath}`));
		process.exitCode = 1;
		return undefined;
	}
}

function formatZodError(err: unknown): void {
	if (err instanceof ZodError) {
		console.log(chalk.red("Invalid backlog item schema:"));
		for (const issue of err.issues) {
			console.log(chalk.red(`  - ${issue.path.join(".")}: ${issue.message}`));
		}
	} else {
		console.log(chalk.red("Invalid backlog item schema."));
	}
}

export function parseItemFile(filePath: string): AddItem | undefined {
	const parsed = readJsonFile(filePath);
	if (parsed === undefined) return undefined;
	try {
		return addItemSchema.parse(parsed);
	} catch (err) {
		formatZodError(err);
		process.exitCode = 1;
		return undefined;
	}
}
