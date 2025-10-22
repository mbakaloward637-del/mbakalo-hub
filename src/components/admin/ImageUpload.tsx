import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Upload, Loader2, X } from "lucide-react";

interface ImageUploadProps {
  bucket: "news-images" | "event-images" | "project-images" | "gallery-images";
  onUploadComplete: (url: string) => void;
  currentImageUrl?: string;
}

export default function ImageUpload({ bucket, onUploadComplete, currentImageUrl }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(currentImageUrl || "");

  const uploadImage = async (file: File) => {
    try {
      setUploading(true);

      // Generate unique filename
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
      
      setPreviewUrl(data.publicUrl);
      onUploadComplete(data.publicUrl);
      toast.success("Image uploaded successfully!");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    await uploadImage(file);
  };

  const clearImage = () => {
    setPreviewUrl("");
    onUploadComplete("");
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="image-upload">Image</Label>
      
      {previewUrl ? (
        <div className="relative w-full h-48 border rounded-lg overflow-hidden">
          <img
            src={previewUrl}
            alt="Preview"
            className="w-full h-full object-cover"
          />
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2"
            onClick={clearImage}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Input
            id="image-upload"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading}
            className="flex-1"
          />
          {uploading && <Loader2 className="h-4 w-4 animate-spin" />}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Max file size: 5MB. Supported formats: JPG, PNG, GIF, WEBP
      </p>
    </div>
  );
}
