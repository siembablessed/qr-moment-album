import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Camera, Users, QrCode, Download, Smartphone, Share2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import heroImage from "@/assets/hero-image.jpg";

const Hero = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [eventCode, setEventCode] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleJoinEvent = () => {
    if (eventCode.trim()) {
      // Navigate to the guest page with the event code
      navigate(`/g/${eventCode.trim()}`);
      setIsDialogOpen(false);
      setEventCode("");
    } else {
      toast({
        variant: "destructive",
        title: "Invalid Event Code",
        description: "Please enter a valid event code.",
      });
    }
  };

  return (
    <section className="pt-24 pb-16 px-4">
      <div className="container mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <div className="space-y-6 animate-fade-in">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Share Every
                <span className="bg-gradient-primary bg-clip-text text-transparent block">
                  Magical Moment
                </span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-lg">
                Create unforgettable events where guests can instantly share photos and videos. 
                Generate QR codes, collect memories, and download everything in one place.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                variant="hero" 
                size="xl" 
                className="animate-bounce-in"
                onClick={() => navigate(user ? "/dashboard" : "/auth")}
              >
                <QrCode className="h-5 w-5 mr-2" />
                {user ? "Go to Dashboard" : "Create Event"}
              </Button>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="xl">
                    <Smartphone className="h-5 w-5 mr-2" />
                    Join Event
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Join Event</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Enter the event code to join and share photos
                    </p>
                    <div className="space-y-3">
                      <Input
                        placeholder="Enter event code"
                        value={eventCode}
                        onChange={(e) => setEventCode(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleJoinEvent()}
                      />
                      <Button onClick={handleJoinEvent} className="w-full">
                        Join Event
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            
            {/* Stats */}
            <div className="flex gap-8 pt-8">
              <div>
                <div className="text-2xl font-bold text-primary">50K+</div>
                <div className="text-sm text-muted-foreground">Events Created</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">2M+</div>
                <div className="text-sm text-muted-foreground">Photos Shared</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">99%</div>
                <div className="text-sm text-muted-foreground">Happy Planners</div>
              </div>
            </div>
          </div>
          
          {/* Right content - Image with floating elements */}
          <div className="relative animate-scale-in">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img 
                src={heroImage} 
                alt="People sharing photos at an event" 
                className="w-full h-[500px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
            
            {/* Floating UI elements */}
            <Card className="absolute -top-4 -left-4 p-4 bg-background/90 backdrop-blur-sm border-primary/20 shadow-glow animate-bounce-in" style={{animationDelay: '0.5s'}}>
              <div className="flex items-center gap-3">
                <QrCode className="h-8 w-8 text-primary" />
                <div>
                  <div className="font-semibold text-sm">QR Code Generated</div>
                  <div className="text-xs text-muted-foreground">Share instantly</div>
                </div>
              </div>
            </Card>
            
            <Card className="absolute -bottom-4 -right-4 p-4 bg-background/90 backdrop-blur-sm border-accent/20 shadow-lg animate-bounce-in" style={{animationDelay: '1s'}}>
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-primary border-2 border-background" />
                  <div className="w-8 h-8 rounded-full bg-accent border-2 border-background" />
                  <div className="w-8 h-8 rounded-full bg-success border-2 border-background" />
                </div>
                <div>
                  <div className="font-semibold text-sm">156 Photos</div>
                  <div className="text-xs text-muted-foreground">Just uploaded</div>
                </div>
              </div>
            </Card>
            
            <Card className="absolute top-1/2 -left-6 p-3 bg-background/90 backdrop-blur-sm border-success/20 shadow-md animate-bounce-in" style={{animationDelay: '1.5s'}}>
              <div className="text-center">
                <Share2 className="h-6 w-6 text-success mx-auto mb-1" />
                <div className="text-xs font-medium">Live Sharing</div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;