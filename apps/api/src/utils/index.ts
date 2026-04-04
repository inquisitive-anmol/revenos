/**
 * General-purpose, framework-agnostic utilities.
 */

/** Extract only specified keys from an object. */
export function pick<T extends object, K extends keyof T>(
  obj: T,
  keys: K[],
): Pick<T, K> {
  return keys.reduce(
    (acc, key) => {
      if (key in obj) acc[key] = obj[key];
      return acc;
    },
    {} as Pick<T, K>,
  );
}

/** Exclude specified keys from an object (e.g. strip passwords before responding). */
export function omit<T extends object, K extends keyof T>(
  obj: T,
  keys: K[],
): Omit<T, K> {
  const result = { ...obj };
  keys.forEach((key) => delete result[key]);
  return result as Omit<T, K>;
}

/** Sleep for N milliseconds. */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Parse a comma-separated env string into a trimmed, non-empty string array. */
export function parseCSV(val: string): string[] {
  return val
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Safely parse a boolean from an env string. */
export function parseBool(val: string | undefined, fallback = false): boolean {
  if (val === undefined) return fallback;
  return ['true', '1', 'yes'].includes(val.toLowerCase());
}

/** Returns true if the value is a non-null, non-undefined object. */
export function isObject(val: unknown): val is Record<string, unknown> {
  return typeof val === 'object' && val !== null && !Array.isArray(val);
}
