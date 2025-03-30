import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import HomeClient from "./HomeClient";
import { Spot } from "../data/spots";

async function fetchSpots(): Promise<Spot[]> {
  console.log("Fetching spots for static generation on Vercel...");
  try {
    const querySnapshot = await getDocs(collection(db, "spots"));
    const spots = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Spot[];
    console.log("Spots fetched successfully on Vercel:", spots.length, "spots");
    return spots;
  } catch (error) {
    console.error("Error fetching spots on Vercel:", error);
    return [];
  }
}

export default async function Home() {
  const initialSpots = await fetchSpots();
  console.log("Rendering Home on Vercel with initialSpots:", initialSpots.length, "spots");

  if (initialSpots.length === 0) {
    console.warn("No spots fetched; rendering fallback content.");
  }

  return <HomeClient initialSpots={initialSpots} />;
}