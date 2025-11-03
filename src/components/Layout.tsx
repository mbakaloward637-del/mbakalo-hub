import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, Newspaper, Heart, MessageSquare, Calendar, Users, TrendingUp, Image, Menu, LogOut, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
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
  { name: "Rescue Team", href: "/rescue-team", icon: Shield },
  { name: "Gallery", href: "/gallery", icon: Image },
];

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkAdminStatus(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          setTimeout(() => {
            checkAdminStatus(session.user.id);
          }, 0);
        } else {
          setIsAdmin(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const checkAdminStatus = async (userId: string) => {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .single();

    setIsAdmin(!!data);
  };

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
            {isAdmin && (
              <Link
                to="/admin"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  location.pathname === "/admin"
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-muted"
                }`}
              >
                <Shield className="h-5 w-5" />
                <span className="font-medium">Admin</span>
              </Link>
            )}
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
                {isAdmin && (
                  <Link
                    to="/admin"
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                      location.pathname === "/admin"
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground hover:bg-muted"
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    <Shield className="h-5 w-5" />
                    <span className="font-medium">Admin</span>
                  </Link>
                )}
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
      <footer className="border-t border-red-600 mt-16 bg-black">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-bold mb-3 text-amber-400 text-lg">Mbakalo Rescue Team</h3>
              <p className="text-sm text-white">
                Connecting our community through transparency, participation, and development.
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-3 text-amber-400 text-lg">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/news" className="text-white hover:text-amber-400 transition-colors">Latest News</Link></li>
                <li><Link to="/events" className="text-white hover:text-amber-400 transition-colors">Upcoming Events</Link></li>
                <li><Link to="/leaders" className="text-white hover:text-amber-400 transition-colors">Ward Leaders</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-3 text-amber-400 text-lg">Contact</h3>
              <p className="text-sm text-white">
                Ward Office Hours: Mon-Fri, 8AM-5PM
              </p>
            </div>
          </div>
          <div className="border-t border-red-600 mt-8 pt-8 text-center text-sm">
            <p className="text-white font-medium">© 2025 Mbakalo Rescue Team. Built for the people, by the people.</p>
            <p className="mt-2 text-white">Developed By <span className="text-amber-400 font-semibold">Laban Panda Khisa</span></p>
          </div>
        </div>
      </footer>
    </div>
  );
};
