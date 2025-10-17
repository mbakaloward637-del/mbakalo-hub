import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, Calendar, MapPin, Users } from "lucide-react";

const funeralNotices = [
  {
    name: "Mama Grace Wanjiru",
    age: 68,
    date: "Passed: March 5, 2025",
    burialDate: "Saturday, March 11, 2025",
    time: "10:00 AM",
    location: "Family Home, Mbakalo Village",
    family: "Wanjiru Family",
    fundraising: true,
    target: 150000,
    raised: 89000,
  },
  {
    name: "Mzee John Kimani",
    age: 75,
    date: "Passed: March 3, 2025",
    burialDate: "Friday, March 10, 2025",
    time: "11:00 AM",
    location: "St. Peter's Church, Mbakalo",
    family: "Kimani Family",
    fundraising: true,
    target: 200000,
    raised: 145000,
  },
];

const condolenceMessages = [
  {
    family: "Wanjiru Family",
    sender: "Peter M.",
    message: "Our deepest condolences. Mama Grace was a pillar of our community.",
    time: "2 hours ago",
  },
  {
    family: "Kimani Family",
    sender: "Mary N.",
    message: "May Mzee Kimani rest in eternal peace. He will be greatly missed.",
    time: "5 hours ago",
  },
];

export default function Funerals() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Funerals & Notices</h1>
        <p className="text-lg text-muted-foreground">
          Pay respects and support families during difficult times
        </p>
      </div>

      {/* Current Notices */}
      <div className="space-y-8 mb-12">
        <h2 className="text-2xl font-bold">Current Funeral Notices</h2>
        {funeralNotices.map((notice, index) => (
          <Card key={index} className="shadow-strong border-muted">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                      <Heart className="h-8 w-8 text-secondary" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl">{notice.name}</CardTitle>
                      <CardDescription>Age: {notice.age} years</CardDescription>
                      <p className="text-sm text-muted-foreground mt-1">{notice.date}</p>
                    </div>
                  </div>
                </div>
                <Badge className="bg-secondary">{notice.family}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-primary" />
                    <div>
                      <p className="font-medium">Burial Date</p>
                      <p className="text-muted-foreground">{notice.burialDate} at {notice.time}</p>
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

                {notice.fundraising && (
                  <div className="p-4 bg-muted rounded-lg">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Funeral Fundraising
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Raised:</span>
                        <span className="font-semibold">
                          KSh {notice.raised.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Target:</span>
                        <span>KSh {notice.target.toLocaleString()}</span>
                      </div>
                      <div className="h-2 bg-background rounded-full overflow-hidden">
                        <div
                          className="h-full bg-secondary transition-all"
                          style={{ width: `${(notice.raised / notice.target) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <Button className="flex-1" variant="outline">
                  Send Condolences
                </Button>
                {notice.fundraising && (
                  <Button className="flex-1 bg-secondary">
                    Support via M-Pesa
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Condolences */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Recent Condolence Messages</h2>
        <div className="space-y-4">
          {condolenceMessages.map((msg, index) => (
            <Card key={index} className="shadow-soft">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                    <span className="font-semibold text-sm">
                      {msg.sender.split(" ").map(n => n[0]).join("")}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-semibold text-sm">{msg.sender}</p>
                        <p className="text-xs text-muted-foreground">To: {msg.family}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">{msg.time}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{msg.message}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Community Support Info */}
      <Card className="shadow-medium border-primary mt-12">
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
          <p>
            <strong>Report False Information:</strong> Contact ward office immediately if you suspect false notices.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
