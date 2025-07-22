import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus, QrCode, Camera, Download } from "lucide-react";

const HowItWorks = () => {
  const steps = [
    {
      step: "01",
      icon: UserPlus,
      title: "Create Account",
      description: "Sign up for free and create your event planner profile in seconds.",
      color: "bg-primary"
    },
    {
      step: "02", 
      icon: QrCode,
      title: "Generate QR Code",
      description: "Create your event and get a unique QR code that guests can scan.",
      color: "bg-accent"
    },
    {
      step: "03",
      icon: Camera,
      title: "Guests Share Photos",
      description: "Guests scan the code and instantly upload photos and videos to your shared album.",
      color: "bg-success"
    },
    {
      step: "04",
      icon: Download,
      title: "Download Memories",
      description: "Download all photos and videos, or manage your album however you like.",
      color: "bg-warning"
    }
  ];

  return (
    <section id="how-it-works" className="py-16 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get started in minutes. Create memorable events with seamless photo sharing.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {steps.map((step, index) => (
            <Card 
              key={index}
              className="relative text-center group hover:shadow-lg transition-all duration-300 animate-slide-up"
              style={{animationDelay: `${index * 0.2}s`}}
            >
              <CardContent className="p-6">
                <div className="relative mb-6">
                  <div className={`w-16 h-16 ${step.color} rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <step.icon className="h-8 w-8 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-background border-2 border-border rounded-full flex items-center justify-center text-xs font-bold text-primary">
                    {step.step}
                  </div>
                </div>
                
                <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors">
                  {step.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </CardContent>
              
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-0.5 bg-border"></div>
              )}
            </Card>
          ))}
        </div>
        
        <div className="text-center animate-bounce-in" style={{animationDelay: '1s'}}>
          <Button variant="hero" size="xl">
            Start Your First Event
          </Button>
          <p className="text-sm text-muted-foreground mt-3">
            No credit card required • Free forever plan available
          </p>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;