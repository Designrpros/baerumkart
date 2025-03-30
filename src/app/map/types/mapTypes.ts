export interface Spot {
    id: string;
    name: string;
    category: string;
    coordinates?: { lat: number; lng: number };
    description?: string;
    wheelchairAccessible?: boolean;
    difficulty?: string;
    location?: string;
    imageUrl?: string;
    photos?: string[];
    addedBy?: string;
    createdAt?: string;
    updatedAt?: string;
  }
  
  export interface Category {
    id: string;
    name: string;
    iconUrl?: string;
  }