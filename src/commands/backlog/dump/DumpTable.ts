/** Format identifier embedded in every dump header. */
export const DUMP_FORMAT = "assist-backlog-dump";

/** Dump container format version. Bump on any breaking layout change. */
export const DUMP_VERSION = 1;

// why: name/columns hold pre-quoted identifiers (quote_ident) so reserved words like usage_peaks."window" interpolate into COPY/TRUNCATE SQL and round-trip without special-casing.
export type DumpTable = {
	name: string;
	columns: string[];
};
