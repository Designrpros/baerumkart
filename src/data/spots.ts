// src/data/spots.ts
export interface Spot {
    id: string;
    name: string;
    category: string;
    subcategory: string; // Added
    difficulty: "lett" | "moderat" | "Vanskelig";
    coordinates: { lat: number; lng: number };
    description: string;
    wheelchairAccessible?: boolean;
    rating?: number;
    distance?: number;
    duration?: string;
    elevation?: number;
    facilities?: string[];
    route?: { lat: number; lng: number }[];
    routeDistance?: number;
    routeElevationProfile?: { distance: number; elevation: number }[];
    routeType?: "loop" | "out-and-back" | "point-to-point";
    terrain?: string;
    weatherNotes?: string;
    season?: string;
    parking?: { lat: number; lng: number; description: string };
    publicTransport?: string;
    accessNotes?: string;
    reviews?: { user: string; comment: string; rating: number; date?: string }[];
    photos?: string[];
    imageUrl: string; // Added
    location: string; // Added
    recommendations?: string[];
    addedBy?: string;
    createdAt?: string;
    updatedAt?: string;
  }