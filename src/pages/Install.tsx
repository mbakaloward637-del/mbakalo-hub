import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Download, CheckCircle, Smartphone, Chrome, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Install() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>("default");
  const { toast } = useToast();

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Listen for install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Check notification permission
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      toast({
        title: "Installation not available",
        description: "Your browser doesn't support app installation or the app is already installed.",
        variant: "destructive"
      });
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      toast({
        title: "Installation started",
        description: "Mbakalo Rescue Team is being installed on your device!"
      });
      setDeferredPrompt(null);
      setIsInstalled(true);
    }
  };

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      toast({
        title: "Not supported",
        description: "Your browser doesn't support notifications.",
        variant: "destructive"
      });
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);

      if (permission === 'granted') {
        toast({
          title: "Notifications enabled!",
          description: "You'll receive alerts for new rescue team messages."
        });

        // Send test notification
        new Notification("Mbakalo Rescue Team", {
          body: "You'll now receive notifications for emergency updates!",
          icon: "/icon-192.png",
          badge: "/icon-192.png"
        });
      } else {
        toast({
          title: "Permission denied",
          description: "You won't receive notifications. You can change this in your browser settings.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Notification permission error:', error);
      toast({
        title: "Error",
        description: "Could not request notification permission.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Install Mbakalo Rescue Team</h1>
          <p className="text-xl text-muted-foreground">
            Get instant access to emergency coordination and community updates
          </p>
        </div>

        {/* Installation Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="bg-red-500 p-3 rounded-lg">
                <Download className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle>Install the App</CardTitle>
                <CardDescription>Add Mbakalo Rescue Team to your home screen</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {isInstalled ? (
              <div className="flex items-center gap-3 p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                <CheckCircle className="h-6 w-6 text-green-500" />
                <div>
                  <p className="font-semibold text-green-700 dark:text-green-400">Already Installed!</p>
                  <p className="text-sm text-muted-foreground">
                    You can access the app from your home screen
                  </p>
                </div>
              </div>
            ) : deferredPrompt ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Install the app for quick access, offline support, and push notifications.
                </p>
                <Button onClick={handleInstall} size="lg" className="w-full bg-red-500 hover:bg-red-600">
                  <Download className="mr-2 h-5 w-5" />
                  Install Now
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                  <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div className="space-y-2 text-sm">
                    <p className="font-semibold text-blue-700 dark:text-blue-400">Manual Installation</p>
                    <div className="space-y-2 text-muted-foreground">
                      <p><strong>On iPhone/iPad:</strong></p>
                      <ol className="list-decimal list-inside space-y-1 ml-2">
                        <li>Tap the Share button in Safari</li>
                        <li>Scroll down and tap "Add to Home Screen"</li>
                        <li>Tap "Add" in the top right</li>
                      </ol>
                      
                      <p className="mt-3"><strong>On Android:</strong></p>
                      <ol className="list-decimal list-inside space-y-1 ml-2">
                        <li>Tap the menu (⋮) in your browser</li>
                        <li>Select "Add to Home screen" or "Install app"</li>
                        <li>Tap "Add" or "Install"</li>
                      </ol>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Offline Access</p>
                  <p className="text-xs text-muted-foreground">Works without internet</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Fast Loading</p>
                  <p className="text-xs text-muted-foreground">Instant startup</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Push Alerts</p>
                  <p className="text-xs text-muted-foreground">Real-time updates</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Native Feel</p>
                  <p className="text-xs text-muted-foreground">Like a real app</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="bg-orange-500 p-3 rounded-lg">
                <Bell className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle>Enable Notifications</CardTitle>
                <CardDescription>Stay updated on emergency messages and alerts</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Notification Status</p>
                <p className="text-sm text-muted-foreground">
                  {notificationPermission === 'granted' 
                    ? 'Enabled - You\'ll receive alerts' 
                    : notificationPermission === 'denied'
                    ? 'Blocked - Change in browser settings'
                    : 'Not enabled yet'}
                </p>
              </div>
              <Badge variant={notificationPermission === 'granted' ? 'default' : 'secondary'}>
                {notificationPermission === 'granted' ? 'Enabled' : 
                 notificationPermission === 'denied' ? 'Blocked' : 'Disabled'}
              </Badge>
            </div>

            {notificationPermission !== 'granted' && notificationPermission !== 'denied' && (
              <Button 
                onClick={requestNotificationPermission} 
                variant="outline" 
                className="w-full"
              >
                <Bell className="mr-2 h-4 w-4" />
                Enable Notifications
              </Button>
            )}

            {notificationPermission === 'denied' && (
              <div className="flex items-start gap-3 p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
                <div className="text-sm space-y-2">
                  <p className="font-semibold text-yellow-700 dark:text-yellow-400">
                    Notifications Blocked
                  </p>
                  <p className="text-muted-foreground">
                    To enable notifications, please:
                  </p>
                  <ol className="list-decimal list-inside space-y-1 ml-2 text-muted-foreground">
                    <li>Open your browser settings</li>
                    <li>Find site permissions or notifications</li>
                    <li>Allow notifications for this site</li>
                    <li>Refresh the page</li>
                  </ol>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Features Card */}
        <Card>
          <CardHeader>
            <CardTitle>App Features</CardTitle>
            <CardDescription>What you get with the installed app</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Smartphone className="h-5 w-5 text-red-500 mt-0.5" />
                <div>
                  <p className="font-medium">Full Screen Experience</p>
                  <p className="text-sm text-muted-foreground">
                    No browser UI, just your content
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Bell className="h-5 w-5 text-orange-500 mt-0.5" />
                <div>
                  <p className="font-medium">Real-time Alerts</p>
                  <p className="text-sm text-muted-foreground">
                    Get notified instantly about rescue team messages
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Chrome className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <p className="font-medium">Home Screen Icon</p>
                  <p className="text-sm text-muted-foreground">
                    Quick access like any other app
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
