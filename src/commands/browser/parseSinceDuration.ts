import { InvalidArgumentError } from "commander";
import { parseDuration } from "../../shared/parseDuration";

export function parseSinceDuration(value: string): number {
	try {
		return parseDuration(value);
	} catch (error) {
		throw new InvalidArgumentError((error as Error).message);
	}
}
