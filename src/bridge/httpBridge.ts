import type { HistoryFilter, HttpExchange, ReplayOptions, RepPlusBridge } from "./types.js";

export class RepPlusHttpBridge implements RepPlusBridge {
  constructor(
    private readonly baseUrl = process.env.REPPLUS_BRIDGE_URL ?? "http://127.0.0.1:8765",
    private readonly token = process.env.REPPLUS_BRIDGE_TOKEN,
  ) {}

  async listHistory(filter: HistoryFilter = {}): Promise<HttpExchange[]> {
    const url = new URL("/v1/history", this.baseUrl);
    for (const [key, value] of Object.entries(filter)) {
      if (value !== undefined) url.searchParams.set(key, String(value));
    }
    return this.request<HttpExchange[]>(url);
  }

  async getExchange(id: string): Promise<HttpExchange | null> {
    const res = await fetch(new URL(`/v1/history/${encodeURIComponent(id)}`, this.baseUrl), {
      headers: this.headers(),
    });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`rep+ bridge error ${res.status}: ${await res.text()}`);
    return (await res.json()) as HttpExchange;
  }

  async searchHistory(query: string, filter: HistoryFilter = {}): Promise<HttpExchange[]> {
    return this.listHistory({ ...filter, text: query });
  }

  async replay(id: string, overrides: ReplayOptions): Promise<HttpExchange> {
    if (process.env.REPPLUS_ALLOW_REPLAY !== "1") {
      throw new Error("Replay is disabled. Set REPPLUS_ALLOW_REPLAY=1 to enable active requests.");
    }
    return this.request<HttpExchange>(new URL(`/v1/history/${encodeURIComponent(id)}/replay`, this.baseUrl), {
      method: "POST",
      body: JSON.stringify(overrides),
    });
  }

  private headers(): Record<string, string> {
    return {
      "content-type": "application/json",
      ...(this.token ? { authorization: `Bearer ${this.token}` } : {}),
    };
  }

  private async request<T>(url: URL, init: RequestInit = {}): Promise<T> {
    const res = await fetch(url, {
      ...init,
      headers: { ...this.headers(), ...(init.headers ?? {}) },
    });
    if (!res.ok) throw new Error(`rep+ bridge error ${res.status}: ${await res.text()}`);
    return (await res.json()) as T;
  }
}
