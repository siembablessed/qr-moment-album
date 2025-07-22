import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Settings, Trash2, Download, Camera, Users, Calendar, MapPin, RotateCcw } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
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
  qr_code_data: string;
  created_at: string;
}

interface EventPhoto {
  id: string;
  file_name: string;
  file_path: string;
  uploaded_at: string;
  file_size: number;
  is_approved: boolean;
}

const EventManage = () => {
  const { id } = useParams();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [event, setEvent] = useState<Event | null>(null);
  const [photos, setPhotos] = useState<EventPhoto[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    event_date: "",
    location: "",
    max_photos: 100,
    is_active: true,
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
      return;
    }

    if (user && id) {
      loadEventData();
      loadPhotos();
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
      setFormData({
        title: data.title,
        description: data.description || "",
        event_date: data.event_date.slice(0, 16), // Format for datetime-local input
        location: data.location || "",
        max_photos: data.max_photos,
        is_active: data.is_active,
      });
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

  const loadPhotos = async () => {
    try {
      const { data, error } = await supabase
        .from("event_photos")
        .select("*")
        .eq("event_id", id)
        .order("uploaded_at", { ascending: false });

      if (error) throw error;
      setPhotos(data || []);
    } catch (error: any) {
      console.error("Error loading photos:", error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "max_photos" ? parseInt(value) || 0 : value
    }));
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !event) return;

    setUpdating(true);
    try {
      const { error } = await supabase
        .from("events")
        .update({
          title: formData.title,
          description: formData.description,
          event_date: formData.event_date,
          location: formData.location,
          max_photos: formData.max_photos,
          is_active: formData.is_active,
        })
        .eq("id", id)
        .eq("organizer_id", user.id);

      if (error) throw error;

      toast({
        title: "Event updated successfully!",
        description: "Your changes have been saved.",
      });

      loadEventData();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error updating event",
        description: error.message,
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleDeletePhoto = async (photoId: string, filePath: string) => {
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from("event-photos")
        .remove([filePath]);

      if (storageError) console.warn("Storage deletion failed:", storageError);

      // Delete from database
      const { error: dbError } = await supabase
        .from("event_photos")
        .delete()
        .eq("id", photoId)
        .eq("event_id", id);

      if (dbError) throw dbError;

      toast({
        title: "Photo deleted",
        description: "The photo has been removed from your event.",
      });

      loadPhotos();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error deleting photo",
        description: error.message,
      });
    }
  };

  const getImageUrl = (filePath: string) => {
    const { data } = supabase.storage
      .from("event-photos")
      .getPublicUrl(filePath);
    return data.publicUrl;
  };

  const downloadAllPhotos = async () => {
    if (photos.length === 0) {
      toast({
        variant: "destructive",
        title: "No photos to download",
        description: "There are no photos uploaded to this event yet.",
      });
      return;
    }

    toast({
      title: "Download started",
      description: "Your photos are being prepared for download.",
    });

    // Simple approach: open each photo in a new tab for manual download
    photos.forEach((photo, index) => {
      setTimeout(() => {
        window.open(getImageUrl(photo.file_path), '_blank');
      }, index * 500); // Stagger the downloads
    });
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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading || loadingData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Settings className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
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
            <Button variant="ghost" size="sm" onClick={() => navigate(`/event/${id}`)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Event
            </Button>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold">Manage Event</h1>
                <Badge variant={event.is_active ? "default" : "secondary"}>
                  {event.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
              <p className="text-muted-foreground">
                Configure your event settings and manage uploaded photos
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-4 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
          {/* Event Stats */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
              <Card>
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center gap-2 md:gap-3">
                    <Camera className="h-6 w-6 md:h-8 md:w-8 text-primary" />
                    <div>
                      <p className="text-xl md:text-2xl font-bold">{photos.length}</p>
                      <p className="text-xs md:text-sm text-muted-foreground">Total Photos</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center gap-2 md:gap-3">
                    <Users className="h-6 w-6 md:h-8 md:w-8 text-primary" />
                    <div>
                      <p className="text-xl md:text-2xl font-bold">{photos.filter(p => p.is_approved).length}</p>
                      <p className="text-xs md:text-sm text-muted-foreground">Approved</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center gap-2 md:gap-3">
                    <Calendar className="h-6 w-6 md:h-8 md:w-8 text-primary" />
                    <div>
                      <p className="text-xl md:text-2xl font-bold">{event.max_photos}</p>
                      <p className="text-xs md:text-sm text-muted-foreground">Max Allowed</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center gap-2 md:gap-3">
                    <MapPin className="h-6 w-6 md:h-8 md:w-8 text-primary" />
                    <div>
                      <p className="text-xl md:text-2xl font-bold">
                        {photos.reduce((sum, photo) => sum + photo.file_size, 0) > 0 
                          ? formatFileSize(photos.reduce((sum, photo) => sum + photo.file_size, 0))
                          : "0 MB"
                        }
                      </p>
                      <p className="text-xs md:text-sm text-muted-foreground">Total Size</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Event Settings */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Event Settings
                </CardTitle>
                <CardDescription>
                  Update your event information and settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdate} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Event Title</Label>
                    <Input
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="event_date">Event Date & Time</Label>
                      <Input
                        id="event_date"
                        name="event_date"
                        type="datetime-local"
                        value={formData.event_date}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="max_photos">Maximum Photos</Label>
                    <Input
                      id="max_photos"
                      name="max_photos"
                      type="number"
                      min="1"
                      max="1000"
                      value={formData.max_photos}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div className="space-y-0.5">
                      <Label htmlFor="is_active">Event Status</Label>
                      <p className="text-sm text-muted-foreground">
                        {formData.is_active ? "Guests can upload photos" : "Upload disabled"}
                      </p>
                    </div>
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => 
                        setFormData(prev => ({ ...prev, is_active: checked }))
                      }
                    />
                  </div>

                  <Button type="submit" disabled={updating} className="w-full">
                    {updating ? "Updating..." : "Save Changes"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Photos Management */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Camera className="h-5 w-5" />
                    Photo Actions
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={downloadAllPhotos} className="w-full" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download All Photos
                </Button>
                
                <Button onClick={loadPhotos} className="w-full" variant="outline">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Refresh Photos
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Photos Grid */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>Uploaded Photos ({photos.length})</CardTitle>
                <CardDescription>
                  All photos uploaded by guests to your event
                </CardDescription>
              </CardHeader>
              <CardContent>
                {photos.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {photos.map((photo) => (
                      <div key={photo.id} className="relative group">
                        <div className="aspect-square overflow-hidden rounded-lg bg-muted border">
                          <img
                            src={getImageUrl(photo.file_path)}
                            alt={photo.file_name}
                            className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                            loading="lazy"
                            onError={(e) => {
                              console.error('Image failed to load:', photo.file_path);
                              e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjZjNmNGY2Ii8+CjxwYXRoIGQ9Ik0xMiA5VjEzTTEyIDE3SDE0TTE4IDEyQzE4IDE2LjQxODMgMTQuNDE4MyAyMCAxMCAyMEM1LjU4MTcyIDIwIDIgMTYuNDE4MyAyIDEyQzIgNy41ODE3MiA1LjU4MTcyIDQgMTAgNEMxNC40MTgzIDQgMTggNy41ODE3MiAxOCAxMloiIHN0cm9rZT0iIzk0YTNiOCIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPHN2Zz4K';
                            }}
                          />
                        </div>
                        
                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-200 rounded-lg flex flex-col items-center justify-center gap-2">
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeletePhoto(photo.id, photo.file_path)}
                            className="shadow-lg"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => window.open(getImageUrl(photo.file_path), '_blank')}
                            className="shadow-lg"
                          >
                            <Download className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </div>

                        {/* Photo Info */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 rounded-b-lg">
                          <div className="text-white text-xs space-y-1">
                            <p className="truncate font-medium">{photo.file_name}</p>
                            <div className="flex justify-between items-center">
                              <span>{formatFileSize(photo.file_size)}</span>
                              <Badge 
                                variant={photo.is_approved ? "default" : "secondary"} 
                                className="text-xs px-1 py-0"
                              >
                                {photo.is_approved ? "✓" : "Pending"}
                              </Badge>
                            </div>
                            <p className="text-xs opacity-75">
                              {formatDate(photo.uploaded_at)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No photos uploaded yet</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Share your QR code with guests to start collecting photos
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventManage;