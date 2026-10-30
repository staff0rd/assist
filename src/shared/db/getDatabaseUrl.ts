import { loadConfig } from "../loadConfig";
import { MissingDatabaseUrlError } from "./MissingDatabaseUrlError";

export function getDatabaseUrl(): string {
	const url = process.env.ASSIST_DATABASE_URL ?? loadConfig().database.url;
	if (!url) throw new MissingDatabaseUrlError();
	return url;
}
