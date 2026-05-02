/**
 * Fixes common issues in LLM-generated JSON:
 * - Unescaped double quotes inside string values
 * - Literal newlines, carriage returns, tabs
 * - Other control characters (U+0000–U+001F)
 *
 * Strategy: walk char-by-char, tracking whether we're inside a string.
 * When inside a string, escape any raw control characters and detect embedded
 * unescaped quotes by peeking at the next structural character.
 */
export function sanitizeJsonFromLLM(raw: string): string {
  let out = "";
  let i = 0;

  while (i < raw.length) {
    if (raw[i] !== '"') {
      out += raw[i++];
      continue;
    }

    // Opening quote of a JSON string
    out += '"';
    i++;

    while (i < raw.length) {
      const c = raw[i];

      if (c === "\\") {
        // Already-escaped sequence — pass through unchanged
        out += c + (raw[i + 1] ?? "");
        i += 2;
      } else if (c === '"') {
        // Is this the closing quote of the string?
        // Peek ahead (skip spaces/tabs) to find the next structural character.
        let j = i + 1;
        while (j < raw.length && (raw[j] === " " || raw[j] === "\t")) j++;
        const peek = raw[j] ?? "";
        const isStructural =
          peek === "" ||
          peek === "," ||
          peek === "}" ||
          peek === "]" ||
          peek === ":" ||
          peek === "\n" ||
          peek === "\r";
        if (isStructural) {
          out += '"';
          i++;
          break; // end of string
        } else {
          out += '\\"'; // embedded quote — escape it
          i++;
        }
      } else if (c === "\n") {
        out += "\\n";
        i++;
      } else if (c === "\r") {
        out += "\\r";
        i++;
      } else if (c === "\t") {
        out += "\\t";
        i++;
      } else if (c.charCodeAt(0) < 0x20) {
        out += "\\u" + c.charCodeAt(0).toString(16).padStart(4, "0");
        i++;
      } else {
        out += c;
        i++;
      }
    }
  }

  return out;
}
