export type HeaderMap = Record<string, string>;

export interface HttpRequestRecord {
  id: string; timestamp: string; method: string; url: string; host: string; path: string;
  headers: HeaderMap; body?: string;
}
export interface HttpResponseRecord {
  requestId: string; status: number; headers: HeaderMap; body?: string; durationMs?: number;
}
export interface HttpExchange { request: HttpRequestRecord; response?: HttpResponseRecord; }
export interface HistoryFilter {
  host?: string; method?: string; status?: number; text?: string; limit?: number; offset?: number;
  starred?: boolean; tag?: string;
}
export interface ReplayOptions { method?: string; url?: string; headers?: HeaderMap; body?: string; }
export type BulkAttackType = "sniper" | "battering-ram" | "pitchfork" | "cluster-bomb";
export interface PayloadPosition {
  marker: string;
  type: "simple-list" | "numbers";
  list?: string[];
  numbers?: { from: number; to: number; step: number };
}
export interface BulkReplayOptions {
  requestId: string; attackType: BulkAttackType; positions: PayloadPosition[]; concurrency?: number;
}
export interface WorkspaceMutation { requestId: string; value?: string | boolean | null; }
export interface BridgeInfo { version: string; upstreamVersion?: string; capabilities: string[]; }

export interface RepPlusBridge {
  info(): Promise<BridgeInfo>;
  listHistory(filter?: HistoryFilter): Promise<HttpExchange[]>;
  getExchange(id: string): Promise<HttpExchange | null>;
  searchHistory(query: string, filter?: HistoryFilter): Promise<HttpExchange[]>;
  replay(id: string, overrides: ReplayOptions): Promise<HttpExchange>;
  action<T = unknown>(name: string, payload?: unknown): Promise<T>;
}
