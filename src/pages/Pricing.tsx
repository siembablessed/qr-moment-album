import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Camera, Users, QrCode, Star, Crown, Zap } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const Pricing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const tiers = [
    {
      name: "Starter",
      price: "$9",
      period: "/event",
      description: "Perfect for small gatherings and intimate events",
      icon: Camera,
      popular: false,
      features: [
        "Up to 50 photos per event",
        "QR code generation",
        "Basic photo gallery",
        "Guest photo uploads",
        "Event duration: 24 hours",
        "Email support"
      ]
    },
    {
      name: "Professional",
      price: "$19",
      period: "/event",
      description: "Ideal for weddings, parties, and corporate events",
      icon: Star,
      popular: true,
      features: [
        "Up to 200 photos per event",
        "Stylized QR codes with branding",
        "Advanced photo gallery",
        "Guest photo uploads & moderation",
        "Event duration: 7 days",
        "Download all photos",
        "Custom event pages",
        "Priority support"
      ]
    },
    {
      name: "Enterprise",
      price: "$49",
      period: "/event",
      description: "For large events and professional photographers",
      icon: Crown,
      popular: false,
      features: [
        "Unlimited photos per event",
        "Custom branded QR codes",
        "Premium photo gallery with filters",
        "Advanced moderation tools",
        "Event duration: 30 days",
        "Bulk photo download",
        "Custom domains",
        "Analytics dashboard",
        "White-label solution",
        "24/7 priority support"
      ]
    }
  ];

  const handleGetStarted = (tier: string) => {
    if (user) {
      navigate("/create-event");
    } else {
      navigate("/auth");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Choose Your{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Perfect Plan
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Select the right tier for your event size and needs. All plans include our core photo sharing features.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {tiers.map((tier) => {
              const Icon = tier.icon;
              return (
                <Card 
                  key={tier.name} 
                  className={`relative ${
                    tier.popular 
                      ? "border-primary shadow-glow scale-105" 
                      : "border-border"
                  }`}
                >
                  {tier.popular && (
                    <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-primary text-primary-foreground">
                      Most Popular
                    </Badge>
                  )}
                  
                  <CardHeader className="text-center pb-4">
                    <div className="flex justify-center mb-4">
                      <div className={`p-3 rounded-full ${
                        tier.popular 
                          ? "bg-gradient-primary text-primary-foreground" 
                          : "bg-muted text-muted-foreground"
                      }`}>
                        <Icon className="h-6 w-6" />
                      </div>
                    </div>
                    <CardTitle className="text-2xl">{tier.name}</CardTitle>
                    <CardDescription className="text-sm">{tier.description}</CardDescription>
                    <div className="mt-4">
                      <span className="text-4xl font-bold">{tier.price}</span>
                      <span className="text-muted-foreground">{tier.period}</span>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    {tier.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <Check className="h-4 w-4 text-primary flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </CardContent>
                  
                  <CardFooter>
                    <Button 
                      className="w-full"
                      variant={tier.popular ? "default" : "outline"}
                      onClick={() => handleGetStarted(tier.name)}
                    >
                      {user ? "Create Event" : "Get Started"}
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>

          {/* FAQ Section */}
          <div className="mt-20 text-center">
            <h2 className="text-2xl font-bold mb-8">Frequently Asked Questions</h2>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto text-left">
              <div>
                <h3 className="font-semibold mb-2">How does pricing work?</h3>
                <p className="text-muted-foreground text-sm">
                  You pay per event based on your chosen tier. Each event includes all features for the selected plan duration.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Can I upgrade during an event?</h3>
                <p className="text-muted-foreground text-sm">
                  Yes, you can upgrade your event to a higher tier at any time to unlock additional features and photo limits.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">What happens to photos after the event?</h3>
                <p className="text-muted-foreground text-sm">
                  Photos remain accessible for download for 30 days after your event ends, regardless of the tier.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Do you offer refunds?</h3>
                <p className="text-muted-foreground text-sm">
                  We offer full refunds if you cancel within 24 hours of creating your event and before any photos are uploaded.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Pricing;