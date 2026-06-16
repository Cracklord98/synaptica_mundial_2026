"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  FileText, 
  UploadCloud, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Download, 
  ExternalLink 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { uploadModelCard } from "@/lib/actions";

interface ModelCard {
  file_url: string;
  description: string | null;
  uploaded_at: string;
}

interface UploadCardProps {
  userId: string;
  initialCard: ModelCard | null;
}

export default function UploadCard({ userId, initialCard }: UploadCardProps) {
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState(initialCard?.description || "");
  const [fileUrl, setFileUrl] = useState(initialCard?.file_url || "");
  const [uploadedAt, setUploadedAt] = useState(initialCard?.uploaded_at || "");
  
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const isBeforeDeadline = new Date() < new Date("2026-07-17T23:59:59Z");

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type !== "application/pdf") {
        setErrorMsg("Solo se permiten archivos en formato PDF.");
        return;
      }
      if (droppedFile.size > 5 * 1024 * 1024) {
        setErrorMsg("El archivo excede el límite de 5MB.");
        return;
      }
      setFile(droppedFile);
      setErrorMsg(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type !== "application/pdf") {
        setErrorMsg("Solo se permiten archivos en formato PDF.");
        return;
      }
      if (selectedFile.size > 5 * 1024 * 1024) {
        setErrorMsg("El archivo excede el límite de 5MB.");
        return;
      }
      setFile(selectedFile);
      setErrorMsg(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileUrl && !file) {
      setErrorMsg("Por favor, selecciona un archivo PDF para subir.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setSuccess(false);

    const supabase = createClient();
    let finalUrl = fileUrl;

    try {
      // 1. If there's a new file, upload it to storage
      if (file) {
        const fileExt = file.name.split(".").pop();
        const filePath = `${userId}/model_card_${Date.now()}.${fileExt}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("model-cards")
          .upload(filePath, file, {
            upsert: true,
            cacheControl: "3600",
          });

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: urlData } = supabase.storage
          .from("model-cards")
          .getPublicUrl(filePath);

        finalUrl = urlData.publicUrl;
      }

      // 2. Save reference to DB using Server Action
      await uploadModelCard(finalUrl, description);

      setFileUrl(finalUrl);
      setUploadedAt(new Date().toISOString());
      setFile(null);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Error al procesar la subida del Model Card.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl">
      {/* Rubric Details & Rules */}
      <div className="lg:col-span-1 space-y-6">
        <div className="premium-card p-6 rounded-2xl border border-[#1A2B3C] bg-[#121212] space-y-4">
          <h2 className="text-xl font-bold text-[#D4AF37] flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Pista Analítica
          </h2>
          <p className="text-sm text-gray-300 leading-relaxed">
            Para participar en la pista analítica, los equipos deben documentar su modelo en una <strong>Ficha Metodológica (Model Card)</strong>.
          </p>
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Rúbrica de Evaluación</h3>
            <ul className="space-y-2.5 text-xs">
              <li className="flex justify-between items-center bg-[#0A0A0A] p-2.5 rounded border border-[#1A2B3C]">
                <span className="text-gray-300">Rigor Analítico</span>
                <strong className="text-[#D4AF37]">30%</strong>
              </li>
              <li className="flex justify-between items-center bg-[#0A0A0A] p-2.5 rounded border border-[#1A2B3C]">
                <span className="text-gray-300">Creatividad</span>
                <strong className="text-[#D4AF37]">30%</strong>
              </li>
              <li className="flex justify-between items-center bg-[#0A0A0A] p-2.5 rounded border border-[#1A2B3C]">
                <span className="text-gray-300">Reproducibilidad</span>
                <strong className="text-[#D4AF37]">20%</strong>
              </li>
              <li className="flex justify-between items-center bg-[#0A0A0A] p-2.5 rounded border border-[#1A2B3C]">
                <span className="text-gray-300">Comunicación</span>
                <strong className="text-[#D4AF37]">20%</strong>
              </li>
            </ul>
          </div>
          <div className="p-3 bg-blue-950/20 border border-blue-900/30 rounded-lg text-[11px] text-blue-300 leading-normal">
            Nota: El rendimiento predictivo de tu polla NO influye en la calificación de la pista analítica. Es evaluada puramente de forma técnica por el jurado.
          </div>
        </div>
      </div>

      {/* Upload Form Box */}
      <div className="lg:col-span-2">
        <Card className="border-[#1A2B3C] bg-[#121212] text-white premium-card">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-[#D4AF37]">Subir Ficha Metodológica</CardTitle>
            <CardDescription className="text-gray-400">
              Adjunta tu documento en PDF (máximo 1 página, tamaño máximo 5MB)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Drag and Drop Zone */}
              {isBeforeDeadline ? (
                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                    dragActive 
                      ? "border-[#D4AF37] bg-[#D4AF37]/5" 
                      : "border-[#1A2B3C] bg-[#0A0A0A] hover:border-gray-500"
                  }`}
                >
                  <input
                    type="file"
                    id="file-upload"
                    accept="application/pdf"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <label htmlFor="file-upload" className="cursor-pointer space-y-3 block">
                    <UploadCloud className="h-12 w-12 text-gray-400 mx-auto" />
                    <div className="text-sm font-semibold">
                      {file ? (
                        <span className="text-[#00B894]">{file.name}</span>
                      ) : (
                        <span>Arrastra tu archivo aquí o haz clic para buscar</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">Solo se admiten archivos PDF de hasta 5MB</p>
                  </label>
                </div>
              ) : (
                <div className="p-4 bg-red-950/20 border border-red-900/30 rounded-lg text-sm text-red-400 flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  <span>El tiempo límite para subir o editar el Model Card ha expirado (17 de Julio, 2026).</span>
                </div>
              )}

              {/* Description Input */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-gray-300">Breve Descripción del Enfoque</Label>
                <Textarea
                  id="description"
                  disabled={!isBeforeDeadline}
                  placeholder="Describe brevemente el modelo implementado (ej. Regresión Logística, Algoritmos genéticos, etc.)"
                  rows={4}
                  className="border-[#1A2B3C] bg-[#0A0A0A] text-white focus:border-[#D4AF37] focus:ring-0 resize-none"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              {/* Upload Status & Actions */}
              {fileUrl && (
                <div className="p-4 rounded-xl bg-[#0A0A0A] border border-[#1A2B3C] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-[#D4AF37] shrink-0" />
                    <div>
                      <p className="font-bold text-sm text-white">Model Card Cargado</p>
                      <p className="text-xs text-gray-400">
                        Subido el: {new Date(uploadedAt).toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 bg-[#1A2B3C] hover:bg-[#1A2B3C]/80 text-white text-xs font-bold px-3 py-2 rounded transition-colors"
                    >
                      <ExternalLink className="h-3.5 w-3.5" /> Ver PDF
                    </a>
                  </div>
                </div>
              )}

              {/* Message Feedbacks */}
              {success && (
                <div className="p-3 bg-[#00B894]/10 border border-[#00B894]/30 rounded-lg text-sm text-[#00B894] flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  <span>¡Model Card subido e indexado con éxito!</span>
                </div>
              )}

              {errorMsg && (
                <div className="p-3 bg-red-950/20 border border-red-500/30 rounded-lg text-sm text-red-200 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {isBeforeDeadline && (
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="bg-[#D4AF37] hover:bg-[#C29E30] text-black font-extrabold px-6 py-5 text-base"
                  >
                    {isLoading ? "Subiendo..." : "Subir y Guardar"}
                  </Button>
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
