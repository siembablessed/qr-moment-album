import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Camera, Upload, Image as ImageIcon, Calendar, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Event {
  id: string;
  title: string;
  description?: string;
  event_date: string;
  location?: string;
  is_active: boolean;
  max_photos: number;
}

interface EventPhoto {
  id: string;
  file_name: string;
  file_path: string;
  uploaded_at: string;
}

const EventGuest = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const [event, setEvent] = useState<Event | null>(null);
  const [photos, setPhotos] = useState<EventPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (id) {
      loadEventData();
      loadPhotos();
    }
  }, [id]);

  const loadEventData = async () => {
    try {
      const { data, error } = await supabase
        .from("events")
        .select("id, title, description, event_date, location, is_active, max_photos")
        .eq("id", id)
        .single();

      if (error) throw error;
      setEvent(data);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Event not found",
        description: "This event may not exist or may be inactive.",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadPhotos = async () => {
    try {
      const { data, error } = await supabase
        .from("event_photos")
        .select("id, file_name, file_path, uploaded_at")
        .eq("event_id", id)
        .eq("is_approved", true)
        .order("uploaded_at", { ascending: false });

      if (error) throw error;
      setPhotos(data || []);
    } catch (error: any) {
      console.error("Error loading photos:", error);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || !files.length || !id) return;

    setUploading(true);
    
    try {
      for (const file of Array.from(files)) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${id}/${fileName}`;

        // Upload file to storage
        const { error: uploadError } = await supabase.storage
          .from("event-photos")
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Save record to database
        const { error: dbError } = await supabase
          .from("event_photos")
          .insert({
            event_id: id,
            file_name: file.name,
            file_path: filePath,
            file_size: file.size,
          });

        if (dbError) throw dbError;
      }

      toast({
        title: "Photos uploaded!",
        description: `Successfully uploaded ${files.length} photo(s).`,
      });

      // Reload photos after successful upload
      setTimeout(() => {
        loadPhotos();
      }, 1000);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: error.message,
      });
    } finally {
      setUploading(false);
    }
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

  const getImageUrl = (filePath: string) => {
    const { data } = supabase.storage
      .from("event-photos")
      .getPublicUrl(filePath);
    return data.publicUrl;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Camera className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading event...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Event not found or inactive</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
              <h1 className="text-2xl font-bold">{event.title}</h1>
              <Badge variant={event.is_active ? "default" : "secondary"}>
                {event.is_active ? "Active" : "Inactive"}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              Share your memories from this event
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Event Info */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Event Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <span>{formatDate(event.event_date)}</span>
            </div>
            {event.location && (
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <span>{event.location}</span>
              </div>
            )}
            {event.description && (
              <p className="text-muted-foreground mt-4">{event.description}</p>
            )}
          </CardContent>
        </Card>

        {/* Upload Section */}
        {event.is_active && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload Photos & Videos
              </CardTitle>
              <CardDescription>
                Share your photos and videos from this event
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium mb-2">Choose files to upload</p>
                <p className="text-muted-foreground mb-4">
                  Select photos or videos from your device
                </p>
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="hidden"
                  id="file-upload"
                />
                <Button 
                  asChild 
                  disabled={uploading}
                  className="cursor-pointer"
                >
                  <label htmlFor="file-upload">
                    {uploading ? "Uploading..." : "Choose Files"}
                  </label>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Photos Gallery */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Event Photos ({photos.length})
            </CardTitle>
            <CardDescription>
              Photos shared by event guests
            </CardDescription>
          </CardHeader>
          <CardContent>
            {photos.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {photos.map((photo) => (
                  <div key={photo.id} className="aspect-square overflow-hidden rounded-lg bg-muted">
                    <img
                      src={getImageUrl(photo.file_path)}
                      alt={photo.file_name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                      onClick={() => window.open(getImageUrl(photo.file_path), '_blank')}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No photos uploaded yet</p>
                {event.is_active && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Be the first to share a photo!
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EventGuest;