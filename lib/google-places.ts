import { getEnv } from "@/lib/env";

type TextSearchResult = {
  id: string;
  displayName?: {
    text: string;
  };
  formattedAddress?: string;
  rating?: number;
  name: string;
};

type PlaceDetails = {
  id: string;
  displayName?: {
    text: string;
  };
  formattedAddress?: string;
  internationalPhoneNumber?: string;
  nationalPhoneNumber?: string;
  websiteUri?: string;
  rating?: number;
};

const apiKey = () => getEnv("GOOGLE_PLACES_API_KEY");

export async function searchPlacesText(query: string, regionCode = "za") {
  const response = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey(),
      "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.rating,places.name"
    },
    body: JSON.stringify({
      textQuery: query,
      regionCode
    }),
    cache: "no-store"
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Google Text Search failed: ${response.status} ${text}`);
  }

  const data = (await response.json()) as { places?: TextSearchResult[] };
  return data.places ?? [];
}

export async function getPlaceDetails(resourceName: string) {
  const response = await fetch(`https://places.googleapis.com/v1/${resourceName}`, {
    headers: {
      "X-Goog-Api-Key": apiKey(),
      "X-Goog-FieldMask":
        "id,displayName,formattedAddress,internationalPhoneNumber,nationalPhoneNumber,websiteUri,rating"
    },
    cache: "no-store"
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Google Place Details failed: ${response.status} ${text}`);
  }

  return (await response.json()) as PlaceDetails;
}
