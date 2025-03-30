"use client";

import React, { useState, useEffect } from "react";
import { db, storage, auth } from "../../../firebase"; // Added storage import
import {
  collection,
  onSnapshot,
  doc,
  deleteDoc,
  addDoc,
  updateDoc,
  getDoc,
  setDoc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Spot } from "../../../data/spots";
import { SpotItem } from "./components/SpotItem";
import { SpotDetails } from "./components/SpotDetails";
import { CategoryFilter } from "./components/CategoryFilter";
import {
  Container,
  Title,
  SearchContainer,
  SearchBar,
  SpotList,
  ErrorText,
  AddForm,
  Input,
  SaveButton,
} from "./styles";
import styled from "styled-components";
import AddIcon from "@mui/icons-material/Add";
import LabelIcon from "@mui/icons-material/Label";

// Predefined icons from public/icons/
const availableIcons: { [key: string]: string } = {
  Bålplass: "/icons/campfire.png",
  Hengekøye: "/icons/hammock.png",
  Gapahuker: "/icons/shelter.png",
  Utsiktspunkter: "/icons/viewpoint.png",
  "Rullestolvennlig/Vognvennlig": "/icons/accessible.png",
  Hytte: "/icons/cabin.png",
  Badeplass: "/icons/swimming.png",
  Klatrefelt: "/icons/climbing.png",
  Skitur: "/icons/skiing.png",
  Teltplass: "/icons/tent.png",
  Fottur: "/icons/hiking.png",
  Default: "/icons/default.png",
};

interface EditSpot extends Partial<Spot> {
  images?: File[];
  imageUrls?: string[];
  categories?: string[];
  coordinates?: { lat: number; lng: number };
  route?: { lat: number; lng: number }[];
  manualLat?: string;
  manualLng?: string;
}

interface Category {
  id: string;
  name: string;
  iconUrl?: string;
  createdAt?: string;
  createdBy?: string;
}

interface Location {
  id: string;
  name: string;
}

const ToggleButton = styled.button<{ isActive: boolean }>`
  padding: 8px 16px;
  border-radius: 8px;
  border: 1px solid #ddd;
  background: ${({ isActive }) => (isActive ? "#2e7d32" : "#fff")};
  color: ${({ isActive }) => (isActive ? "#fff" : "#000")};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  transition: background 0.2s ease;
  &:hover {
    background: ${({ isActive }) => (isActive ? "#1b5e20" : "#e6f0e6")};
  }
`;

const AddCategoryForm = styled(AddForm)`
  display: flex;
  flex-direction: column;
  gap: 15px;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #f9f9f9;
  margin: 20px 0;
`;

const FormRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const FormLabel = styled.label`
  font-size: 0.9rem;
  color: #333;
  font-weight: 500;
`;

const FormInput = styled(Input)`
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
  &:focus {
    border-color: #2e7d32;
    outline: none;
  }
`;

const FormSelect = styled.select`
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
  background: #fff;
  &:focus {
    border-color: #2e7d32;
    outline: none;
  }
`;

const capitalizeFirstLetter = (str: string) =>
  str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

