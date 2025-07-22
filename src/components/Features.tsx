import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { QrCode, Camera, Download, Users, Shield, Zap } from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: QrCode,
      title: "Instant QR Codes",
      description: "Generate unique QR codes for each event. Guests simply scan to start sharing photos instantly.",
      color: "text-primary"
    },
    {
      icon: Camera,
      title: "Smart Photo Upload",
      description: "Seamless photo and video uploads directly from guests' devices. No app download required.",
      color: "text-accent"
    },
    {
      icon: Users,
      title: "Real-time Gallery",
      description: "Watch your event album fill up in real-time as guests share their favorite moments.",
      color: "text-success"
    },
    {
      icon: Download,
      title: "Bulk Download",
      description: "Download all photos and videos with one click. Perfect for creating lasting memories.",
      color: "text-warning"
    },
    {
      icon: Shield,
      title: "Private & Secure",
      description: "Your event photos are private and secure. Only invited guests can contribute to your album.",
      color: "text-primary"
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Optimized for speed. Photos appear in the gallery within seconds of being uploaded.",
      color: "text-accent"
    }
  ];

  return (
    <section id="features" className="py-16 px-4 bg-gradient-muted">
      <div className="container mx-auto">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Everything You Need for
            <span className="bg-gradient-primary bg-clip-text text-transparent"> Perfect Events</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From QR code generation to photo management, we've got every aspect of event photo sharing covered.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card 
              key={index}
              className="group hover:shadow-glow transition-all duration-300 hover:translate-y-[-4px] animate-scale-in border-border/50"
              style={{animationDelay: `${index * 0.1}s`}}
            >
              <CardHeader>
                <div className={`w-12 h-12 rounded-lg bg-background flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className={`h-6 w-6 ${feature.color}`} />
                </div>
                <CardTitle className="text-xl group-hover:text-primary transition-colors">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;