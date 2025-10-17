import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, AlertCircle, HelpCircle, XCircle, MessageSquare } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const gossipPosts = [
  {
    id: 1,
    title: "New Business Opening at Mbakalo Market",
    content: "Word is there's a new hardware store opening next week at the market. They say prices will be lower than the current shops.",
    status: "verified",
    category: "Business",
    author: "Anonymous",
    date: "2 hours ago",
    comments: 12,
  },
  {
    id: 2,
    title: "Youth Group Wins County Grant",
    content: "Mbakalo Youth Development Group reportedly won a KSh 500,000 grant from the county. Awaiting official announcement.",
    status: "investigating",
    category: "Youth",
    author: "Community Member",
    date: "5 hours ago",
    comments: 24,
  },
  {
    id: 3,
    title: "Road Construction Delayed?",
    content: "Rumors that the promised road construction might be delayed due to contractor issues. No official word yet.",
    status: "unverified",
    category: "Development",
    author: "Concerned Citizen",
    date: "1 day ago",
    comments: 45,
  },
  {
    id: 4,
    title: "Free Land Claims Are False",
    content: "Claims circulating about free land distribution in Mbakalo are completely false. The Ward Office has issued a statement.",
    status: "debunked",
    category: "Land",
    author: "Ward Office",
    date: "2 days ago",
    comments: 89,
  },
];

const statusConfig = {
  verified: {
    icon: CheckCircle2,
    label: "Verified",
    color: "bg-status-verified",
    textColor: "text-white",
  },
  investigating: {
    icon: AlertCircle,
    label: "Investigating",
    color: "bg-status-investigating",
    textColor: "text-white",
  },
  unverified: {
    icon: HelpCircle,
    label: "Unverified",
    color: "bg-status-unverified",
    textColor: "text-white",
  },
  debunked: {
    icon: XCircle,
    label: "Debunked",
    color: "bg-status-debunked",
    textColor: "text-white",
  },
};

export default function Gossip() {
  const [newPost, setNewPost] = useState("");

  const handleSubmit = () => {
    if (!newPost.trim()) {
      toast.error("Please write something before submitting");
      return;
    }
    toast.success("Your post has been submitted for review by moderators");
    setNewPost("");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Community Gossip</h1>
        <p className="text-lg text-muted-foreground">
          Share news and updates. All posts are reviewed for accuracy before publication.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {Object.entries(statusConfig).map(([key, config]) => {
            const Icon = config.icon;
            return (
              <Badge key={key} className={`${config.color} ${config.textColor}`}>
                <Icon className="h-3 w-3 mr-1" />
                {config.label}
              </Badge>
            );
          })}
        </div>
      </div>

      {/* Submit New Gossip */}
      <Card className="shadow-medium mb-8">
        <CardHeader>
          <CardTitle>Share Community News</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="What's happening in Mbakalo? Share news, updates, or ask questions..."
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            rows={4}
          />
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Posts are reviewed by moderators before publishing
            </p>
            <Button className="bg-gradient-primary" onClick={handleSubmit}>
              Submit for Review
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Gossip Feed */}
      <div className="space-y-6">
        {gossipPosts.map((post) => {
          const status = statusConfig[post.status as keyof typeof statusConfig];
          const StatusIcon = status.icon;

          return (
            <Card key={post.id} className="shadow-medium hover:shadow-strong transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge className={`${status.color} ${status.textColor}`}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {status.label}
                      </Badge>
                      <Badge variant="outline">{post.category}</Badge>
                    </div>
                    <CardTitle className="text-xl mb-2">{post.title}</CardTitle>
                    <p className="text-muted-foreground">{post.content}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <span>Posted by {post.author}</span>
                    <span>{post.date}</span>
                  </div>
                  <Button variant="ghost" size="sm">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    {post.comments} comments
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Info Section */}
      <Card className="shadow-medium mt-8 border-primary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-primary" />
            How Community Gossip Works
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p>
            <strong>🔍 All posts are reviewed:</strong> Our moderation team verifies information before it's published to prevent misinformation.
          </p>
          <p>
            <strong>✅ Status labels:</strong> Every post shows its verification status so you know what to trust.
          </p>
          <p>
            <strong>📢 Report inaccuracies:</strong> If you see false information, report it to help keep our community informed.
          </p>
          <p>
            <strong>🤝 Be responsible:</strong> Only share information you believe to be true. False reports can harm our community.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
