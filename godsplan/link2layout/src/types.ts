export interface ContentItem {
  id: string;
  category: 'food' | 'college' | 'travel' | 'tech' | 'wellness';
  title: string;
  subtitle: string;
  description: string;
  matchPercentage: number;
  rating: number;
  distance?: string;
  location?: string;
  rank?: string;
  image: string;
  details: {
    aiPerspective: string;
    bestTime?: string;
    priceGuide?: string;
    stats?: Record<string, string>; // e.g. "NIRF Rank": "#14", "Avg Placement": "18.5 LPA"
    courses?: { name: string; duration: string; intake: string }[];
    amenities?: string[];
  };
}

export interface Review {
  id: string;
  itemId: string;
  userName: string;
  userAvatar: string;
  rating: number;
  text: string;
  images: string[];
  timestamp: string;
  helpfulCount: number;
}

export interface SavedPlan {
  id: string;
  userId: string;
  itemId: string;
  savedAt: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  preferences: {
    cuisine: string[];
    education: string[];
    destinations: string[];
    aiIntensity: number;
  };
}

export interface AlertNotification {
  id: string;
  type: 'match' | 'rating' | 'social' | 'urgent';
  title: string;
  description: string;
  time: string;
  category?: string;
  tag?: string;
  icon?: string;
  meta?: any;
}
