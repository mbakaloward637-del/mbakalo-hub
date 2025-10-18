import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Heart, Calendar, MapPin, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { User } from "@supabase/supabase-js";

interface FuneralNotice {
  id: string;
  deceased_name: string;
  age: number | null;
  passed_date: string;
  burial_date: string;
  burial_time: string;
  location: string;
  family_name: string;
  fundraising_enabled: boolean;
  fundraising_target: number | null;
  fundraising_raised: number;
  condolences?: Condolence[];
}

interface Condolence {
  id: string;
  message: string;
  created_at: string;
  profiles: {
    full_name: string;
  };
}

export default function Funerals() {
  const [user, setUser] = useState<User | null>(null);
  const [notices, setNotices] = useState<FuneralNotice[]>([]);
  const [loading, setLoading] = useState(true);
  const [condolenceInputs, setCondolenceInputs] = useState<Record<string, string>>({});
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

    fetchNotices();

    return () => subscription.unsubscribe();
  }, []);

  const fetchNotices = async () => {
    const { data, error } = await supabase
      .from("funeral_notices")
      .select(`
        *,
        condolences(
          id,
          message,
          created_at,
          profiles(full_name)
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching notices:", error);
    } else {
      setNotices(data || []);
    }
    setLoading(false);
  };

  const handleSendCondolence = async (funeralId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to send condolences",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    const message = condolenceInputs[funeralId]?.trim();
    if (!message) {
      toast({
        title: "Error",
        description: "Please enter a message",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("condolences")
        .insert({
          funeral_id: funeralId,
          user_id: user.id,
          message,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Your condolence message has been sent",
      });

      setCondolenceInputs({ ...condolenceInputs, [funeralId]: "" });
      fetchNotices();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>Loading funeral notices...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Funerals & Notices</h1>
        <p className="text-lg text-muted-foreground">
          Pay respects and support families during difficult times
        </p>
      </div>

      {notices.length === 0 ? (
        <Card className="shadow-medium">
          <CardContent className="p-8 text-center">
            <Heart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No funeral notices at the moment.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8 mb-12">
          <h2 className="text-2xl font-bold">Current Funeral Notices</h2>
          {notices.map((notice) => (
            <Card key={notice.id} className="shadow-strong border-muted">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                        <Heart className="h-8 w-8 text-secondary" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl">{notice.deceased_name}</CardTitle>
                        {notice.age && <CardDescription>Age: {notice.age} years</CardDescription>}
                        <p className="text-sm text-muted-foreground mt-1">{notice.passed_date}</p>
                      </div>
                    </div>
                  </div>
                  <Badge className="bg-secondary">{notice.family_name}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-primary" />
                      <div>
                        <p className="font-medium">Burial Date</p>
                        <p className="text-muted-foreground">{notice.burial_date} at {notice.burial_time}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-primary" />
                      <div>
                        <p className="font-medium">Location</p>
                        <p className="text-muted-foreground">{notice.location}</p>
                      </div>
                    </div>
                  </div>

                  {notice.fundraising_enabled && notice.fundraising_target && (
                    <div className="p-4 bg-muted rounded-lg">
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Funeral Fundraising
                      </h3>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Raised:</span>
                          <span className="font-semibold">
                            KSh {notice.fundraising_raised.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Target:</span>
                          <span>KSh {notice.fundraising_target.toLocaleString()}</span>
                        </div>
                        <div className="h-2 bg-background rounded-full overflow-hidden">
                          <div
                            className="h-full bg-secondary transition-all"
                            style={{ width: `${(notice.fundraising_raised / notice.fundraising_target) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Condolences */}
                <div className="mt-6 pt-6 border-t">
                  <h4 className="font-semibold mb-4">Condolence Messages ({notice.condolences?.length || 0})</h4>

                  {notice.condolences && notice.condolences.length > 0 && (
                    <div className="space-y-3 mb-4">
                      {notice.condolences.map((condolence) => (
                        <div key={condolence.id} className="bg-muted p-3 rounded-lg">
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-semibold text-sm">
                              {condolence.profiles?.full_name || "Anonymous"}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(condolence.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm">{condolence.message}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {user ? (
                    <div className="space-y-2">
                      <Textarea
                        placeholder="Share your condolence message..."
                        value={condolenceInputs[notice.id] || ""}
                        onChange={(e) =>
                          setCondolenceInputs({ ...condolenceInputs, [notice.id]: e.target.value })
                        }
                        rows={3}
                      />
                      <Button
                        onClick={() => handleSendCondolence(notice.id)}
                        className="w-full"
                      >
                        Send Condolences
                      </Button>
                    </div>
                  ) : (
                    <p className="text-sm text-center text-muted-foreground">
                      <Button variant="link" onClick={() => navigate("/auth")}>
                        Sign in
                      </Button>
                      to send condolences
                    </p>
                  )}
                </div>

                {notice.fundraising_enabled && (
                  <Button className="w-full bg-secondary mt-4">
                    Support via M-Pesa
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card className="shadow-medium border-primary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-secondary" />
            Community Support During Loss
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p>
            <strong>Verified Notices:</strong> All funeral notices are verified by ward leaders before publication.
          </p>
          <p>
            <strong>Financial Support:</strong> Contribute via M-Pesa to verified family fundraising accounts.
          </p>
          <p>
            <strong>Privacy Respected:</strong> Family wishes regarding privacy and contributions are honored.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
