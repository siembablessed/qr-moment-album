import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, QrCode, Copy, Calendar, MapPin, Users, Camera, Download, Share2, Printer } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import QRCodeLib from "qrcode";

interface Event {
  id: string;
  title: string;
  description?: string;
  event_date: string;
  location?: string;
  is_active: boolean;
  max_photos: number;
  qr_code_data: string;
  created_at: string;
}

const EventView = () => {
  const { id } = useParams();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [event, setEvent] = useState<Event | null>(null);
  const [qrCodeImage, setQrCodeImage] = useState<string>("");
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
      return;
    }

    if (user && id) {
      loadEventData();
    }
  }, [user, loading, id, navigate]);

  const loadEventData = async () => {
    try {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("id", id)
        .eq("organizer_id", user!.id)
        .single();

      if (error) throw error;
      setEvent(data);

      // Generate QR code image
      if (data.qr_code_data) {
        const qrImage = await QRCodeLib.toDataURL(data.qr_code_data, {
          width: 300,
          margin: 2,
          color: {
            dark: "#000000",
            light: "#ffffff",
          },
        });
        setQrCodeImage(qrImage);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error loading event",
        description: error.message,
      });
      navigate("/dashboard");
    } finally {
      setLoadingData(false);
    }
  };

  const copyQrLink = () => {
    if (event?.qr_code_data) {
      navigator.clipboard.writeText(event.qr_code_data);
      toast({
        title: "Link copied!",
        description: "The event link has been copied to your clipboard.",
      });
    }
  };

  const downloadQrCode = () => {
    if (qrCodeImage) {
      const link = document.createElement("a");
      link.download = `${event?.title || "event"}-qr-code.png`;
      link.href = qrCodeImage;
      link.click();
    }
  };

  const openPrintableQR = () => {
    if (!qrCodeImage || !event) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print QR Code - ${event.title}</title>
          <style>
            body {
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
              margin: 0;
              padding: 40px;
              background: white;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              box-sizing: border-box;
            }
            .print-container {
              text-align: center;
              max-width: 600px;
              width: 100%;
            }
            .event-title {
              font-size: 32px;
              font-weight: 700;
              color: #1a1a1a;
              margin-bottom: 8px;
              line-height: 1.2;
            }
            .event-subtitle {
              font-size: 18px;
              color: #666;
              margin-bottom: 40px;
              font-weight: 500;
            }
            .qr-container {
              background: white;
              border: 3px solid #e5e7eb;
              border-radius: 16px;
              padding: 32px;
              margin: 0 auto 32px;
              display: inline-block;
              box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
            }
            .qr-image {
              width: 280px;
              height: 280px;
              display: block;
            }
            .event-details {
              background: #f8fafc;
              border-radius: 12px;
              padding: 24px;
              margin-top: 32px;
              text-align: left;
            }
            .detail-row {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 8px 0;
              border-bottom: 1px solid #e2e8f0;
            }
            .detail-row:last-child {
              border-bottom: none;
            }
            .detail-label {
              font-weight: 600;
              color: #374151;
            }
            .detail-value {
              color: #6b7280;
            }
            .instructions {
              background: #f0f9ff;
              border: 2px dashed #38bdf8;
              border-radius: 12px;
              padding: 24px;
              margin-top: 32px;
              text-align: center;
            }
            .instructions-title {
              font-size: 20px;
              font-weight: 600;
              color: #0284c7;
              margin-bottom: 12px;
            }
            .instructions-text {
              color: #0369a1;
              font-size: 16px;
              line-height: 1.5;
            }
            @media print {
              body { padding: 20px; }
              .qr-container { box-shadow: none; }
            }
          </style>
        </head>
        <body>
          <div class="print-container">
            <h1 class="event-title">${event.title}</h1>
            <p class="event-subtitle">Scan to Upload Photos</p>
            
            <div class="qr-container">
              <img src="${qrCodeImage}" alt="Event QR Code" class="qr-image" />
            </div>

            <div class="event-details">
              <div class="detail-row">
                <span class="detail-label">Date & Time:</span>
                <span class="detail-value">${formatDate(event.event_date)}</span>
              </div>
              ${event.location ? `
                <div class="detail-row">
                  <span class="detail-label">Location:</span>
                  <span class="detail-value">${event.location}</span>
                </div>
              ` : ''}
              <div class="detail-row">
                <span class="detail-label">Photo Limit:</span>
                <span class="detail-value">${event.max_photos} photos max</span>
              </div>
            </div>

            <div class="instructions">
              <h3 class="instructions-title">How to Use</h3>
              <p class="instructions-text">
                1. Open your camera app or QR scanner<br>
                2. Point at the QR code above<br>
                3. Tap the link that appears<br>
                4. Upload your photos to share with everyone!
              </p>
            </div>
          </div>
          
          <script>
            window.onload = function() {
              setTimeout(() => window.print(), 500);
            };
          </script>
        </body>
      </html>
    `);
    
    printWindow.document.close();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading || loadingData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <QrCode className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading event...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Event not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold">{event.title}</h1>
                <Badge variant={event.is_active ? "default" : "secondary"}>
                  {event.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
              <p className="text-muted-foreground">
                Event QR Code and Details
              </p>
            </div>
            <Button onClick={() => navigate(`/event/${id}/manage`)} variant="outline">
              Manage Event
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* QR Code Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                Event QR Code
              </CardTitle>
              <CardDescription>
                Share this QR code with your guests to let them upload photos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {qrCodeImage && (
                <div className="flex justify-center">
                  <div className="p-4 bg-white rounded-lg border">
                    <img 
                      src={qrCodeImage} 
                      alt="Event QR Code" 
                      className="w-64 h-64"
                    />
                  </div>
                </div>
              )}
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="text-sm font-mono truncate mr-2">
                    {event.qr_code_data}
                  </span>
                  <Button size="sm" variant="outline" onClick={copyQrLink}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <Button onClick={downloadQrCode}>
                    <Download className="h-4 w-4 mr-2" />
                    Download QR
                  </Button>
                  <Button variant="outline" onClick={copyQrLink}>
                    <Share2 className="h-4 w-4 mr-2" />
                    Share Link
                  </Button>
                  <Button variant="outline" onClick={openPrintableQR} className="col-span-2">
                    <Printer className="h-4 w-4 mr-2" />
                    Print QR Code
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Event Details */}
          <Card>
            <CardHeader>
              <CardTitle>Event Details</CardTitle>
              <CardDescription>
                Information about your event
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Date & Time</p>
                    <p className="text-muted-foreground">{formatDate(event.event_date)}</p>
                  </div>
                </div>

                {event.location && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Location</p>
                      <p className="text-muted-foreground">{event.location}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <Camera className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Photo Limit</p>
                    <p className="text-muted-foreground">Maximum {event.max_photos} photos</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Status</p>
                    <p className="text-muted-foreground">
                      {event.is_active ? "Accepting uploads" : "Upload disabled"}
                    </p>
                  </div>
                </div>

                {event.description && (
                  <div className="pt-4 border-t">
                    <p className="font-medium mb-2">Description</p>
                    <p className="text-muted-foreground">{event.description}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Instructions Card */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>How to Share with Guests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Share2 className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Share the QR Code</h3>
                <p className="text-sm text-muted-foreground">
                  Download and share the QR code or send the link directly
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Camera className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Guests Scan & Upload</h3>
                <p className="text-sm text-muted-foreground">
                  Guests scan the code and upload photos directly from their phones
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Download className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Download All Photos</h3>
                <p className="text-sm text-muted-foreground">
                  Access and download all uploaded photos from the manage section
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EventView;