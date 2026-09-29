import type { HttpExchange } from "../bridge/types.js";

export function endpointInventory(exchanges: HttpExchange[]) {
  const map = new Map<string, { method: string; host: string; path: string; count: number; statuses: Set<number> }>();
  for (const exchange of exchanges) {
    const r = exchange.request;
    const key = `${r.method} ${r.host}${r.path}`;
    const entry = map.get(key) ?? { method: r.method, host: r.host, path: r.path, count: 0, statuses: new Set<number>() };
    entry.count += 1;
    if (exchange.response) entry.statuses.add(exchange.response.status);
    map.set(key, entry);
  }
  return [...map.values()].map((x) => ({ ...x, statuses: [...x.statuses].sort() }));
}

export function parameterInventory(exchanges: HttpExchange[]) {
  const found = new Map<string, { name: string; locations: Set<string>; endpoints: Set<string>; count: number }>();
  const add = (name: string, location: string, endpoint: string) => {
    if (!name) return;
    const key = name.toLowerCase();
    const item = found.get(key) ?? { name, locations: new Set<string>(), endpoints: new Set<string>(), count: 0 };
    item.locations.add(location);
    item.endpoints.add(endpoint);
    item.count += 1;
    found.set(key, item);
  };

  for (const exchange of exchanges) {
    const r = exchange.request;
    const endpoint = `${r.method} ${r.host}${r.path}`;
    const url = new URL(r.url);
    for (const name of url.searchParams.keys()) add(name, "query", endpoint);
    for (const name of Object.keys(r.headers)) add(name, "header", endpoint);

    const contentType = Object.entries(r.headers).find(([k]) => k.toLowerCase() === "content-type")?.[1] ?? "";
    if (r.body && contentType.includes("application/json")) {
      try {
        const walk = (value: unknown, prefix = "") => {
          if (!value || typeof value !== "object") return;
          for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
            const path = prefix ? `${prefix}.${key}` : key;
            add(path, "json", endpoint);
            walk(child, path);
          }
        };
        walk(JSON.parse(r.body));
      } catch { /* malformed JSON: ignore */ }
    } else if (r.body && contentType.includes("application/x-www-form-urlencoded")) {
      for (const name of new URLSearchParams(r.body).keys()) add(name, "form", endpoint);
    }
  }

  return [...found.values()].map((x) => ({
    name: x.name,
    locations: [...x.locations].sort(),
    endpoints: [...x.endpoints].sort(),
    count: x.count,
  }));
}

export function reflections(exchanges: HttpExchange[]) {
  const results: Array<{ requestId: string; parameter: string; location: string; value: string; url: string }> = [];
  const candidates = (exchange: HttpExchange) => {
    const list: Array<[string, string, string]> = [];
    const url = new URL(exchange.request.url);
    for (const [name, value] of url.searchParams.entries()) list.push([name, "query", value]);
    const ct = Object.entries(exchange.request.headers).find(([k]) => k.toLowerCase() === "content-type")?.[1] ?? "";
    if (exchange.request.body && ct.includes("application/x-www-form-urlencoded")) {
      for (const [name, value] of new URLSearchParams(exchange.request.body).entries()) list.push([name, "form", value]);
    }
    if (exchange.request.body && ct.includes("application/json")) {
      try {
        const walk = (v: unknown, prefix = "") => {
          if (!v || typeof v !== "object") return;
          for (const [k, child] of Object.entries(v as Record<string, unknown>)) {
            const p = prefix ? `${prefix}.${k}` : k;
            if (["string", "number", "boolean"].includes(typeof child)) list.push([p, "json", String(child)]);
            else walk(child, p);
          }
        };
        walk(JSON.parse(exchange.request.body));
      } catch { /* ignore */ }
    }
    return list;
  };

  for (const exchange of exchanges) {
    const body = exchange.response?.body ?? "";
    if (!body) continue;
    for (const [parameter, location, value] of candidates(exchange)) {
      if (value.length >= 3 && body.includes(value)) {
        results.push({ requestId: exchange.request.id, parameter, location, value, url: exchange.request.url });
      }
    }
  }
  return results;
}
