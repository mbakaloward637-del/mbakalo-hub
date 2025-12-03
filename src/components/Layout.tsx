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
  const [isRescueTeamMember, setIsRescueTeamMember] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkAdminStatus(session.user.id);
        checkRescueTeamMembership(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          setTimeout(() => {
            checkAdminStatus(session.user.id);
            checkRescueTeamMembership(session.user.id);
          }, 0);
        } else {
          setIsAdmin(false);
          setIsRescueTeamMember(false);
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

  const checkRescueTeamMembership = async (userId: string) => {
    const { data } = await supabase
      .from("rescue_team_members")
      .select("id")
      .eq("user_id", userId)
      .eq("status", "active")
      .single();

    setIsRescueTeamMember(!!data);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const NavLinks = () => (
    <>
      {navigation.map((item) => {
        if (item.href === "/rescue-team" && !isAdmin && !isRescueTeamMember) {
          return null;
        }
        
        const isActive = location.pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.name}
            to={item.href}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all duration-200 font-medium ${
              isActive
                ? "bg-primary text-primary-foreground shadow-soft"
                : "text-foreground hover:bg-muted hover:text-primary"
            }`}
          >
            <Icon className="h-4 w-4" />
            <span>{item.name}</span>
          </Link>
        );
      })}
    </>
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Magazine-style Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-card/95 backdrop-blur-sm shadow-soft">
        <div className="container mx-auto flex h-18 items-center justify-between px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="h-11 w-11 rounded-lg bg-gradient-primary flex items-center justify-center shadow-medium group-hover:shadow-strong transition-shadow">
              <span className="text-primary-foreground font-display font-bold text-xl">M</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="font-display font-bold text-xl text-primary tracking-tight">Mbakalo Rescue Team</h1>
              <p className="text-xs text-muted-foreground tracking-wide uppercase">Community United</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            <NavLinks />
            {isAdmin && (
              <Link
                to="/admin"
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all duration-200 font-medium ${
                  location.pathname === "/admin"
                    ? "bg-primary text-primary-foreground shadow-soft"
                    : "text-foreground hover:bg-muted hover:text-primary"
                }`}
              >
                <Shield className="h-4 w-4" />
                <span>Admin</span>
              </Link>
            )}
          </nav>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="outline" size="icon" className="border-border/50">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 bg-card">
              <div className="flex flex-col gap-2 mt-8">
                <NavLinks />
                {isAdmin && (
                  <Link
                    to="/admin"
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all duration-200 font-medium ${
                      location.pathname === "/admin"
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground hover:bg-muted"
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    <Shield className="h-4 w-4" />
                    <span>Admin</span>
                  </Link>
                )}
                <div className="h-px bg-border my-4" />
                {user ? (
                  <Button variant="ghost" className="justify-start" onClick={() => {
                    handleSignOut();
                    setIsOpen(false);
                  }}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </Button>
                ) : (
                  <Button className="justify-start bg-secondary text-secondary-foreground hover:bg-secondary/90" onClick={() => {
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
            <Button variant="ghost" className="hidden lg:flex hover:bg-muted" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          ) : (
            <Button className="hidden lg:flex bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-soft" asChild>
              <Link to="/auth">Sign In</Link>
            </Button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Magazine-style Footer */}
      <footer className="border-t border-border/50 mt-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div>
              <h3 className="font-display font-bold text-xl mb-4 text-secondary">Mbakalo Rescue Team</h3>
              <p className="text-primary-foreground/80 leading-relaxed">
                Connecting our community through transparency, participation, and development.
              </p>
            </div>
            <div>
              <h3 className="font-display font-bold text-lg mb-4 text-secondary">Quick Links</h3>
              <ul className="space-y-3">
                <li><Link to="/news" className="text-primary-foreground/80 hover:text-secondary transition-colors">Latest News</Link></li>
                <li><Link to="/events" className="text-primary-foreground/80 hover:text-secondary transition-colors">Upcoming Events</Link></li>
                <li><Link to="/leaders" className="text-primary-foreground/80 hover:text-secondary transition-colors">Ward Leaders</Link></li>
                <li><Link to="/install" className="text-primary-foreground/80 hover:text-secondary transition-colors">Install App</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-display font-bold text-lg mb-4 text-secondary">Contact</h3>
              <p className="text-primary-foreground/80 leading-relaxed">
                Rescue Team Office Hours: Mon-Fri, 8AM-5PM
              </p>
            </div>
          </div>
          <div className="border-t border-primary-foreground/20 mt-10 pt-8 text-center">
            <p className="text-primary-foreground/90 font-medium">© 2025 Mbakalo Rescue Team. Built for the people, by the people.</p>
            <p className="mt-2 text-primary-foreground/70">Developed By <span className="text-secondary font-semibold">Laban Panda Khisa</span></p>
          </div>
        </div>
      </footer>
    </div>
  );
};
