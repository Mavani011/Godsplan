// ============================================================================
// GodsPlan API client (App / mobile-style frontend) - talks to the SAME
// Django REST backend + Postgres database as the Web frontend
// (instant-ui-forge). Every exported function here keeps the exact name/
// signature the components already expect (they were originally written
// against firebase.ts), so no component files needed to change - only the
// data layer underneath was swapped from Firebase to the real backend.
//
// Because both frontends hit this one backend, anything a user saves,
// reviews, or bookmarks on the Web app shows up here too, and vice versa.
// ============================================================================

import { ContentItem, Review, UserProfile, AlertNotification } from './types';

const API_BASE_URL =
  (import.meta as any).env?.VITE_API_URL || 'http://127.0.0.1:8000';

const TOKEN_KEY = 'godsplan_app_token';
const USER_CACHE_KEY = 'godsplan_app_user';

function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}
function setToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}
function cacheUser(profile: UserProfile | null) {
  if (profile) localStorage.setItem(USER_CACHE_KEY, JSON.stringify(profile));
  else localStorage.removeItem(USER_CACHE_KEY);
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };
  if (token) headers['Authorization'] = `Token ${token}`;

  const res = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    let detail = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      detail =
        body.detail ||
        (Array.isArray(body.non_field_errors) ? body.non_field_errors[0] : null) ||
        Object.values(body)?.[0]?.toString() ||
        JSON.stringify(body);
    } catch {
      /* ignore parse failure, keep generic message */
    }
    throw new Error(detail);
  }
  if (res.status === 204) return undefined as unknown as T;
  return res.json();
}

function asArray<T>(payload: { results: T[] } | T[]): T[] {
  return Array.isArray(payload) ? payload : (payload as any).results;
}

// A fixed fallback location (Surat, Gujarat - matches the seed data) used
// when the CMS form doesn't collect real coordinates for a brand-new listing.
const FALLBACK_LAT = 21.1702;
const FALLBACK_LNG = 72.8311;

// ==========================================
// AUTHENTICATION OPERATIONS
// ==========================================

/** Django's User model needs a username; we use the email for simplicity. */
function usernameFromEmail(email: string) {
  return email.trim().toLowerCase();
}

export const signUpUser = async (
  email: string,
  password: string,
  displayName: string
): Promise<UserProfile> => {
  const data = await request<{ user: { id: number; username: string; email: string }; token: string }>(
    '/api/auth/register/',
    {
      method: 'POST',
      body: JSON.stringify({
        username: usernameFromEmail(email),
        email,
        password,
        first_name: displayName,
      }),
    }
  );
  setToken(data.token);
  const profile: UserProfile = {
    uid: String(data.user.id),
    email: data.user.email,
    displayName: displayName || data.user.username,
    preferences: { cuisine: [], education: [], destinations: [], aiIntensity: 70 },
  };
  cacheUser(profile);
  return profile;
};

export const signInUser = async (email: string, password: string): Promise<UserProfile> => {
  const data = await request<{ token: string; user_id: number; username: string }>(
    '/api/auth/login/',
    { method: 'POST', body: JSON.stringify({ username: usernameFromEmail(email), password }) }
  );
  setToken(data.token);

  // Pull the full profile (display name / saved prefs live server-side too).
  let displayName = data.username;
  try {
    const profileData: any = await request('/api/auth/profile/me/');
    if (profileData.username) displayName = profileData.username;
  } catch {
    /* profile endpoint optional - login still succeeds without it */
  }

  const profile: UserProfile = {
    uid: String(data.user_id),
    email,
    displayName,
    preferences: { cuisine: [], education: [], destinations: [], aiIntensity: 70 },
  };
  cacheUser(profile);
  return profile;
};

export const logoutUser = async (): Promise<void> => {
  try {
    await request('/api/auth/logout/', { method: 'POST' });
  } finally {
    setToken(null);
    cacheUser(null);
  }
};

export const getCurrentUserSync = (): UserProfile | null => {
  const cached = localStorage.getItem(USER_CACHE_KEY);
  if (!cached || !getToken()) return null;
  try {
    return JSON.parse(cached);
  } catch {
    return null;
  }
};

