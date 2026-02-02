import { MutableRefObject } from "react";
import JSZip from "jszip";
import { parseCSV } from "../utils/csvParser";
import { GeminiService } from "../services/geminiService";
import { AppState, CVProfile } from "../types";

export const useFileProcessing = (
  geminiServiceRef: MutableRefObject<GeminiService | null>,
  setProfile: (p: CVProfile | null) => void,
  setAppState: (s: AppState) => void,
  setError: (e: string | null) => void,
  setCurrentStep: (s: number) => void
) => {
  const processFile = async (file: File) => {
    setError(null);
    if (
      file.type === "application/json" ||
      file.name.endsWith(".json") ||
      file.type === "text/plain"
    ) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const content = e.target?.result as string;
        try {
          const json = JSON.parse(content);
          const isInternalProfile =
            Array.isArray(json.experience) &&
            Array.isArray(json.skills) &&
            Array.isArray(json.projects);
          if (isInternalProfile) {
            setProfile(json);
            setAppState(AppState.WIZARD);
            setCurrentStep(0);
          } else {
            setAppState(AppState.ANALYZING);
            if (geminiServiceRef.current) {
              const result = await geminiServiceRef.current.analyzeCVText(
                content
              );
              setProfile(result);
              setAppState(AppState.WIZARD);
              setCurrentStep(0);
            }
          }
        } catch (err) {
          console.error(err);
          if (file.name.endsWith(".json")) {
            setError("El archivo JSON no es válido o no pudo ser analizado.");
            setAppState(AppState.ERROR);
          } else {
            setError("El archivo no es un JSON válido.");
            setAppState(AppState.ERROR);
          }
        }
      };
      reader.readAsText(file);
      return;
    }
    setAppState(AppState.ANALYZING);
    if (
      file.type === "application/zip" ||
      file.type === "application/x-zip-compressed" ||
      file.name.endsWith(".zip")
    ) {
      try {
        const zip = await JSZip.loadAsync(file);
        const files = zip.files;
        const jsonFile = Object.values(files).find(
          (f: any) => !f.dir && f.name.endsWith(".json")
        );
        if (jsonFile) {
          const jsonText = await (jsonFile as any).async("text");
          try {
            const json = JSON.parse(jsonText);
            if (Array.isArray(json.experience) && Array.isArray(json.skills)) {
              setProfile(json);
              setAppState(AppState.WIZARD);
              setCurrentStep(0);
              return;
            }
          } catch (e) {
            console.log(
              "Found JSON in zip but failed to parse as valid profile",
              e
            );
          }
        }
        if (files["Positions.csv"] || files["Profile.csv"]) {
          const newProfile: CVProfile = {
            summary: "",
            experience: [],
            education: [],
            skills: [],
            techStack: { languages: [], ides: [], frameworks: [], tools: [] },
            projects: [],
            volunteering: [],
            awards: [],
            languages: [],
            hobbies: [],
          };
          const profileSummaryFile =
            files["Profile Summary.csv"] || files["Profile.csv"];
          if (profileSummaryFile) {
            const text = await profileSummaryFile.async("text");
            const data = parseCSV(text);
            if (data.length > 0)
              newProfile.summary =
                data[0]["Summary"] || data[0]["Headline"] || "";
          }
          if (files["Positions.csv"]) {
            const text = await files["Positions.csv"].async("text");
            const data = parseCSV(text);
            newProfile.experience = data.map((row) => ({
              company: row["Company Name"] || row["Company"] || "",
              role: row["Title"] || "",
              description: row["Description"] || "",
              period: `${row["Started On"] || ""} - ${
                row["Finished On"] || "Present"
              }`,
            }));
          }
          if (files["Education.csv"]) {
            const text = await files["Education.csv"].async("text");
            const data = parseCSV(text);
            newProfile.education = data.map((row) => ({
              institution: row["School Name"] || "",
              title: `${row["Degree Name"] || ""} ${row["Notes"] || ""}`.trim(),
              period: `${row["Start Date"] || ""} - ${row["End Date"] || ""}`,
            }));
          }
          if (files["Skills.csv"]) {
            const text = await files["Skills.csv"].async("text");
            const data = parseCSV(text);
            newProfile.skills = data.map((row) => row["Name"]).filter(Boolean);
          }
          if (files["Projects.csv"]) {
            const text = await files["Projects.csv"].async("text");
            const data = parseCSV(text);
            newProfile.projects = data.map((row) => ({
              name: row["Title"] || "",
              description: row["Description"] || "",
              technologies: "",
              link: row["Url"] || "",
            }));
          }
          if (files["Languages.csv"]) {
            const text = await files["Languages.csv"].async("text");
            const data = parseCSV(text);
            newProfile.languages = data.map((row) => ({
              language: row["Name"] || "",
              level: row["Proficiency"] || "",
            }));
          }
          setProfile(newProfile);
          setAppState(AppState.WIZARD);
          setCurrentStep(0);
          return;
        }
        const validFile: any = Object.values(zip.files).find(
          (f: any) =>
            !f.dir &&
            (f.name.endsWith(".pdf") || f.name.match(/\.(jpg|jpeg|png)$/i))
        );
        if (!validFile)
          throw new Error(
            "No se encontraron documentos válidos dentro del ZIP."
          );
        const base64Data = await validFile.async("base64");
        const mimeType = validFile.name.endsWith(".pdf")
          ? "application/pdf"
          : "image/jpeg";
        if (geminiServiceRef.current) {
          const result = await geminiServiceRef.current.analyzeCVJSON(
            base64Data,
            mimeType
          );
          setProfile(result);
          setAppState(AppState.WIZARD);
          setCurrentStep(0);
        }
      } catch (err: any) {
        setError(err.message || "Error al procesar el archivo ZIP.");
        setAppState(AppState.IDLE);
      }
      return;
    }
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      const base64Data = base64String.split(",")[1];
      if (geminiServiceRef.current) {
        try {
          const result = await geminiServiceRef.current.analyzeCVJSON(
            base64Data,
            file.type
          );
          setProfile(result);
          setAppState(AppState.WIZARD);
          setCurrentStep(0);
        } catch (err: any) {
          setError("La Señorita Rotenmeir rechazó este documento.");
          setAppState(AppState.ERROR);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  return { processFile };
};
