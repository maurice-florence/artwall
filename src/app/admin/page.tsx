"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CATEGORIES, CATEGORY_LABELS } from "@/constants";
import { Artwork } from "@/types";

function AdminPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // TODO: Haal artworkToEdit op via query param of context (afhankelijk van je Next.js implementatie)
  const artworkToEdit: Artwork | undefined = undefined; // Pas dit aan naar je eigen logica

  // State voor alle velden
  const [title, setTitle] = React.useState<string>("");
  const [year, setYear] = React.useState<number>(new Date().getFullYear());
  const [month, setMonth] = React.useState<number>(new Date().getMonth() + 1);
  const [day, setDay] = React.useState<number>(new Date().getDate());
  const [category, setCategory] = React.useState<Artwork["category"]>("poëzie");
  const [description, setDescription] = React.useState<string>("");
  const [mediaType, setMediaType] = React.useState<Artwork["mediaType"]>("text");
  const [content, setContent] = React.useState<string>("");
  const [lyrics, setLyrics] = React.useState<string>("");
  const [chords, setChords] = React.useState<string>("");
  const [soundcloudEmbedUrl, setSoundcloudEmbedUrl] = React.useState<string>("");
  const [soundcloudTrackUrl, setSoundcloudTrackUrl] = React.useState<string>("");
  const [isHidden, setIsHidden] = React.useState<boolean>(false);
  const [file, setFile] = React.useState<File | null>(null);
  const [coverFile, setCoverFile] = React.useState<File | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  return (
    <div>
      <h2>{artworkToEdit ? "Kunstwerk Bewerken" : "Nieuw Kunstwerk"}</h2>
      {/* Formulier en knoppen komen hier */}
    </div>
  );
}

const AdminPage: React.FC = () => {
  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <AdminPageContent />
    </React.Suspense>
  );
};

export default AdminPage;
