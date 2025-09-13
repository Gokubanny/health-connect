import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, 
  Search, 
  Phone, 
  Star, 
  Clock, 
  Activity,
  Shield,
  Navigation,
  Heart,
  Globe,
  ExternalLink
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Hospital {
  id: string;
  name: string;
  address: string;
  city?: string;
  state?: string;
  country?: string;
  phone?: string;
  latitude: number;
  longitude: number;
  rating?: number;
  website?: string;
  opening_hours?: string;
  distance?: number;
  place_type?: string;
  place_id?: string;
}

const HospitalFinder = () => {
  const [location, setLocation] = useState("");
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [searchRadius, setSearchRadius] = useState(5000); // Default 5km radius in meters
  const { toast } = useToast();

  // Get user's current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          setUserLocation({ lat, lng });
          await findNearbyHospitals(lat, lng);
        },
        (error) => {
          setLoading(false);
          toast({
            title: "Location Error",
            description: "Unable to get your location. Please enter your location manually.",
            variant: "destructive"
          });
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 300000 // 5 minutes
        }
      );
    } else {
      toast({
        title: "Location Not Supported",
        description: "Geolocation is not supported by this browser.",
        variant: "destructive"
      });
    }
  };

  // Calculate distance between two points using Haversine formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of Earth in kilometers
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return Math.round(distance * 10) / 10; // Round to 1 decimal place
  };

  // Search for hospitals using Overpass API (OpenStreetMap)
  const searchHospitalsOverpass = async (lat: number, lng: number, radius: number) => {
    try {
      const query = `
        [out:json][timeout:25];
        (
          node["amenity"="hospital"](around:${radius},${lat},${lng});
          way["amenity"="hospital"](around:${radius},${lat},${lng});
          node["amenity"="clinic"](around:${radius},${lat},${lng});
          way["amenity"="clinic"](around:${radius},${lat},${lng});
          node["healthcare"="hospital"](around:${radius},${lat},${lng});
          way["healthcare"="hospital"](around:${radius},${lat},${lng});
        );
        out center meta;
      `;

      const response = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        body: query,
        headers: {
          'Content-Type': 'text/plain',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch from OpenStreetMap');
      }

      const data = await response.json();
      
      const hospitals: Hospital[] = data.elements.map((element: any, index: number) => {
        const elementLat = element.lat || element.center?.lat;
        const elementLng = element.lon || element.center?.lon;
        
        if (!elementLat || !elementLng) return null;

        const distance = calculateDistance(lat, lng, elementLat, elementLng);
        
        return {
          id: `osm-${element.id}`,
          name: element.tags?.name || element.tags?.['name:en'] || 'Unnamed Hospital',
          address: [
            element.tags?.['addr:housenumber'],
            element.tags?.['addr:street'],
            element.tags?.['addr:city'] || element.tags?.['addr:suburb'],
            element.tags?.['addr:state'] || element.tags?.['addr:province'],
            element.tags?.['addr:country']
          ].filter(Boolean).join(', ') || 'Address not available',
          city: element.tags?.['addr:city'] || element.tags?.['addr:suburb'],
          state: element.tags?.['addr:state'] || element.tags?.['addr:province'],
          country: element.tags?.['addr:country'],
          phone: element.tags?.phone || element.tags?.['contact:phone'],
          latitude: elementLat,
          longitude: elementLng,
          website: element.tags?.website || element.tags?.['contact:website'],
          opening_hours: element.tags?.opening_hours,
          distance,
          place_type: element.tags?.amenity || element.tags?.healthcare || 'hospital',
          place_id: element.id.toString()
        };
      }).filter(Boolean);

      return hospitals.sort((a, b) => (a.distance || 0) - (b.distance || 0));
    } catch (error) {
      console.error('Overpass API error:', error);
      throw error;
    }
  };

  // Backup search using Nominatim for hospital search
  const searchHospitalsNominatim = async (lat: number, lng: number, radius: number) => {
    try {
      const radiusKm = radius / 1000;
      const searchQueries = [
        `hospital near ${lat},${lng}`,
        `clinic near ${lat},${lng}`,
        `medical center near ${lat},${lng}`
      ];

      let allHospitals: Hospital[] = [];

      for (const query of searchQueries) {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=10&addressdetails=1&extratags=1`
        );

        if (response.ok) {
          const data = await response.json();
          
          const hospitals = data
            .filter((place: any) => {
              const distance = calculateDistance(lat, lng, parseFloat(place.lat), parseFloat(place.lon));
              return distance <= radiusKm && 
                     (place.type === 'hospital' || 
                      place.type === 'clinic' || 
                      place.display_name.toLowerCase().includes('hospital') ||
                      place.display_name.toLowerCase().includes('clinic') ||
                      place.display_name.toLowerCase().includes('medical'));
            })
            .map((place: any, index: number) => ({
              id: `nominatim-${place.place_id}`,
              name: place.name || place.display_name.split(',')[0],
              address: place.display_name,
              city: place.address?.city || place.address?.town || place.address?.village,
              state: place.address?.state,
              country: place.address?.country,
              latitude: parseFloat(place.lat),
              longitude: parseFloat(place.lon),
              distance: calculateDistance(lat, lng, parseFloat(place.lat), parseFloat(place.lon)),
              place_type: place.type || 'hospital',
              place_id: place.place_id
            }));

          allHospitals = [...allHospitals, ...hospitals];
        }
      }

      // Remove duplicates and sort by distance
      const uniqueHospitals = allHospitals.filter((hospital, index, self) => 
        index === self.findIndex(h => h.name === hospital.name && Math.abs(h.latitude - hospital.latitude) < 0.001)
      );

      return uniqueHospitals.sort((a, b) => (a.distance || 0) - (b.distance || 0));
    } catch (error) {
      console.error('Nominatim search error:', error);
      throw error;
    }
  };

  // Find nearby hospitals using real-time internet search
  const findNearbyHospitals = async (lat: number, lng: number, radius = searchRadius) => {
    setLoading(true);
    try {
      let hospitals: Hospital[] = [];

      // Try Overpass API first (more comprehensive)
      try {
        hospitals = await searchHospitalsOverpass(lat, lng, radius);
        
        if (hospitals.length === 0) {
          // Fallback to Nominatim if Overpass returns no results
          hospitals = await searchHospitalsNominatim(lat, lng, radius);
        }
      } catch (overpassError) {
        console.warn('Overpass API failed, trying Nominatim:', overpassError);
        // Fallback to Nominatim
        hospitals = await searchHospitalsNominatim(lat, lng, radius);
      }

      setHospitals(hospitals);
      
      toast({
        title: "Real-time Search Complete",
        description: `Found ${hospitals.length} hospitals within ${radius/1000}km of your location from live data.`,
      });
      
    } catch (error: any) {
      console.error('Hospital search error:', error);
      toast({
        title: "Search Error",
        description: "Unable to fetch real-time hospital data. Please try again or check your internet connection.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Geocode location string to coordinates
  const geocodeLocation = async (locationStr: string) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationStr)}&limit=1`
      );
      
      if (!response.ok) throw new Error('Geocoding failed');
      
      const data = await response.json();
      
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        return { lat: parseFloat(lat), lng: parseFloat(lon) };
      } else {
        throw new Error('Location not found');
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      throw new Error('Unable to find the specified location');
    }
  };

  // Search hospitals by location name
  const searchHospitals = async () => {
    if (!location.trim()) {
      toast({
        title: "Location Required",
        description: "Please enter a location to search for hospitals.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const coords = await geocodeLocation(location);
      setUserLocation(coords);
      await findNearbyHospitals(coords.lat, coords.lng);
    } catch (error: any) {
      toast({
        title: "Search Error",
        description: error.message || "Failed to search hospitals",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Format hospital address
  const formatAddress = (hospital: Hospital) => {
    if (hospital.address && hospital.address !== 'Address not available') {
      return hospital.address;
    }
    
    const parts = [];
    if (hospital.city) parts.push(hospital.city);
    if (hospital.state) parts.push(hospital.state);
    if (hospital.country) parts.push(hospital.country);
    
    return parts.length > 0 ? parts.join(', ') : 'Address not available';
  };

  // Get place type badge color
  const getPlaceTypeBadge = (type?: string) => {
    switch (type?.toLowerCase()) {
      case 'hospital':
        return 'bg-blue-100 text-blue-800';
      case 'clinic':
        return 'bg-green-100 text-green-800';
      case 'medical':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <section id="hospitals" className="py-20 px-4 bg-muted/30">
      <div className="container mx-auto">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-secondary/10 text-secondary">
              <Globe className="mr-2 h-4 w-4" />
              Real-Time Hospital Finder
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Find Healthcare Near You</h2>
            <p className="text-xl text-muted-foreground">
              Search for hospitals and clinics anywhere in the world using real-time data from the internet.
            </p>
          </div>
          
          <Card className="shadow-card border-0 bg-gradient-card mb-8">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Enter city, address, or location worldwide"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="pl-10 h-12 text-lg border-2 focus:border-primary"
                    onKeyPress={(e) => e.key === 'Enter' && searchHospitals()}
                  />
                </div>
                <div className="flex gap-2">
                  <select 
                    value={searchRadius} 
                    onChange={(e) => setSearchRadius(Number(e.target.value))}
                    className="px-3 py-2 rounded-lg border-2 bg-background"
                  >
                    <option value={1000}>1km</option>
                    <option value={2000}>2km</option>
                    <option value={5000}>5km</option>
                    <option value={10000}>10km</option>
                    <option value={25000}>25km</option>
                  </select>
                  <Button 
                    size="lg" 
                    onClick={searchHospitals}
                    disabled={loading}
                    className="bg-gradient-primary text-primary-foreground shadow-soft px-8"
                  >
                    <Search className="mr-2 h-5 w-5" />
                    Search Live Data
                  </Button>
                </div>
              </div>
              
              <div className="flex justify-center mb-6">
                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={getCurrentLocation}
                  disabled={loading}
                  className="px-8"
                >
                  <Navigation className="mr-2 h-5 w-5" />
                  Use My Current Location
                </Button>
              </div>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="flex items-center gap-3">
                  <Clock className="h-6 w-6 text-secondary" />
                  <div>
                    <div className="font-semibold">Real-time Data</div>
                    <div className="text-sm text-muted-foreground">Live search from OpenStreetMap</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Activity className="h-6 w-6 text-secondary" />
                  <div>
                    <div className="font-semibold">Global Coverage</div>
                    <div className="text-sm text-muted-foreground">Hospitals worldwide</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Shield className="h-6 w-6 text-secondary" />
                  <div>
                    <div className="font-semibold">Verified Sources</div>
                    <div className="text-sm text-muted-foreground">Data from trusted maps</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Hospital Results */}
          {hospitals.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-2xl font-bold mb-6">
                {userLocation ? "Nearby Hospitals (Live Results)" : "Hospital Results"} 
                <span className="text-muted-foreground ml-2">({hospitals.length} found)</span>
              </h3>
              
              <div className="grid gap-6">
                {hospitals.map((hospital) => (
                  <Card key={hospital.id} className="shadow-card border-0 bg-gradient-card hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-start gap-4 mb-4">
                            <div className="bg-gradient-primary w-12 h-12 rounded-xl flex items-center justify-center shadow-soft">
                              <Heart className="h-6 w-6 text-white" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="text-xl font-bold text-primary">{hospital.name}</h4>
                                <Badge className="bg-green-100 text-green-800">
                                  <Globe className="mr-1 h-3 w-3" />
                                  Live Data
                                </Badge>
                              </div>
                              <p className="text-muted-foreground mb-2">
                                {formatAddress(hospital)}
                              </p>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                                {hospital.phone && (
                                  <div className="flex items-center gap-1">
                                    <Phone className="h-4 w-4" />
                                    {hospital.phone}
                                  </div>
                                )}
                                {hospital.distance && (
                                  <div className="flex items-center gap-1">
                                    <MapPin className="h-4 w-4" />
                                    {hospital.distance}km away
                                  </div>
                                )}
                                {hospital.opening_hours && (
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    {hospital.opening_hours}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap gap-2 mb-4">
                            <Badge className={getPlaceTypeBadge(hospital.place_type)}>
                              {hospital.place_type?.charAt(0).toUpperCase() + hospital.place_type?.slice(1) || 'Hospital'}
                            </Badge>
                            <Badge variant="outline">Real-time Source</Badge>
                          </div>
                        </div>
                        
                        <div className="flex flex-col gap-2">
                          <Button 
                            className="bg-gradient-primary text-primary-foreground shadow-soft"
                            onClick={() => window.open(`https://maps.google.com?q=${hospital.latitude},${hospital.longitude}`, '_blank')}
                          >
                            <Navigation className="mr-2 h-4 w-4" />
                            Get Directions
                          </Button>
                          {hospital.website && (
                            <Button 
                              variant="outline"
                              onClick={() => window.open(hospital.website, '_blank')}
                            >
                              <ExternalLink className="mr-2 h-4 w-4" />
                              Visit Website
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
          
          {loading && (
            <div className="text-center py-8">
              <div className="inline-flex items-center gap-2 text-muted-foreground">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                {userLocation ? `Searching real-time data within ${searchRadius/1000}km...` : 'Searching live hospital data...'}
              </div>
            </div>
          )}
          
          {!loading && hospitals.length === 0 && userLocation && (
            <div className="text-center py-8">
              <div className="text-muted-foreground">
                No hospitals found within {searchRadius/1000}km of your location. Try increasing the search radius.
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default HospitalFinder;