import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const galleryItems = [
  {
    title: "Borehole Groundbreaking Ceremony",
    category: "Development",
    date: "March 2025",
  },
  {
    title: "Youth Training Graduation",
    category: "Education",
    date: "February 2025",
  },
  {
    title: "Community Clean-Up Day",
    category: "Environment",
    date: "February 2025",
  },
  {
    title: "Women's Group Meeting",
    category: "Community",
    date: "January 2025",
  },
  {
    title: "Football Tournament Finals",
    category: "Sports",
    date: "January 2025",
  },
  {
    title: "Ward Leaders Meeting",
    category: "Governance",
    date: "December 2024",
  },
];

export default function Gallery() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Community Gallery</h1>
        <p className="text-lg text-muted-foreground">
          Moments and memories from Mbakalo Ward activities
        </p>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-8">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="development">Development</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="community">Community</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {galleryItems.map((item, index) => (
              <Card key={index} className="shadow-medium hover:shadow-strong transition-shadow overflow-hidden group">
                <div className="aspect-video bg-gradient-primary relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center text-white text-4xl opacity-20">
                    📷
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                    <Badge className="bg-white/20 text-white mb-2">{item.category}</Badge>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.date}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="development">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {galleryItems.filter(item => item.category === "Development").map((item, index) => (
              <Card key={index} className="shadow-medium overflow-hidden">
                <div className="aspect-video bg-gradient-primary"></div>
                <CardContent className="p-4">
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.date}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="events">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {galleryItems.filter(item => ["Sports", "Community"].includes(item.category)).map((item, index) => (
              <Card key={index} className="shadow-medium overflow-hidden">
                <div className="aspect-video bg-gradient-primary"></div>
                <CardContent className="p-4">
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.date}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="community">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {galleryItems.filter(item => item.category === "Community").map((item, index) => (
              <Card key={index} className="shadow-medium overflow-hidden">
                <div className="aspect-video bg-gradient-primary"></div>
                <CardContent className="p-4">
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.date}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <Card className="shadow-medium mt-12 text-center">
        <CardContent className="p-12">
          <p className="text-muted-foreground">
            Photo and video galleries will be updated regularly with community events and development progress
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
