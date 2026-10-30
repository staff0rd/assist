const DATABASE_URL_ENV = "ASSIST_DATABASE_URL";

const MISSING_URL_MESSAGE = `No assist database configured.

Assist storage requires a Postgres-compatible connection string. Set one via either:
  • the ${DATABASE_URL_ENV} environment variable, or
  • database.url in ~/.assist.yml

Example:
  database:
    url: postgresql://user:password@host:5432/database

Managed Postgres providers such as Supabase or Neon work out of the box.`;

export class MissingDatabaseUrlError extends Error {
	constructor() {
		super(MISSING_URL_MESSAGE);
		this.name = "MissingDatabaseUrlError";
	}
}
