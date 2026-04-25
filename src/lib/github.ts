const GITHUB_TOKEN = process.env.GITHUB_TOKEN!;
const GITHUB_OWNER = process.env.GITHUB_OWNER!;
const GITHUB_REPO = process.env.GITHUB_REPO!;

const BASE = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents`;

async function githubRequest(path: string, options: RequestInit = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `token ${GITHUB_TOKEN}`,
      Accept: "application/vnd.github.v3+json",
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  return res;
}

export async function readFile(path: string): Promise<{ content: string; sha: string } | null> {
  const res = await githubRequest(`/${path}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GitHub read error: ${res.status}`);
  const data = await res.json();
  const content = Buffer.from(data.content, "base64").toString("utf-8");
  return { content, sha: data.sha };
}

export async function writeFile(path: string, content: string, sha?: string): Promise<void> {
  const body: Record<string, string> = {
    message: `update ${path}`,
    content: Buffer.from(content, "utf-8").toString("base64"),
  };
  if (sha) body.sha = sha;

  const res = await githubRequest(`/${path}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
  if (res.status === 409 && !sha) {
    const existing = await readFile(path);
    if (existing) {
      await writeFile(path, content, existing.sha);
      return;
    }
  }
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`GitHub write error: ${res.status} ${err}`);
  }
}

export async function readBinaryFile(path: string): Promise<{ data: Buffer; sha: string } | null> {
  const res = await githubRequest(`/${path}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GitHub read error: ${res.status}`);
  const json = await res.json();
  const buffer = Buffer.from((json.content as string).replace(/\n/g, ""), "base64");
  return { data: buffer, sha: json.sha };
}

export async function readJSON<T>(path: string): Promise<{ data: T; sha: string } | null> {
  const result = await readFile(path);
  if (!result) return null;
  return { data: JSON.parse(result.content) as T, sha: result.sha };
}

export async function writeJSON(path: string, data: unknown, sha?: string): Promise<void> {
  await writeFile(path, JSON.stringify(data, null, 2), sha);
}

export async function listDirectory(path: string): Promise<{ name: string; sha: string; type: "file" | "dir" }[]> {
  const res = await githubRequest(`/${path}`);
  if (res.status === 404) return [];
  if (!res.ok) throw new Error(`GitHub list error: ${res.status}`);
  const data = await res.json();
  if (!Array.isArray(data)) return [];
  return data.map((item: { name: string; sha: string; type: string }) => ({
    name: item.name,
    sha: item.sha,
    type: item.type as "file" | "dir",
  }));
}

export async function deleteFile(path: string, sha: string): Promise<void> {
  const res = await githubRequest(`/${path}`, {
    method: "DELETE",
    body: JSON.stringify({ message: `delete ${path}`, sha }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`GitHub delete error: ${res.status} ${err}`);
  }
}

export async function copyFile(fromPath: string, toPath: string): Promise<void> {
  const res = await githubRequest(`/${fromPath}`);
  if (!res.ok) throw new Error(`GitHub copy read error: ${res.status}`);
  const data = await res.json();
  // data.content е вече base64 (с newlines от GitHub) — запазваме го директно
  const rawBase64 = (data.content as string).replace(/\n/g, "");
  const writeRes = await githubRequest(`/${toPath}`, {
    method: "PUT",
    body: JSON.stringify({ message: `copy to ${toPath}`, content: rawBase64 }),
  });
  if (!writeRes.ok) {
    const err = await writeRes.text();
    throw new Error(`GitHub copy write error: ${writeRes.status} ${err}`);
  }
}

export async function writeBinaryFile(path: string, base64Content: string, sha?: string): Promise<void> {
  const body: Record<string, string> = {
    message: `update ${path}`,
    content: base64Content,
  };
  if (sha) body.sha = sha;

  const res = await githubRequest(`/${path}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
  if (res.status === 409 && !sha) {
    const existing = await readBinaryFile(path);
    if (existing) {
      await writeBinaryFile(path, base64Content, existing.sha);
      return;
    }
  }
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`GitHub write error: ${res.status} ${err}`);
  }
}