const useSpotsViewModel = () => {
  const [spots, setSpots] = useState<Spot[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<Location[]>([{ id: "1", name: "Stabekk" }]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);

    const unsubscribeSpots = onSnapshot(
      collection(db, "spots"),
      (snapshot) => {
        const fetchedSpots = snapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name || "",
          category: doc.data().category || "Uncategorized",
          subcategory: doc.data().subcategory || "",
          difficulty: doc.data().difficulty || "lett",
          coordinates: doc.data().coordinates || { lat: 0, lng: 0 },
          description: doc.data().description || "Ingen beskrivelse tilgjengelig.",
          wheelchairAccessible: doc.data().wheelchairAccessible || false,
          rating: doc.data().rating,
          distance: doc.data().distance,
          duration: doc.data().duration,
          elevation: doc.data().elevation,
          facilities: doc.data().facilities || [],
          route: doc.data().route || [],
          routeDistance: doc.data().routeDistance,
          routeElevationProfile: doc.data().routeElevationProfile || [],
          routeType: doc.data().routeType,
          terrain: doc.data().terrain,
          weatherNotes: doc.data().weatherNotes,
          season: doc.data().season,
          parking: doc.data().parking,
          publicTransport: doc.data().publicTransport,
          accessNotes: doc.data().accessNotes,
          reviews: doc.data().reviews || [],
          photos: doc.data().photos || [],
          imageUrl: doc.data().imageUrl || "",
          location: doc.data().location || "Unknown",
          recommendations: doc.data().recommendations || [],
          addedBy: doc.data().addedBy || "",
          createdAt: doc.data().createdAt || "",
          updatedAt: doc.data().updatedAt || "",
        })) as Spot[];
        setSpots(fetchedSpots);
        setIsLoading(false);
      },
      (err) => {
        setError("Kunne ikke laste steder: " + err.message);
        setIsLoading(false);
      }
    );

    const unsubscribeCategories = onSnapshot(
      collection(db, "categories"),
      (snapshot) => {
        const fetchedCategories = snapshot.docs.map((doc) => ({
          id: doc.id,
          name: capitalizeFirstLetter(doc.data().name),
          iconUrl: doc.data().iconUrl || "",
          createdAt: doc.data().createdAt || "",
          createdBy: doc.data().createdBy || "",
        })) as Category[];
        setCategories(fetchedCategories);
      },
      (err) => {
        setError("Kunne ikke laste kategorier: " + err.message);
      }
    );

    return () => {
      unsubscribeSpots();
      unsubscribeCategories();
    };
  }, []);

  const handleAddOrUpdateSpot = async (spotData: EditSpot, spotId?: string) => {
    if (!spotData.name?.trim()) {
      setError("Navn er et obligatorisk felt");
      return false;
    }

    setIsLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Du må være logget inn for å legge til steder");

      const updatedSpotData: Partial<Spot> = {
        name: spotData.name?.trim(),
        description: spotData.description?.trim(),
        category: spotData.categories?.[0] || "Uncategorized",
        subcategory: spotData.subcategory || "",
        imageUrl: spotData.imageUrls?.[0] || "",
        photos: spotData.imageUrls || [],
        location: spotData.location?.trim() || "Unknown",
        wheelchairAccessible: spotData.wheelchairAccessible || false,
        difficulty: spotData.difficulty || "lett",
        coordinates: {
          lat: spotData.coordinates?.lat || 0,
          lng: spotData.coordinates?.lng || 0,
        },
        route: spotData.route || [],
        addedBy: spotId ? spotData.addedBy : user.uid,
        createdAt: spotId ? spotData.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (spotData.images?.length) {
        const uploadPromises = spotData.images.map(async (image) => {
          const imageRef = ref(storage, `spots/${Date.now()}_${image.name}`);
          await uploadBytes(imageRef, image);
          return getDownloadURL(imageRef);
        });
        const newImageUrls = await Promise.all(uploadPromises);
        updatedSpotData.photos = [...(updatedSpotData.photos || []), ...newImageUrls];
        updatedSpotData.imageUrl = newImageUrls[0];
      }

      if (spotId) {
        await updateDoc(doc(db, "spots", spotId), updatedSpotData);
      } else {
        await addDoc(collection(db, "spots"), updatedSpotData);
      }
      setError(null);
      return true;
    } catch (error) {
      setError("Kunne ikke lagre sted: " + (error instanceof Error ? error.message : "Ukjent feil"));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSpot = async (id: string) => {
    if (confirm("Er du sikker på at du vil slette dette stedet?")) {
      setIsLoading(true);
      try {
        await deleteDoc(doc(db, "spots", id));
        setError(null);
      } catch (error) {
        setError("Kunne ikke slette sted: " + (error instanceof Error ? error.message : "Ukjent feil"));
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleAddCategory = async (categoryName: string, iconPath: string) => {
    const categoryNameRaw = categoryName.trim();
    const categoryNameLower = categoryNameRaw.toLowerCase();
    const categoryNameCap = capitalizeFirstLetter(categoryNameRaw);

    if (!categoryNameRaw) {
      setError("Kategorinavn er påkrevd");
      return;
    }

    setIsLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Du må være logget inn for å legge til kategorier");

      const categoryRef = doc(db, "categories", categoryNameLower);
      const categorySnap = await getDoc(categoryRef);

      if (!categorySnap.exists()) {
        await setDoc(categoryRef, {
          name: categoryNameCap,
          iconUrl: iconPath,
          createdAt: new Date().toISOString(),
          createdBy: user.uid,
        });
      }
      setError(null);
    } catch (error) {
      setError("Kunne ikke legge til kategori: " + (error instanceof Error ? error.message : "Ukjent feil"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddLocation = async (locationName: string) => {
    const name = locationName.trim();
    if (!name) {
      setError("Lokasjonsnavn er påkrevd");
      return;
    }

    setIsLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Du må være logget inn for å legge til lokasjoner");

      setLocations((prev) => [...prev, { id: Date.now().toString(), name }]);
      setError(null);
    } catch (error) {
      setError("Kunne ikke legge til lokasjon: " + (error instanceof Error ? error.message : "Ukjent feil"));
    } finally {
      setIsLoading(false);
    }
  };

  const filterCategories = ["All", ...categories.map((cat) => cat.name)];
  const filteredSpots = spots.filter(
    (spot) =>
      (selectedCategory === "All" || spot.category.toLowerCase() === selectedCategory.toLowerCase()) &&
      spot.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return {
    spots,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    categories,
    locations,
    filterCategories,
    filteredSpots,
    isLoading,
    error,
    clearError: () => setError(null),
    handleAddOrUpdateSpot,
    handleDeleteSpot,
    handleAddCategory,
    handleAddLocation,
  };
};

const Spots = () => {
  const {
    spots,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    categories,
    locations,
    filterCategories,
    filteredSpots,
    isLoading,
    error,
    clearError,
    handleAddOrUpdateSpot,
    handleDeleteSpot,
    handleAddCategory,
    handleAddLocation,
  } = useSpotsViewModel();

  const [newCategoryName, setNewCategoryName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("/icons/default.png");
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showAddSpot, setShowAddSpot] = useState(false);

  const handleAddNewCategory = () => {
    if (newCategoryName.trim()) {
      handleAddCategory(newCategoryName, selectedIcon);
      setNewCategoryName("");
      setSelectedIcon("/icons/default.png");
      setShowAddCategory(false);
    }
  };

  if (isLoading) return <Container><Title>Laster...</Title></Container>;
  if (error && !filteredSpots.length) return <Container><ErrorText>{error}</ErrorText></Container>;

  return (
    <Container>
      <Title>Administrer Steder</Title>
      <SearchContainer>
        <SearchBar
          type="text"
          placeholder="Søk etter et sted..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <ToggleButton
          isActive={showAddCategory}
          onClick={() => setShowAddCategory(!showAddCategory)}
        >
          <LabelIcon />
        </ToggleButton>
        <ToggleButton isActive={showAddSpot} onClick={() => setShowAddSpot(!showAddSpot)}>
          <AddIcon />
        </ToggleButton>
      </SearchContainer>
      {showAddCategory && (
        <AddCategoryForm>
          <FormRow>
            <FormLabel>Navn på kategori</FormLabel>
            <FormInput
              type="text"
              placeholder="Skriv inn kategorinavn"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
            />
          </FormRow>
          <FormRow>
            <FormLabel>Velg ikon</FormLabel>
            <FormSelect
              value={selectedIcon}
              onChange={(e) => setSelectedIcon(e.target.value)}
            >
              {Object.entries(availableIcons).map(([name, path]) => (
                <option key={path} value={path}>
                  {name}
                </option>
              ))}
            </FormSelect>
          </FormRow>
          <SaveButton onClick={handleAddNewCategory}>Legg til kategori</SaveButton>
        </AddCategoryForm>
      )}
      {showAddSpot && (
        <SpotDetails
          isOpen={true}
          spot={null}
          handleAddOrUpdateSpot={handleAddOrUpdateSpot}
          handleDeleteSpot={handleDeleteSpot}
          handleAddCategory={handleAddCategory}
          handleAddLocation={handleAddLocation}
          categories={categories}
          locations={locations}
          error={error}
          clearError={clearError}
          onClose={() => setShowAddSpot(false)}
        />
      )}

      <CategoryFilter
        filterCategories={filterCategories}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />

      <SpotList>
        {filteredSpots.length > 0 ? (
          filteredSpots.map((spot) => (
            <SpotItem
              key={spot.id}
              spot={spot}
              handleAddOrUpdateSpot={handleAddOrUpdateSpot}
              handleDeleteSpot={handleDeleteSpot}
              handleAddCategory={handleAddCategory}
              handleAddLocation={handleAddLocation}
              categories={categories}
              locations={locations}
              error={error}
              clearError={clearError}
            />
          ))
        ) : (
          <p>Ingen steder funnet.</p>
        )}
      </SpotList>
    </Container>
  );
};

export default Spots;