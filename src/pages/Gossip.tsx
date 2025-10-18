import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, AlertCircle, XCircle, Search, MessageSquare, Upload, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

const statusConfig = {
  verified: {
    icon: CheckCircle2,
    label: "Verified",
    variant: "default" as const,
  },
  investigating: {
    icon: Search,
    label: "Investigating",
    variant: "secondary" as const,
  },
  unverified: {
    icon: AlertCircle,
    label: "Unverified",
    variant: "outline" as const,
  },
  debunked: {
    icon: XCircle,
    label: "Debunked",
    variant: "destructive" as const,
  },
};

interface Post {
  id: string;
  title: string;
  content: string;
  image_url: string | null;
  status: keyof typeof statusConfig;
  category: string;
  created_at: string;
  profiles: {
    full_name: string;
  };
}

const GossipNew = () => {
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState({ title: "", content: "", category: "" });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    fetchPosts();

    return () => subscription.unsubscribe();
  }, []);

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from("posts")
      .select(`
        *,
        profiles(full_name)
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching posts:", error);
    } else {
      setPosts((data as Post[]) || []);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "Image size must be less than 5MB",
          variant: "destructive",
        });
        return;
      }
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to post",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    if (!newPost.title || !newPost.content) {
      toast({
        title: "Error",
        description: "Please fill in title and content",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      let imageUrl = null;

      // Upload image if selected
      if (selectedImage) {
        const fileExt = selectedImage.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('post-images')
          .upload(filePath, selectedImage);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('post-images')
          .getPublicUrl(filePath);

        imageUrl = publicUrl;
      }

      // Insert post
      const { error: insertError } = await supabase
        .from("posts")
        .insert({
          user_id: user.id,
          title: newPost.title,
          content: newPost.content,
          category: newPost.category || "General",
          image_url: imageUrl,
          status: "unverified",
        });

      if (insertError) throw insertError;

      toast({
        title: "Success",
        description: "Your post has been submitted for review",
      });

      setNewPost({ title: "", content: "", category: "" });
      setSelectedImage(null);
      setImagePreview("");
      fetchPosts();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit post",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Community News</h1>
        <p className="text-muted-foreground">Share and discover what's happening in Mbakalo Ward</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {Object.entries(statusConfig).map(([status, config]) => {
          const Icon = config.icon;
          return (
            <Badge key={status} variant={config.variant}>
              <Icon className="w-3 h-3 mr-1" />
              {config.label}
            </Badge>
          );
        })}
      </div>

      {user ? (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Share Community News</CardTitle>
            <CardDescription>Your post will be reviewed before being published</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="What's happening?"
                value={newPost.title}
                onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                placeholder="e.g. Development, Events, Announcement"
                value={newPost.category}
                onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="content">Details</Label>
              <Textarea
                id="content"
                placeholder="Share more details..."
                value={newPost.content}
                onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                rows={4}
              />
            </div>
            <div>
              <Label htmlFor="image">Photo (optional)</Label>
              <div className="mt-2">
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  onClick={() => document.getElementById('image')?.click()}
                  className="w-full"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {selectedImage ? selectedImage.name : "Upload Photo"}
                </Button>
              </div>
              {imagePreview && (
                <div className="mt-4 relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full max-h-64 object-cover rounded-md"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => {
                      setSelectedImage(null);
                      setImagePreview("");
                    }}
                  >
                    Remove
                  </Button>
                </div>
              )}
            </div>
            <Button onClick={handleSubmit} disabled={loading} className="w-full">
              {loading ? "Submitting..." : "Submit Post"}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="mb-8 bg-muted">
          <CardContent className="pt-6 text-center">
            <p className="mb-4">Sign in to share community news and updates</p>
            <Button onClick={() => navigate("/auth")}>Sign In</Button>
          </CardContent>
        </Card>
      )}

      <Separator className="my-8" />

      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Recent Posts</h2>
        {posts.map((post) => {
          const StatusIcon = statusConfig[post.status].icon;
          return (
            <Card key={post.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="mb-2">{post.title}</CardTitle>
                    <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                      <span>{post.profiles?.full_name || "Anonymous"}</span>
                      <span>•</span>
                      <span>{new Date(post.created_at).toLocaleDateString()}</span>
                      {post.category && (
                        <>
                          <span>•</span>
                          <span>{post.category}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <Badge variant={statusConfig[post.status].variant}>
                    <StatusIcon className="w-3 h-3 mr-1" />
                    {statusConfig[post.status].label}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{post.content}</p>
                {post.image_url && (
                  <div className="mb-4">
                    <img
                      src={post.image_url}
                      alt="Post image"
                      className="w-full max-h-96 object-cover rounded-md"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Verification Process</h3>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li><strong>Unverified:</strong> New posts awaiting review</li>
              <li><strong>Investigating:</strong> Community moderators are checking the facts</li>
              <li><strong>Verified:</strong> Confirmed as accurate by our team</li>
              <li><strong>Debunked:</strong> Proven to be false or misleading</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Community Guidelines</h3>
            <p className="text-muted-foreground">
              Share responsibly. Misinformation hurts our community. Always verify before posting,
              and be respectful in your communications.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GossipNew;
