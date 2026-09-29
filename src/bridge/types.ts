export type HeaderMap = Record<string, string>;

export interface HttpRequestRecord {
  id: string;
  timestamp: string;
  method: string;
  url: string;
  host: string;
  path: string;
  headers: HeaderMap;
  body?: string;
}

export interface HttpResponseRecord {
  requestId: string;
  status: number;
  headers: HeaderMap;
  body?: string;
  durationMs?: number;
}

export interface HttpExchange {
  request: HttpRequestRecord;
  response?: HttpResponseRecord;
}

export interface HistoryFilter {
  host?: string;
  method?: string;
  status?: number;
  text?: string;
  limit?: number;
  offset?: number;
}

export interface ReplayOptions {
  method?: string;
  url?: string;
  headers?: HeaderMap;
  body?: string;
}

export interface RepPlusBridge {
  listHistory(filter?: HistoryFilter): Promise<HttpExchange[]>;
  getExchange(id: string): Promise<HttpExchange | null>;
  searchHistory(query: string, filter?: HistoryFilter): Promise<HttpExchange[]>;
  replay(id: string, overrides: ReplayOptions): Promise<HttpExchange>;
}
