/* Structured logging (openspec next-deployment § Observability). One JSON line
 * per event on stdout (info) / stderr (warn, error). Keys that carry secret
 * material are redacted by name at any depth so a log line can never contain
 * the webhook secret or a signature. */

export type Level = "info" | "warn" | "error";
export type Fields = Record<string, unknown>;

const REDACT =
  /(^|[_-])(secret|signature|authorization|token|password|cookie)($|[_-])|^x-chapter-signature$/i;

export function redact(value: unknown, depth = 0): unknown {
  if (depth > 6) return "[truncated]";
  if (value instanceof Error) return { name: value.name, message: value.message };
  if (Array.isArray(value)) return value.map((v) => redact(v, depth + 1));
  if (value && typeof value === "object") {
    const out: Fields = {};
    for (const [k, v] of Object.entries(value as Fields))
      out[k] = REDACT.test(k) ? "[redacted]" : redact(v, depth + 1);
    return out;
  }
  return value;
}

export interface Logger {
  info(event: string, fields?: Fields): void;
  warn(event: string, fields?: Fields): void;
  error(event: string, fields?: Fields): void;
}

export function createLogger({
  sink = defaultSink,
  now = () => new Date(),
}: { sink?: (line: string, level: Level) => void; now?: () => Date } = {}): Logger {
  const write = (level: Level, event: string, fields: Fields = {}) => {
    const line = JSON.stringify({
      level,
      time: now().toISOString(),
      event,
      ...(redact(fields) as Fields),
    });
    sink(line, level);
  };
  return {
    info: (event, fields) => write("info", event, fields),
    warn: (event, fields) => write("warn", event, fields),
    error: (event, fields) => write("error", event, fields),
  };
}

// console.* keeps the module Edge-compatible (instrumentation.ts is compiled for both runtimes).
function defaultSink(line: string, level: Level) {
  if (level === "info") console.log(line);
  else if (level === "warn") console.warn(line);
  else console.error(line);
}

export const logger: Logger = createLogger();
