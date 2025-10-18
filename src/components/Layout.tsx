import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, Newspaper, Heart, MessageSquare, Calendar, Users, TrendingUp, Image, Menu, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import kenyaFlag from "@/assets/kenya-flag.png";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

const navigation = [
  { name: "Home", href: "/", icon: Home },
  { name: "News & Politics", href: "/news", icon: Newspaper },
  { name: "Funerals", href: "/funerals", icon: Heart },
  { name: "Gossip", href: "/gossip", icon: MessageSquare },
  { name: "Events", href: "/events", icon: Calendar },
  { name: "Leaders", href: "/leaders", icon: Users },
  { name: "Youth", href: "/youth", icon: TrendingUp },
  { name: "Gallery", href: "/gallery", icon: Image },
];

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const NavLinks = () => (
    <>
      {navigation.map((item) => {
        const isActive = location.pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.name}
            to={item.href}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-foreground hover:bg-muted"
            }`}
          >
            <Icon className="h-5 w-5" />
            <span className="font-medium">{item.name}</span>
          </Link>
        );
      })}
    </>
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-card shadow-soft">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-full bg-gradient-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xl">M</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="font-bold text-lg">Mbakalo Rescue Team</h1>
              <p className="text-xs text-muted-foreground">Community United</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            <NavLinks />
          </nav>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="outline" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              <div className="flex flex-col gap-2 mt-8">
                <NavLinks />
                {user ? (
                  <Button variant="ghost" className="justify-start" onClick={() => {
                    handleSignOut();
                    setIsOpen(false);
                  }}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </Button>
                ) : (
                  <Button className="justify-start" onClick={() => {
                    navigate("/auth");
                    setIsOpen(false);
                  }}>
                    Sign In
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>

          {user ? (
            <Button variant="ghost" className="hidden lg:flex" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          ) : (
            <Button className="hidden lg:flex" asChild>
              <Link to="/auth">Sign In</Link>
            </Button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t mt-16 relative overflow-hidden">
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url(${kenyaFlag})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        />
        <div className="relative bg-card/90 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="font-bold mb-3">Mbakalo Rescue Team</h3>
                <p className="text-sm text-muted-foreground">
                  Connecting our community through transparency, participation, and development.
                </p>
              </div>
              <div>
                <h3 className="font-bold mb-3">Quick Links</h3>
                <ul className="space-y-2 text-sm">
                  <li><Link to="/news" className="text-muted-foreground hover:text-primary">Latest News</Link></li>
                  <li><Link to="/events" className="text-muted-foreground hover:text-primary">Upcoming Events</Link></li>
                  <li><Link to="/leaders" className="text-muted-foreground hover:text-primary">Ward Leaders</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold mb-3">Contact</h3>
                <p className="text-sm text-muted-foreground">
                  Ward Office Hours: Mon-Fri, 8AM-5PM
                </p>
              </div>
            </div>
            <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
              <p>© 2025 Mbakalo Rescue Team. Built for the people, by the people.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
