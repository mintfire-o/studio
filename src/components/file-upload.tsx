'use client';

import React, { useState, type ChangeEvent, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { UploadCloud, XCircle, Image as ImageIcon } from 'lucide-react';
import NextImage from 'next/image'; // Renamed to avoid conflict

interface FileUploadProps {
  onFileUpload: (fileData: { name: string; dataUrl: string }) => void;
  acceptedFileTypes?: string; // e.g., "image/jpeg, image/png"
  maxFileSize?: number; // in bytes
}

export function FileUpload({
  onFileUpload,
  acceptedFileTypes = "image/jpeg, image/png, image/webp",
  maxFileSize = 5 * 1024 * 1024, // 5MB
}: FileUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > maxFileSize) {
        setError(`File is too large. Max size is ${maxFileSize / (1024 * 1024)}MB.`);
        setPreview(null);
        setFileName(null);
        return;
      }
      if (!acceptedFileTypes.split(', ').includes(file.type)) {
        setError(`Invalid file type. Accepted types: ${acceptedFileTypes}.`);
        setPreview(null);
        setFileName(null);
        return;
      }

      setError(null);
      setFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setPreview(dataUrl);
        onFileUpload({ name: file.name, dataUrl });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setPreview(null);
    setFileName(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Reset file input
    }
    onFileUpload({ name: "", dataUrl: "" }); // Notify parent about removal
  };

  return (
    <div className="w-full space-y-4">
      <Label htmlFor="file-upload" className="cursor-pointer">
        <div className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg border-muted-foreground/50 hover:border-primary transition-colors bg-card hover:bg-accent/10">
          {preview ? (
            <div className="relative w-full h-full">
              <NextImage src={preview} alt={fileName || "Preview"} layout="fill" objectFit="contain" className="rounded-lg" />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
              <UploadCloud className="w-12 h-12 mb-3 text-muted-foreground" />
              <p className="mb-2 text-sm text-muted-foreground">
                <span className="font-semibold text-primary">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-muted-foreground">PNG, JPG, WEBP (MAX. {maxFileSize / (1024 * 1024)}MB)</p>
            </div>
          )}
        </div>
      </Label>
      <Input
        id="file-upload"
        type="file"
        className="hidden"
        onChange={handleFileChange}
        accept={acceptedFileTypes}
        ref={fileInputRef}
      />
      {fileName && !error && (
        <div className="flex items-center justify-between p-3 rounded-md border bg-muted/50">
          <div className="flex items-center space-x-2">
            <ImageIcon className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium">{fileName}</span>
          </div>
          <Button variant="ghost" size="icon" onClick={handleRemoveImage} aria-label="Remove image">
            <XCircle className="w-5 h-5 text-destructive" />
          </Button>
        </div>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
