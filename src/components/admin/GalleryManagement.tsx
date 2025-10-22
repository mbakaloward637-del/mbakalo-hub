import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ImageUpload from "./ImageUpload";
import { toast } from "sonner";

export default function GalleryManagement() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!imageUrl) {
      toast.error("Please upload an image");
      return;
    }

    try {
      const { error } = await supabase
        .from("gallery_images")
        .insert({
          title,
          description,
          category,
          image_url: imageUrl,
        });

      if (error) throw error;

      toast.success("Gallery image added successfully!");
      setTitle("");
      setDescription("");
      setCategory("");
      setImageUrl("");
    } catch (error) {
      console.error("Error adding gallery image:", error);
      toast.error("Failed to add gallery image");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Select value={category} onValueChange={setCategory} required>
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Development">Development</SelectItem>
            <SelectItem value="Events">Events</SelectItem>
            <SelectItem value="Community">Community</SelectItem>
            <SelectItem value="Youth">Youth</SelectItem>
            <SelectItem value="Projects">Projects</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <ImageUpload
        bucket="gallery-images"
        onUploadComplete={setImageUrl}
        currentImageUrl={imageUrl}
      />

      <Button type="submit">Add to Gallery</Button>
    </form>
  );
}
