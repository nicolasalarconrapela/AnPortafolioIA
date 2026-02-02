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
            // Backfill dates for existing JSONs if missing
            if (json.experience) {
              json.experience = json.experience.map((e: any) => {
                if (!e.startDate && e.period) {
                  const parts = e.period
                    .split("-")
                    .map((s: string) => s.trim());
                  if (parts.length >= 1) e.startDate = parts[0];
                  if (parts.length >= 2) e.endDate = parts[1];
                  if (
                    e.endDate?.toLowerCase().includes("present") ||
                    e.endDate?.toLowerCase().includes("actualidad")
                  ) {
                    e.current = true;
                    e.endDate = "";
                  }
                }
                return e;
              });
            }
            setAppState(AppState.WIZARD);
            setCurrentStep(0);
          } else {
            setAppState(AppState.ANALYZING);
            if (geminiServiceRef.current) {
              const result = await geminiServiceRef.current.analyzeCVText(
                content
              );
              // Backfill dates if analysis only returned period string
              if (result.experience) {
                result.experience = result.experience.map((e) => {
                  if (!e.startDate && e.period) {
                    const parts = e.period.split("-").map((s) => s.trim());
                    if (parts.length >= 1) e.startDate = parts[0];
                    if (parts.length >= 2) e.endDate = parts[1];
                    if (
                      e.endDate?.toLowerCase().includes("present") ||
                      e.endDate?.toLowerCase().includes("actualidad")
                    ) {
                      e.current = true;
                      e.endDate = "";
                    }
                  }
                  return e;
                });
              }
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
                data[0]["Summary"] ||
                data[0]["Headline"] ||
                data[0]["About"] ||
                data[0]["Perfil Profesional"] ||
                "";
          }
          if (files["Positions.csv"]) {
            const text = await files["Positions.csv"].async("text");
            const data = parseCSV(text);
            newProfile.experience = data.map((row) => {
              const start =
                row["Started On"] ||
                row["Fecha de inicio"] ||
                row["Start Date"] ||
                "";
              const end =
                row["Finished On"] ||
                row["Fecha de finalización"] ||
                row["End Date"] ||
                "";

              // Try to format date if it looks like "Oct 2020" -> "10/2020" or leave as is if simple
              // Or better, let it be free text but ensure it's captured

              return {
                company: row["Company Name"] || row["Company"] || "",
                role: row["Title"] || "",
                description: row["Description"] || "",
                startDate: start,
                endDate: end,
                current:
                  !end ||
                  end.toLowerCase().includes("present") ||
                  end.toLowerCase().includes("actualidad"),
                period: `${start} - ${end || "Present"}`,
              };
            });
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
          if (files["Volunteering.csv"]) {
            const text = await files["Volunteering.csv"].async("text");
            const data = parseCSV(text);
            newProfile.volunteering = data.map((row) => ({
              company:
                row["Company Name"] ||
                row["Organization"] ||
                row["Company"] ||
                "",
              role: row["Title"] || row["Role"] || "",
              period: `${row["Started On"] || ""} - ${
                row["Finished On"] || "Present"
              }`,
              description: row["Description"] || "",
            }));
          }
          if (files["Honors.csv"]) {
            const text = await files["Honors.csv"].async("text");
            const data = parseCSV(text);
            newProfile.awards = data
              .map((row) => {
                const title = row["Title"] || "";
                const issuer = row["Issuer"] || "";
                return issuer ? `${title} (${issuer})` : title;
              })
              .filter(Boolean);
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
