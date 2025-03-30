"use client";

import { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { Spot } from "../data/spots";
import { db, storage, auth } from "../firebase";
import { setDoc, doc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { parseGPX } from "@we-gold/gpxjs";
import { onAuthStateChanged } from "firebase/auth";

const Sidebar = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  right: 0;
  width: ${({ isOpen }) => (isOpen ? "400px" : "0")};
  height: 100vh;
  background: #ffffff;
  box-shadow: -5px 0 15px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
  transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1000;
  font-family: "Helvetica", sans-serif;

  @media (max-width: 768px) {
    width: ${({ isOpen }) => (isOpen ? "100%" : "0")};
  }
`;

const Overlay = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.3);
  opacity: ${({ isOpen }) => (isOpen ? 1 : 0)};
  visibility: ${({ isOpen }) => (isOpen ? "visible" : "hidden")};
  transition: opacity 0.3s ease;
  z-index: 999;
`;

const FormHeader = styled.div`
  padding: 1.5rem;
  background: #f9f9f9;
  border-bottom: 1px solid #e0e0e0;
  text-align: center;
`;

const FormTitle = styled.h2`
  font-size: 1.8rem;
  font-weight: 700;
  margin: 0;
  color: #1a3c34;
  letter-spacing: 0.5px;
`;

const FormContent = styled.div`
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const InputWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const InputLabel = styled.label`
  font-size: 0.9rem;
  color: #333;
  margin-bottom: 0.5rem;
  display: block;
  font-weight: 500;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.9rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  background: #fff;
  color: #333;
  outline: none;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;

  &:focus {
    border-color: #1a3c34;
    box-shadow: 0 0 5px rgba(26, 60, 52, 0.2);
  }

  &::placeholder {
    color: #999;
  }
`;

const PickerWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const PickerButton = styled.button`
  width: 100%;
  padding: 0.9rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  background: #fff;
  color: #333;
  text-align: left;
  cursor: pointer;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;

  &:focus {
    border-color: #1a3c34;
    box-shadow: 0 0 5px rgba(26, 60, 52, 0.2);
    outline: none;
  }

  &::after {
    content: "▼";
    position: absolute;
    right: 1rem;
    color: #666;
  }
`;

const PickerOptions = styled.div<{ isOpen: boolean }>`
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  max-height: ${({ isOpen }) => (isOpen ? "200px" : "0")};
  overflow-y: auto;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  transition: max-height 0.2s ease;
  visibility: ${({ isOpen }) => (isOpen ? "visible" : "hidden")};
`;

const PickerOption = styled.div`
  padding: 0.75rem;
  font-size: 1rem;
  color: #333;
  cursor: pointer;

  &:hover {
    background: #f0f0f0;
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 0.9rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  background: #fff;
  color: #333;
  min-height: 100px;
  outline: none;
  transition: border-color 0.3s ease;
  resize: vertical;

  &:focus {
    border-color: #1a3c34;
  }

  &::placeholder {
    color: #999;
  }
`;

const FileInputWrapper = styled.div`
  position: relative;
  width: 100%;
  padding: 0.9rem;
  border: 2px dashed #ddd;
  border-radius: 8px;
  background: #fafafa;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    border-color: #1a3c34;
    background: #f0f0f0;
  }
`;

const FileInputLabel = styled.label`
  font-size: 1rem;
  color: #666;
  cursor: pointer;
`;

const FileInput = styled.input`
  display: none;
`;

const ImagePreview = styled.img`
  width: 100%;
  max-height: 200px;
  object-fit: cover;
  border-radius: 8px;
  margin-top: 0.5rem;
`;

const GPXInputWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const SubmitButton = styled.button`
  background: #1a3c34;
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1.1rem;
  font-weight: 600;
  transition: background-color 0.3s ease;

  &:hover {
    background: #2e7d32;
  }
`;

const DeleteButton = styled.button`
  background: #d32f2f;
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1.1rem;
  font-weight: 600;
  transition: background-color 0.3s ease;
  margin-top: 1rem;

  &:hover {
    background: #b71c1c;
  }
`;

const ErrorMessage = styled.p`
  color: #d32f2f;
  font-size: 0.9rem;
  text-align: center;
`;

interface AddSpotFormProps {
  onAddSpot: (spot: Spot) => void;
  isOpen: boolean;
  onClose: () => void;
  spot?: Spot | null | undefined;
  onDelete?: () => void;
}

export const AddSpotForm = ({ onAddSpot, isOpen, onClose, spot, onDelete }: AddSpotFormProps) => {
  const [formData, setFormData] = useState<Partial<Spot>>(spot || {
    name: "",
    category: "",
    subcategory: "", // Added
    difficulty: "lett",
    coordinates: { lat: 0, lng: 0 },
    description: "",
    wheelchairAccessible: false,
    rating: 0,
    facilities: [],
    publicTransport: "",
    accessNotes: "",
    weatherNotes: "",
    season: "",
    terrain: "",
    parking: { lat: 0, lng: 0, description: "" },
    imageUrl: "", // Added
    location: "", // Added
  });
  const [images, setImages] = useState<File[]>([]);
  const [gpxFile, setGpxFile] = useState<File | null>(null);
  const [imagePreviews, setImagePreviews] = useState<string[]>(spot?.photos || []);
  const [error, setError] = useState<string>("");
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [difficultyOpen, setDifficultyOpen] = useState(false);
  const [accessibilityOpen, setAccessibilityOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node) && isOpen) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    setImages(files);
    const previews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  useEffect(() => {
    return () => {
      imagePreviews.forEach((url) => {
        if (url.startsWith("blob:")) URL.revokeObjectURL(url);
      });
    };
  }, [imagePreviews]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!currentUser) {
      setError("Du må være logget inn for å oppdatere et sted.");
      return;
    }

    if (!spot || !spot.id) {
      setError("Ingen gyldig sted-ID funnet. Kan ikke oppdatere.");
      return;
    }

    try {
      const imageUrls = images.length > 0
        ? await Promise.all(
            images.map(async (image) => {
              const storageRef = ref(storage, `spots/${Date.now()}-${image.name}`);
              await uploadBytes(storageRef, image);
              return await getDownloadURL(storageRef);
            })
          )
        : formData.photos || [];

      const primaryImageUrl = imageUrls.length > 0 ? imageUrls[0] : formData.imageUrl || "";

      let coordinates = formData.coordinates || { lat: 0, lng: 0 };
      let route: { lat: number; lng: number }[] | undefined = undefined;

      if (gpxFile) {
        const gpxText = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (event) => resolve(event.target?.result as string);
          reader.onerror = () => reject(new Error("Failed to read GPX file"));
          reader.readAsText(gpxFile);
        });

        const [gpxData] = parseGPX(gpxText);
        if (gpxData) {
          if (gpxData.tracks && gpxData.tracks.length > 0) {
            const trackPoints = gpxData.tracks[0].points;
            route = trackPoints.map((point) => ({
              lat: point.latitude,
              lng: point.longitude,
            }));
            coordinates = route[0];
          } else if (gpxData.waypoints && gpxData.waypoints.length > 0) {
            coordinates = {
              lat: gpxData.waypoints[0].latitude,
              lng: gpxData.waypoints[0].longitude,
            };
          }
        } else {
          setError("Kunne ikke tolke GPX-filen. Vennligst bruk en gyldig fil.");
          return;
        }
      } else {
        route = spot.route;
      }

      const updatedSpot: Spot = {
        id: spot.id,
        name: formData.name || "",
        category: formData.category || "",
        subcategory: formData.subcategory || "", // Added
        difficulty: formData.difficulty || "lett",
        coordinates,
        description: formData.description || "",
        wheelchairAccessible: formData.wheelchairAccessible ?? false,
        rating: formData.rating ?? 0,
        photos: imageUrls,
        imageUrl: primaryImageUrl, // Added
        location: formData.location || "", // Added
        ...(route && { route }),
        facilities: formData.facilities || [],
        publicTransport: formData.publicTransport || "",
        accessNotes: formData.accessNotes || "",
        weatherNotes: formData.weatherNotes || "",
        season: formData.season || "",
        terrain: formData.terrain || "",
        parking: formData.parking || { lat: 0, lng: 0, description: "" },
      };

      await setDoc(doc(db, "spots", updatedSpot.id), updatedSpot);
      onAddSpot(updatedSpot);
      onClose();
    } catch (error) {
      console.error("Detailed error updating spot:", error);
      setError(`Kunne ikke oppdatere sted: ${(error as Error).message}. Prøv igjen.`);
    }
  };

  const categoryOptions = [
    { value: "", label: "Velg kategori" },
    { value: "Bålplass", label: "Bålplass" },
    { value: "Hengekøye", label: "Hengekøye" },
    { value: "Gapahuker", label: "Gapahuker" },
    { value: "Utsiktspunkter", label: "Utsiktspunkter" },
    { value: "Rullestolvennlig", label: "Rullestolvennlig" },
    { value: "Marka Stuer", label: "Marka Stuer" },
  ];

  const difficultyOptions = [
    { value: "lett", label: "Grønn (Lett)" },
    { value: "moderat", label: "Blå (Moderat)" },
    { value: "Vanskelig", label: "Rød (Vanskelig)" },
  ];

  const accessibilityOptions = [
    { value: "Nei", label: "Nei" },
    { value: "Ja", label: "Ja" },
  ];

  return (
    <>
      <Overlay isOpen={isOpen} onClick={onClose} />
      <Sidebar ref={sidebarRef} isOpen={isOpen}>
        <FormHeader>
          <FormTitle>Rediger Sted</FormTitle>
        </FormHeader>
        <FormContent>
          <form onSubmit={handleSubmit}>
            <InputWrapper>
              <InputLabel>Navn *</InputLabel>
              <Input
                type="text"
                placeholder="F.eks. Brunkollen Turisthytte"
                value={formData.name || ""}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </InputWrapper>

            <PickerWrapper>
              <InputLabel>Kategori *</InputLabel>
              <PickerButton type="button" onClick={() => setCategoryOpen(!categoryOpen)}>
                {categoryOptions.find((opt) => opt.value === formData.category)?.label || "Velg kategori"}
              </PickerButton>
              <PickerOptions isOpen={categoryOpen}>
                {categoryOptions.map((option) => (
                  <PickerOption
                    key={option.value}
                    onClick={() => {
                      setFormData({ ...formData, category: option.value });
                      setCategoryOpen(false);
                    }}
                  >
                    {option.label}
                  </PickerOption>
                ))}
              </PickerOptions>
            </PickerWrapper>

            <InputWrapper>
              <InputLabel>Underkategori *</InputLabel>
              <Input
                type="text"
                placeholder="F.eks. Tursti"
                value={formData.subcategory || ""}
                onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                required
              />
            </InputWrapper>

            <InputWrapper>
              <InputLabel>Lokasjon *</InputLabel>
              <Input
                type="text"
                placeholder="F.eks. Stabekk"
                value={formData.location || ""}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
              />
            </InputWrapper>

            <PickerWrapper>
              <InputLabel>Vanskelighetsgrad *</InputLabel>
              <PickerButton type="button" onClick={() => setDifficultyOpen(!difficultyOpen)}>
                {difficultyOptions.find((opt) => opt.value === formData.difficulty)?.label || "Grønn (Lett)"}
              </PickerButton>
              <PickerOptions isOpen={difficultyOpen}>
                {difficultyOptions.map((option) => (
                  <PickerOption
                    key={option.value}
                    onClick={() => {
                        setFormData({ ...formData, difficulty: option.value as "lett" | "moderat" | "Vanskelig" });                      setDifficultyOpen(false);
                    }}
                  >
                    {option.label}
                  </PickerOption>
                ))}
              </PickerOptions>
            </PickerWrapper>

            <InputWrapper>
              <InputLabel>Beskrivelse *</InputLabel>
              <Textarea
                placeholder="Beskriv stedet..."
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </InputWrapper>

            <PickerWrapper>
              <InputLabel>Rullestolvennlig</InputLabel>
              <PickerButton type="button" onClick={() => setAccessibilityOpen(!accessibilityOpen)}>
                {formData.wheelchairAccessible ? "Ja" : "Nei"}
              </PickerButton>
              <PickerOptions isOpen={accessibilityOpen}>
                {accessibilityOptions.map((option) => (
                  <PickerOption
                    key={option.value}
                    onClick={() => {
                      setFormData({ ...formData, wheelchairAccessible: option.value === "Ja" });
                      setAccessibilityOpen(false);
                    }}
                  >
                    {option.label}
                  </PickerOption>
                ))}
              </PickerOptions>
            </PickerWrapper>

            <InputWrapper>
              <InputLabel>Vurdering (0-5)</InputLabel>
              <Input
                type="number"
                placeholder="F.eks. 4.5"
                min="0"
                max="5"
                step="0.1"
                value={formData.rating ?? ""}
                onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) || 0 })}
              />
            </InputWrapper>

            <InputWrapper>
              <InputLabel>Fasiliteter (kommaseparert)</InputLabel>
              <Input
                type="text"
                placeholder="F.eks. Servering, Toalett"
                value={formData.facilities?.join(", ") || ""}
                onChange={(e) => setFormData({ ...formData, facilities: e.target.value.split(", ").filter(Boolean) })}
              />
            </InputWrapper>

            <InputWrapper>
              <InputLabel>Kollektivtransport</InputLabel>
              <Textarea
                placeholder="F.eks. Nærmeste buss fra Fossum"
                value={formData.publicTransport || ""}
                onChange={(e) => setFormData({ ...formData, publicTransport: e.target.value })}
              />
            </InputWrapper>

            <InputWrapper>
              <InputLabel>Tilgangsnotater</InputLabel>
              <Textarea
                placeholder="F.eks. Blåmerkete stier fra mange kanter"
                value={formData.accessNotes || ""}
                onChange={(e) => setFormData({ ...formData, accessNotes: e.target.value })}
              />
            </InputWrapper>

            <InputWrapper>
              <InputLabel>Værnotater</InputLabel>
              <Textarea
                placeholder="F.eks. Best i solskinn"
                value={formData.weatherNotes || ""}
                onChange={(e) => setFormData({ ...formData, weatherNotes: e.target.value })}
              />
            </InputWrapper>

            <InputWrapper>
              <InputLabel>Sesong</InputLabel>
              <Input
                type="text"
                placeholder="F.eks. Hele året"
                value={formData.season || ""}
                onChange={(e) => setFormData({ ...formData, season: e.target.value })}
              />
            </InputWrapper>

            <InputWrapper>
              <InputLabel>Terreng</InputLabel>
              <Input
                type="text"
                placeholder="F.eks. Skog og sti"
                value={formData.terrain || ""}
                onChange={(e) => setFormData({ ...formData, terrain: e.target.value })}
              />
            </InputWrapper>

            <InputWrapper>
              <InputLabel>Parkering Latitude</InputLabel>
              <Input
                type="number"
                step="any"
                placeholder="F.eks. 59.9431"
                value={formData.parking?.lat ?? ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    parking: {
                      lat: parseFloat(e.target.value) || 0,
                      lng: formData.parking?.lng ?? 0,
                      description: formData.parking?.description ?? "",
                    },
                  })
                }
              />
            </InputWrapper>

            <InputWrapper>
              <InputLabel>Parkering Longitude</InputLabel>
              <Input
                type="number"
                step="any"
                placeholder="F.eks. 10.5832"
                value={formData.parking?.lng ?? ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    parking: {
                      lat: formData.parking?.lat ?? 0,
                      lng: parseFloat(e.target.value) || 0,
                      description: formData.parking?.description ?? "",
                    },
                  })
                }
              />
            </InputWrapper>

            <InputWrapper>
              <InputLabel>Parkering Beskrivelse</InputLabel>
              <Textarea
                placeholder="F.eks. Parkering ved Fossum"
                value={formData.parking?.description || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    parking: {
                      lat: formData.parking?.lat ?? 0,
                      lng: formData.parking?.lng ?? 0,
                      description: e.target.value,
                    },
                  })
                }
              />
            </InputWrapper>

            <InputWrapper>
              <InputLabel>Bilder</InputLabel>
              <FileInputWrapper>
                <FileInputLabel htmlFor="image-upload">
                  {images.length > 0 ? `${images.length} bilder valgt` : "Last opp nye bilder"}
                </FileInputLabel>
                <FileInput
                  id="image-upload"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </FileInputWrapper>
              {imagePreviews.length > 0 && (
                <ImagePreview src={imagePreviews[0]} alt="Forhåndsvisning" />
              )}
            </InputWrapper>

            <GPXInputWrapper>
              <InputLabel>GPX-fil (for lokasjon og rute)</InputLabel>
              <FileInputWrapper>
                <FileInputLabel htmlFor="gpx-upload">
                  {gpxFile ? gpxFile.name : "Last opp ny GPX-fil"}
                </FileInputLabel>
                <FileInput
                  id="gpx-upload"
                  type="file"
                  accept=".gpx"
                  onChange={(e) => setGpxFile(e.target.files ? e.target.files[0] : null)}
                />
              </FileInputWrapper>
            </GPXInputWrapper>

            {error && <ErrorMessage>{error}</ErrorMessage>}
            <SubmitButton type="submit">Oppdater</SubmitButton>
            {onDelete && (
              <DeleteButton type="button" onClick={onDelete}>
                Slett sted
              </DeleteButton>
            )}
          </form>
        </FormContent>
      </Sidebar>
    </>
  );
};