export const updatePreferences = async (userId: string, preferences: any): Promise<void> => {
  // Update the local cache immediately so the UI reflects the change...
  const current = getCurrentUserSync();
  if (current && current.uid === userId) {
    current.preferences = preferences;
    cacheUser(current);
  }
  // ...and best-effort sync a couple of overlapping fields to the real
  // profile server-side (desired_program from education picks). Non-fatal
  // if it fails - the app-level preferences above already saved locally.
  try {
    await request('/api/auth/profile/me/', {
      method: 'PATCH',
      body: JSON.stringify({
        desired_program: preferences?.education?.[0] || '',
        is_college_seeker: (preferences?.education?.length || 0) > 0,
      }),
    });
  } catch {
    /* ignore - non-critical sync */
  }
};

// ==========================================
// CONTENT (Places + Colleges -> ContentItem)
// ==========================================

function placeToContentItem(p: any): ContentItem {
  return {
    id: `place-${p.id}`,
    category: 'food',
    title: p.name,
    subtitle: p.place_type,
    description: p.description || `${p.place_type} in ${p.city}`,
    matchPercentage: Math.min(99, 60 + Math.round(Number(p.average_rating) * 8)),
    rating: Number(p.average_rating) || 4.5,
    distance: p.distance_km ? `${p.distance_km.toFixed(1)} km` : undefined,
    location: `${p.city}`,
    rank: p.is_verified ? 'Verified' : undefined,
    image: p.cover_image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
    details: {
      aiPerspective: p.description || `A popular ${p.place_type.toLowerCase()} spot in ${p.city}.`,
      priceGuide: '₹'.repeat(p.price_level || 1),
      stats: {
        'Rating': `${p.average_rating}`,
        'Reviews': `${p.review_count}`,
        'Popularity': `${p.popularity_score}`,
      },
    },
  };
}

function collegeToContentItem(c: any): ContentItem {
  return {
    id: `college-${c.id}`,
    category: 'college',
    title: c.name,
    subtitle: (c.programs_offered || [])[0] || 'Multiple programs',
    description: `${(c.programs_offered || []).join(', ')} · ${c.city}`,
    matchPercentage: Math.min(99, 60 + Math.round(Number(c.average_rating) * 8)),
    rating: Number(c.average_rating) || 4.5,
    distance: c.distance_km ? `${c.distance_km.toFixed(1)} km` : undefined,
    location: c.city,
    rank: c.is_verified ? 'Verified' : undefined,
    image: c.logo || 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800',
    details: {
      aiPerspective: `${c.name} offers ${(c.programs_offered || []).join(', ')}.`,
      stats: {
        'Rating': `${c.average_rating}`,
        'Reviews': `${c.review_count}`,
        'Hostel': c.has_hostel ? 'Yes' : 'No',
        'Mess': c.has_mess ? 'Yes' : 'No',
      },
      courses: (c.programs_offered || []).map((name: string) => ({
        name,
        duration: 'Varies',
        intake: 'Contact college',
      })),
    },
  };
}

export const getItems = async (): Promise<ContentItem[]> => {
  const [placesRaw, collegesRaw] = await Promise.all([
    request<any>('/api/catalog/places/'),
    request<any>('/api/catalog/colleges/'),
  ]);
  const places = asArray<any>(placesRaw).map(placeToContentItem);
  const colleges = asArray<any>(collegesRaw).map(collegeToContentItem);
  return [...places, ...colleges];
};

/**
 * Create or update a listing. Requires a Django *staff* account (set via
 * /admin/ or `createsuperuser`) because writes to the catalog are
 * moderator-only - see IsVerifiedModeratorOrReadOnly on the backend.
 */
export const saveItem = async (item: ContentItem): Promise<void> => {
  const isCollege = item.category === 'college';
  const [prefix, rawId] = item.id.split('-');
  const isExisting = (prefix === 'place' || prefix === 'college') && !!rawId;

  const commonPayload = {
    name: item.title,
    description: `${item.description}\n\n${item.details?.aiPerspective || ''}`.trim(),
    city: (item.location || 'Surat').split(',')[0].trim(),
  };

  if (isCollege) {
    const payload = {
      ...commonPayload,
      latitude: FALLBACK_LAT,
      longitude: FALLBACK_LNG,
      programs_offered: item.details?.courses?.map((c) => c.name) || [item.subtitle],
    };
    if (isExisting && prefix === 'college') {
      await request(`/api/catalog/colleges/${rawId}/`, { method: 'PATCH', body: JSON.stringify(payload) });
    } else {
      await request('/api/catalog/colleges/', { method: 'POST', body: JSON.stringify(payload) });
    }
  } else {
    const payload = {
      ...commonPayload,
      latitude: FALLBACK_LAT,
      longitude: FALLBACK_LNG,
      place_type: 'OTHER',
    };
    if (isExisting && prefix === 'place') {
      await request(`/api/catalog/places/${rawId}/`, { method: 'PATCH', body: JSON.stringify(payload) });
    } else {
      await request('/api/catalog/places/', { method: 'POST', body: JSON.stringify(payload) });
    }
  }
};

