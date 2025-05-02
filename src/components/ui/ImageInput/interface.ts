export interface ImagewithLocation {
  objectURL: string;
  location: ImageLocation | null;
}

interface ImageLocation {
  lat: number;
  lng: number;
}

export interface ImageInputProps {
  max_count: number;
  name?: string;
  type: string;
  single_file?: boolean;
  onChange?(objectURLs: ImagewithLocation[]): void;
  onServerImageDeleted?(imageIds: string[]): void;
  imageIDs?: string[];
  objectURLs?: ImagewithLocation[];
}
