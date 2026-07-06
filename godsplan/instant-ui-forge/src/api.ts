// ============================================================================
// GodsPlan API client (Web) - talks to the Django REST backend.
//
// This is the ONLY file that knows about HTTP/endpoints. App.tsx uses the
// functions below and never calls fetch() directly, so swapping backends
// later only means editing this one file.
//
// The App/mobile frontend (link2layout) hits the exact same backend, so
// data created on Web (reviews, saved places, account, etc.) is visible on
// App immediately - they share one Postgres database.
// ============================================================================

const API_BASE_URL =
  (import.meta as any).env?.VITE_API_URL || "http://127.0.0.1:8000";

const TOKEN_KEY = "godsplan_web_token";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

function setToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export function isLoggedIn(): boolean {
  return !!getToken();
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> | undefined),
  };
  if (token) headers["Authorization"] = `Token ${token}`;

  const res = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    let detail = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      detail = body.detail || JSON.stringify(body);
    } catch {
      /* ignore */
    }
    throw new Error(detail);
  }
  if (res.status === 204) return undefined as unknown as T;
  return res.json();
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------
export interface AuthUser {
  id: number;
  username: string;
  email: string;
}

export async function registerUser(
  username: string,
  email: string,
  password: string
): Promise<AuthUser> {
  const data = await request<{ user: AuthUser; token: string }>(
    "/api/auth/register/",
    { method: "POST", body: JSON.stringify({ username, email, password }) }
  );
  setToken(data.token);
  return data.user;
}

export async function loginUser(
  username: string,
  password: string
): Promise<{ user_id: number; username: string }> {
  const data = await request<{ token: string; user_id: number; username: string }>(
    "/api/auth/login/",
    { method: "POST", body: JSON.stringify({ username, password }) }
  );
  setToken(data.token);
  return data;
}

export async function logoutUser(): Promise<void> {
  try {
    await request("/api/auth/logout/", { method: "POST" });
  } finally {
    setToken(null);
  }
}

export async function getMyProfile() {
  return request("/api/auth/profile/me/");
}

// ---------------------------------------------------------------------------
// Catalog (Places + Colleges) -> mapped into the app's "Node" shape
// ---------------------------------------------------------------------------
export interface ApiPlace {
  id: number;
  name: string;
  place_type: string;
  city: string;
  latitude: string;
  longitude: string;
  price_level: number;
  average_rating: string;
  review_count: number;
  popularity_score: number;
  cover_image: string | null;
  is_verified: boolean;
  distance_km?: number;
  description?: string;
}

export interface ApiCollege {
  id: number;
  name: string;
  city: string;
  programs_offered: string[];
  average_rating: string;
  review_count: number;
  popularity_score: number;
  has_hostel: boolean;
  has_mess: boolean;
  logo: string | null;
  distance_km?: number;
}

async function listPlaces(params: Record<string, string> = {}) {
  const qs = new URLSearchParams(params).toString();
  return request<{ results: ApiPlace[] } | ApiPlace[]>(
    `/api/catalog/places/${qs ? `?${qs}` : ""}`
  );
}

async function listColleges(params: Record<string, string> = {}) {
  const qs = new URLSearchParams(params).toString();
  return request<{ results: ApiCollege[] } | ApiCollege[]>(
    `/api/catalog/colleges/${qs ? `?${qs}` : ""}`
  );
}

function asArray<T>(payload: { results: T[] } | T[]): T[] {
  return Array.isArray(payload) ? payload : payload.results;
}

const PLACE_TYPE_TO_NODE_TYPE: Record<string, string> = {
  CAFE: "Cafe",
  RESTAURANT: "Cafe",
  STREET_FOOD: "Cafe",
  TOURIST_SPOT: "Secret Spot",
  HOSTEL: "PG",
  PG: "PG",
  MESS: "Thali",
  OTHER: "Secret Spot",
};

/**
 * Fetches real Places + Colleges from the Django backend and maps them into
 * the same `Node` shape the existing UI already renders, so the rest of
 * App.tsx (map, filters, cards) works unmodified against live data.
 */
export async function fetchDiscoveryNodes(): Promise<any[]> {
  const [placesRaw, collegesRaw] = await Promise.all([
    listPlaces(),
    listColleges(),
  ]);
  const places = asArray<ApiPlace>(placesRaw);
  const colleges = asArray<ApiCollege>(collegesRaw);

  const placeNodes = places.map((p, i) => ({
    id: `place-${p.id}`,
    name: p.name,
    category: "culinary" as const,
    type: PLACE_TYPE_TO_NODE_TYPE[p.place_type] || "Cafe",
    distance: p.distance_km ?? 1 + (i % 8),
    secrecy: p.is_verified ? "Public" : "Unlisted",
    focus: "High",
    description: p.description || `${p.place_type} in ${p.city}`,
    x: 10 + ((i * 37) % 80),
    y: 10 + ((i * 53) % 80),
    details: `${p.review_count} reviews · price level ${p.price_level}/4`,
    rating: `${p.average_rating} // Rating`,
    specialty: p.place_type,
  }));

  const collegeNodes = colleges.map((c, i) => ({
    id: `college-${c.id}`,
    name: c.name,
    category: "academic" as const,
    type: "College" as const,
    distance: c.distance_km ?? 2 + (i % 8),
    secrecy: "Public",
    focus: "Intellectual",
    description: `${c.programs_offered?.slice(0, 2).join(", ") || "Multiple programs"} · ${c.city}`,
    x: 15 + ((i * 41) % 75),
    y: 20 + ((i * 29) % 70),
    details: `${c.has_hostel ? "Hostel available. " : ""}${c.has_mess ? "Mess available." : ""}`,
    rating: `${c.average_rating} // Rating`,
    specialty: c.programs_offered?.[0] || "General",
  }));

  return [...placeNodes, ...collegeNodes];
}

// ---------------------------------------------------------------------------
// Global search - GET /api/search/
// ---------------------------------------------------------------------------
export async function globalSearch(query: string, city?: string) {
  const qs = new URLSearchParams({ q: query, ...(city ? { city } : {}) });
  return request(`/api/search/?${qs.toString()}`);
}

// ---------------------------------------------------------------------------
// Saved items (bookmarks) - shared with the App frontend
// ---------------------------------------------------------------------------
export async function toggleSavedNode(nodeId: string): Promise<boolean> {
  const [targetType, targetId] = nodeId.split("-");
  const type = targetType === "college" ? "college" : "place";
  try {
    await request("/api/catalog/saved-items/", {
      method: "POST",
      body: JSON.stringify({ target_type: type, target_id: Number(targetId) }),
    });
    return true;
  } catch (e) {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Reviews
// ---------------------------------------------------------------------------
export async function submitReview(
  nodeId: string,
  rating: number,
  body: string,
  title = ""
) {
  const [targetType, targetId] = nodeId.split("-");
  const type = targetType === "college" ? "college" : "place";
  return request("/api/reviews/", {
    method: "POST",
    body: JSON.stringify({
      target_type: type,
      target_id: Number(targetId),
      rating,
      title,
      body,
    }),
  });
}
