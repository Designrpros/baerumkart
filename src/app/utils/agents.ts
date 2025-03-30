import { db } from "../../firebase";
import { collection, getDocs } from "firebase/firestore";
import { Spot } from "../../data/spots";

// Input Agent: Validates and processes user input for trip-related queries
export async function processInput(userMessage: string, previousMessages: string[] = []): Promise<{ isValid: boolean; processedMessage: string; tripType?: string }> {
  const lowerMessage = userMessage.toLowerCase();
  const fullContext = [...previousMessages, lowerMessage].join(" ").toLowerCase();

  const tripKeywords = ["tur", "telt", "bål", "fottur", "sykkeltur", "camping", "utendørs", "utsiktspunkt", "skitur", "overnatting", "utstyr", "tid", "lang"];
  const isTripRelated = tripKeywords.some((keyword) => lowerMessage.includes(keyword)) || 
                       /anbefale|fortell (meg )?(mer|mre)|hva (med|er)|hvor/.test(lowerMessage);

  if (!isTripRelated) {
    return { isValid: false, processedMessage: userMessage };
  }

  if (previousMessages.length > 0 && !fullContext.includes("bærum") && !fullContext.includes("baerum")) {
    return { isValid: false, processedMessage: "Jeg kan kun hjelpe med turplanlegging i Bærum-området." };
  }

  const tripTypes = ["teltur", "fottur", "sykkeltur", "bål", "utsiktspunkt", "skitur", "camping"];
  const detectedTripType = tripTypes.find((type) => lowerMessage.includes(type)) || "tur";

  console.log("Input processed - Full context:", fullContext, "Trip type:", detectedTripType);
  return { isValid: true, processedMessage: userMessage, tripType: detectedTripType };
}

// Database Agent: Fetches and filters unique spots from Firestore
export async function fetchSpots(tripType?: string, specificSpot?: string): Promise<{ context: string; spotNames: string[] }> {
  const spotsCollection = collection(db, "spots");
  const spotsSnapshot = await getDocs(spotsCollection);
  const spots: Spot[] = spotsSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  } as Spot));

  let filteredSpots = spots;
  if (specificSpot) {
    filteredSpots = spots.filter(spot => spot.name.toLowerCase().includes(specificSpot.toLowerCase()));
  } else if (tripType && tripType !== "tur") {
    filteredSpots = spots.filter((spot) => {
      const typeKey = tripType.toLowerCase();
      return (
        spot.description.toLowerCase().includes(typeKey) ||
        spot.category.toLowerCase().includes(typeKey) ||
        (spot.subcategory && spot.subcategory.toLowerCase().includes(typeKey))
      );
    });
  }

  const uniqueSpots = Array.from(new Map(filteredSpots.map(spot => [spot.name, spot])).values()).slice(0, 3);
  const spotNames = uniqueSpots.map(spot => spot.name.toLowerCase());

  const context = uniqueSpots
    .map((spot) => `
Navn: ${spot.name}
Kategori: ${spot.category}
Underkategori: ${spot.subcategory || "Ingen"}
Vanskelighetsgrad: ${spot.difficulty}
Beskrivelse: ${spot.description}
Sted: ${spot.location}
Koordinater: (${spot.coordinates.lat}, ${spot.coordinates.lng})
    `.trim())
    .join("\n\n");

  console.log("Fetched spots - Context:", context, "Spot names:", spotNames);
  return { context, spotNames };
}