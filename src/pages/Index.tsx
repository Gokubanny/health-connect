import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Calendar,
  Phone,
  Shield,
  Heart,
  Users,
  Clock,
  Star,
  Video,
  MessageCircle,
  Stethoscope,
  Activity,
  UserCheck,
  LogOut,
  Settings
} from "lucide-react";
import heroImage from "@/assets/healthcare-hero.jpg";
import { useAuth } from "@/contexts/AuthContext";
import HospitalFinder from "@/components/HospitalFinder";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const { user, role, signOut } = useAuth();
  const { toast } = useToast();

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Signed out",
        description: "You have been successfully signed out."
      });
    }
  };

  const services = [
    {
      icon: Video,
      title: "Virtual Consultations",
      description: "Connect with healthcare professionals through secure video calls from anywhere.",
      color: "bg-gradient-primary"
    },
    {
      icon: MapPin,
      title: "Hospital Locator",
      description: "Find the nearest hospitals and healthcare facilities in your area instantly.",
      color: "bg-gradient-secondary"
    },
    {
      icon: Calendar,
      title: "Appointment Booking",
      description: "Schedule appointments with doctors and specialists at your convenience.",
      color: "bg-gradient-primary"
    },
    {
      icon: MessageCircle,
      title: "Health Counseling",
      description: "Get one-on-one health advisory and counseling from certified professionals.",
      color: "bg-gradient-secondary"
    }
  ];

  const stats = [
    { icon: Users, value: "50K+", label: "Patients Connected" },
    { icon: Stethoscope, value: "1,200+", label: "Healthcare Providers" },
    { icon: MapPin, value: "500+", label: "Partner Hospitals" },
    { icon: UserCheck, value: "98%", label: "Patient Satisfaction" }
  ];

  const testimonials = [
    {
      name: "Dr. Sarah Johnson",
      role: "Chief Medical Officer, City Hospital",
      content: "This platform has revolutionized how we connect with our patients. The interface is intuitive and our patient engagement has increased by 300%.",
      rating: 5
    },
    {
      name: "Maria Rodriguez",
      role: "Patient",
      content: "Finding the right doctor and booking appointments has never been easier. The virtual consultations are a game-changer for busy parents like me.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          {/* Left: Logo */}
          <div className="flex items-center gap-2">
            <Heart className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-primary">HealthConnect</span>
          </div>

          {/* Middle: Nav Links */}
          <nav className="hidden md:flex items-center gap-6">
            <a href="#services" className="text-foreground hover:text-primary transition-colors">Services</a>
            <a href="#hospitals" className="text-foreground hover:text-primary transition-colors">Find Hospitals</a>
            <a href="#about" className="text-foreground hover:text-primary transition-colors">About</a>
            {user && (
              <Link to="/my-consultations" className="text-foreground hover:text-primary transition-colors">
                My Consultations
              </Link>
            )}
            {user && role === "admin" && (
              <Link to="/admin" className="text-foreground hover:text-primary transition-colors font-semibold">
                Admin Panel
              </Link>
            )}
          </nav>

          {/* Right: Auth/User Section */}
          <div className="flex items-center gap-4">
            {user ? (
              <>
                {role === "admin" && (
                  <Badge className="bg-red-100 text-red-800">
                    <Shield className="mr-1 h-3 w-3" />
                    Admin
                  </Badge>
                )}
                <span className="text-muted-foreground">
                  Welcome, {user.user_metadata?.full_name || "User"}
                </span>
                <Button variant="outline" size="sm" onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link to="/auth">
                  <Button variant="outline" size="sm">Log In</Button>
                </Link>
                <Link to="/auth">
                  <Button size="sm" className="bg-gradient-primary text-primary-foreground shadow-soft">Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Admin Quick Access Banner */}
      {user && role === "admin" && (
        <div className="bg-gradient-primary text-primary-foreground py-2">
          <div className="container mx-auto px-4 flex justify-center items-center gap-4">
            <Settings className="h-4 w-4" />
            <span className="text-sm font-medium">Admin Dashboard Available</span>
            <Link to="/admin">
              <Button size="sm" variant="secondary">
                Go to Admin Panel
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-gradient-hero text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="container mx-auto relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-white/20 text-white border-white/30">
              🏥 Connecting Healthcare, Empowering Lives
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Your Health,
              <span className="text-secondary-light"> Connected</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-3xl mx-auto">
              Bridge the gap between hospitals and patients with our comprehensive healthcare platform.
              Find nearby hospitals, book consultations, and get personalized health advisory services.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <>
                  <Link to="/book-consultation">
                    <Button size="lg" className="bg-white text-primary hover:bg-white/90 shadow-hero text-lg px-8 py-6">
                      <Calendar className="mr-2 h-5 w-5" />
                      Book Consultation
                    </Button>
                  </Link>

                  <a href="#hospitals">
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-white text-white hover:bg-white/10 text-lg px-8 py-6"
                    >
                      <MapPin className="mr-2 h-5 w-5" />
                      Find Hospitals
                    </Button>
                  </a>
                </>
              ) : (
                <>
                  <Link to="/auth">
                    <Button size="lg" className="bg-white text-primary hover:bg-white/90 shadow-hero text-lg px-8 py-6">
                      <Calendar className="mr-2 h-5 w-5" />
                      Get Started
                    </Button>
                  </Link>
                  <a href="#hospitals">
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-white text-white hover:bg-white/10 text-lg px-8 py-6"
                    >
                      <MapPin className="mr-2 h-5 w-5" />
                      Find Hospitals
                    </Button>
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="bg-gradient-primary w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-soft">
                  <stat.icon className="h-8 w-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-primary mb-2">{stat.value}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-primary/10 text-primary">Our Services</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Comprehensive Healthcare Solutions</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              From virtual consultations to hospital finder services, we provide everything you need for better healthcare access.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <Card key={index} className="group hover:shadow-card transition-all duration-300 border-0 shadow-soft bg-gradient-card">
                <CardHeader className="text-center pb-4">
                  <div className={`w-16 h-16 rounded-2xl ${service.color} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <service.icon className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl">{service.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription className="text-base leading-relaxed mb-4">
                    {service.description}
                  </CardDescription>
                  {service.title === "Appointment Booking" && (
                    <Link to="/book-consultation">
                      <Button className="bg-gradient-primary text-primary-foreground shadow-soft">
                        Book Now
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Hospital Finder Section */}
      <section id="hospitals" className="py-20 px-4">
        <HospitalFinder />
      </section>

      {/* Call to Action Section */}
      <section className="py-20 px-4 bg-gradient-primary text-primary-foreground">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl mb-8 text-primary-foreground/90 max-w-2xl mx-auto">
            Join thousands of patients who trust HealthConnect for their healthcare needs. Book your consultation today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <>
                <Link to="/book-consultation">
                  <Button size="lg" className="bg-white text-primary hover:bg-white/90 shadow-hero text-lg px-8 py-6">
                    <Calendar className="mr-2 h-5 w-5" />
                    Book Consultation Now
                  </Button>
                </Link>
                <Link to="/my-consultations">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 text-lg px-8 py-6">
                    View My Bookings
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link to="/auth">
                  <Button size="lg" className="bg-white text-primary hover:bg-white/90 shadow-hero text-lg px-8 py-6">
                    <Calendar className="mr-2 h-5 w-5" />
                    Sign Up & Book
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 text-lg px-8 py-6">
                  Learn More
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-primary/10 text-primary">Testimonials</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Trusted by Healthcare Professionals</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="shadow-card border-0 bg-gradient-card">
                <CardContent className="p-8">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-lg mb-6 leading-relaxed text-foreground/80">
                    "{testimonial.content}"
                  </p>
                  <div>
                    <div className="font-semibold text-lg">{testimonial.name}</div>
                    <div className="text-muted-foreground">{testimonial.role}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Emergency Contact */}
      <section className="py-16 px-4 bg-destructive text-destructive-foreground">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Medical Emergency?</h2>
          <p className="text-xl mb-6 opacity-90">Get immediate help from emergency services</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="bg-white text-destructive hover:bg-white/90">
              <Phone className="mr-2 h-5 w-5" />
              Call Emergency: 911
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              Find Emergency Room
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <Heart className="h-8 w-8" />
                <span className="text-2xl font-bold">HealthConnect</span>
              </div>
              <p className="text-primary-foreground/80 text-lg mb-6 max-w-md">
                Bridging the gap between healthcare providers and patients through innovative technology and compassionate care.
              </p>
              <div className="flex gap-4">
                <Button variant="secondary" size="sm">Privacy Policy</Button>
                <Button variant="secondary" size="sm">Terms of Service</Button>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-4">Services</h3>
              <ul className="space-y-2 text-primary-foreground/80">
                <li>
                  <Link to="/book-consultation" className="hover:text-white transition-colors">
                    Virtual Consultations
                  </Link>
                </li>
                <li>Hospital Finder</li>
                <li>Health Counseling</li>
                <li>Emergency Services</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-4">Contact</h3>
              <ul className="space-y-2 text-primary-foreground/80">
                <li>support@healthconnect.com</li>
                <li>1-800-HEALTH</li>
                <li>24/7 Support Available</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-primary-foreground/20 mt-12 pt-8 text-center text-primary-foreground/60">
            <p>&copy; 2024 HealthConnect. All rights reserved. Connecting healthcare, empowering lives.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;