export const deleteItem = async (itemId: string): Promise<void> => {
  const [prefix, rawId] = itemId.split('-');
  const endpoint = prefix === 'college' ? 'colleges' : 'places';
  await request(`/api/catalog/${endpoint}/${rawId}/`, { method: 'DELETE' });
};

// ==========================================
// SAVED PLANS / BOOKMARKS
// ==========================================
export const getSavedPlans = async (_userId: string): Promise<string[]> => {
  try {
    const raw = await request<any>('/api/catalog/saved-items/');
    return asArray<any>(raw).map((s) => s.item_id);
  } catch {
    return [];
  }
};

export const toggleSavedPlan = async (_userId: string, itemId: string): Promise<boolean> => {
  const [targetType, targetIdStr] = itemId.split('-');
  const type = targetType === 'college' ? 'college' : 'place';
  const targetId = Number(targetIdStr);

  // Find out if it's already saved so we know whether to POST or DELETE.
  const raw = await request<any>('/api/catalog/saved-items/');
  const existing = asArray<any>(raw).find((s) => s.item_id === itemId);

  if (existing) {
    await request(`/api/catalog/saved-items/${existing.id}/`, { method: 'DELETE' });
    return false;
  } else {
    await request('/api/catalog/saved-items/', {
      method: 'POST',
      body: JSON.stringify({ target_type: type, target_id: targetId }),
    });
    return true;
  }
};

// ==========================================
// REVIEWS
// ==========================================
export const getReviews = async (itemId: string): Promise<Review[]> => {
  const [targetType, targetId] = itemId.split('-');
  const type = targetType === 'college' ? 'college' : 'place';
  try {
    const raw = await request<any>(
      `/api/reviews/?target_type=${type}&target_id=${targetId}`
    );
    return asArray<any>(raw).map((r) => ({
      id: String(r.id),
      itemId,
      userName: r.username || 'GodsPlan User',
      userAvatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=' + encodeURIComponent(r.username || 'user'),
      rating: r.rating,
      text: r.body,
      images: r.photo ? [r.photo] : [],
      timestamp: new Date(r.created_at).toLocaleDateString(),
      helpfulCount: r.helpful_count || 0,
    }));
  } catch {
    return [];
  }
};

export const addReview = async (review: Review): Promise<void> => {
  const [targetType, targetId] = review.itemId.split('-');
  const type = targetType === 'college' ? 'college' : 'place';
  await request('/api/reviews/', {
    method: 'POST',
    body: JSON.stringify({
      target_type: type,
      target_id: Number(targetId),
      rating: review.rating,
      body: review.text,
      title: '',
    }),
  });
};

// ==========================================
// ALERTS (backed by /api/notifications/)
// ==========================================
const NOTIF_TYPE_TO_ALERT_TYPE: Record<string, AlertNotification['type']> = {
  RECOMMENDATION: 'match',
  ORDER_UPDATE: 'urgent',
  REVIEW: 'social',
  SYSTEM: 'rating',
};

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export const getAlerts = async (): Promise<AlertNotification[]> => {
  try {
    const raw = await request<any>('/api/notifications/');
    return asArray<any>(raw)
      .filter((n) => !n.is_read)
      .map((n) => ({
        id: String(n.id),
        type: NOTIF_TYPE_TO_ALERT_TYPE[n.notification_type] || 'match',
        title: n.title,
        description: n.body,
        time: timeAgo(n.created_at),
      }));
  } catch {
    // Not logged in yet, or backend unreachable - empty inbox, not an error.
    return [];
  }
};

export const deleteAlert = async (alertId: string): Promise<void> => {
  // Notifications aren't hard-deletable via the API by design (they're an
  // audit trail) - "dismissing" marks it read, and getAlerts() only returns
  // unread ones, so it disappears from the list either way.
  await request(`/api/notifications/${alertId}/mark_read/`, { method: 'POST' });
};
