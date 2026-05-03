/**
 * Fixes common issues in LLM-generated JSON:
 * - Unescaped double quotes inside string values
 * - Literal newlines, carriage returns, tabs
 * - Other control characters (U+0000–U+001F)
 *
 * Strategy: walk char-by-char, tracking JSON context (object/array stack)
 * to distinguish keys from values. The colon `:` is only treated as a
 * string-closing structural character when parsing an object KEY —
 * inside VALUES it must not close the string, since Bulgarian educational
 * text often contains patterns like `"термин": обяснение`.
 */
export function sanitizeJsonFromLLM(raw: string): string {
  let out = "";
  let i = 0;
  const contextStack: Array<"object" | "array"> = [];
  let expectingKey = false;

  while (i < raw.length) {
    const c = raw[i];

    if (c !== '"') {
      if (c === '{') {
        contextStack.push("object");
        expectingKey = true;
      } else if (c === '[') {
        contextStack.push("array");
        expectingKey = false;
      } else if (c === '}' || c === ']') {
        contextStack.pop();
        expectingKey = false;
      } else if (c === ':') {
        expectingKey = false; // next string is a value
      } else if (c === ',') {
        expectingKey = contextStack.at(-1) === "object"; // next string in object is a key
      }
      out += c;
      i++;
      continue;
    }

    // Opening quote — determine if this string is a key or value
    const isKey = contextStack.at(-1) === "object" && expectingKey;

    out += '"';
    i++;

    while (i < raw.length) {
      const ch = raw[i];

      if (ch === "\\") {
        // Already-escaped sequence — pass through unchanged
        out += ch + (raw[i + 1] ?? "");
        i += 2;
      } else if (ch === '"') {
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
          peek === "\n" ||
          peek === "\r" ||
          (isKey && peek === ":"); // colon only structural when parsing a KEY
        if (isStructural) {
          out += '"';
          i++;
          break; // end of string
        } else {
          out += '\\"'; // embedded quote — escape it
          i++;
        }
      } else if (ch === "\n") {
        out += "\\n";
        i++;
      } else if (ch === "\r") {
        out += "\\r";
        i++;
      } else if (ch === "\t") {
        out += "\\t";
        i++;
      } else if (ch.charCodeAt(0) < 0x20) {
        out += "\\u" + ch.charCodeAt(0).toString(16).padStart(4, "0");
        i++;
      } else {
        out += ch;
        i++;
      }
    }
  }

  return out;
}
