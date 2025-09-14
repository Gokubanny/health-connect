import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  Heart,
  ArrowLeft,
  Stethoscope,
  Users,
  MessageCircle,
  Phone,
  Mail,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

// ----------------- Types -----------------
interface Consultation {
  id: string;
  user_id?: string;
  patient_name: string;
  email: string;
  phone: string;
  consultation_type: string;
  preferred_date: string;
  preferred_time: string;
  symptoms?: string;
  medical_history?: string;
  emergency_contact?: string;
  payment_method: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  consultation_fee: number;
  consultation_duration: number;
  booking_reference: string;
  created_at: string;
}

// ----------------- Component -----------------
const MyConsultations = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);

  // ----------------- Helpers -----------------
  const consultationTypeDetails = {
    general: {
      name: "General Consultation",
      icon: Stethoscope,
      color: "bg-blue-500",
    },
    specialist: {
      name: "Specialist Consultation",
      icon: Users,
      color: "bg-purple-500",
    },
    "mental-health": {
      name: "Mental Health Counseling",
      icon: MessageCircle,
      color: "bg-green-500",
    },
    emergency: {
      name: "Emergency Consultation",
      icon: Heart,
      color: "bg-red-500",
    },
  };

  const statusDetails = {
    pending: {
      label: "Pending",
      icon: AlertCircle,
      color: "bg-yellow-100 text-yellow-800",
    },
    confirmed: {
      label: "Confirmed",
      icon: CheckCircle,
      color: "bg-green-100 text-green-800",
    },
    completed: {
      label: "Completed",
      icon: CheckCircle,
      color: "bg-blue-100 text-blue-800",
    },
    cancelled: {
      label: "Cancelled",
      icon: XCircle,
      color: "bg-red-100 text-red-800",
    },
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const getConsultationType = (type: string) =>
    consultationTypeDetails[type as keyof typeof consultationTypeDetails] || {
      name: type,
      icon: Stethoscope,
      color: "bg-gray-500",
    };

  const getStatusBadge = (status: string) => {
    const statusInfo = statusDetails[status as keyof typeof statusDetails];
    return (
      <Badge className={statusInfo.color}>
        <statusInfo.icon className="mr-1 h-3 w-3" />
        {statusInfo.label}
      </Badge>
    );
  };

  // ----------------- Fetch -----------------
  useEffect(() => {
    fetchConsultations();
  }, [user]);

  const fetchConsultations = async () => {
    try {
      setLoading(true);

      let query = supabase
        .from("consultations")
        .select("*")
        .order("created_at", { ascending: false });

      if (user) {
        query = query.eq("user_id", user.id);
      }

      const { data, error } = await query;

      if (error) throw error;
      setConsultations(data || []);
    } catch (error: any) {
      console.error("Error fetching consultations:", error);
      toast({
        title: "Error",
        description: "Failed to load your consultations. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // ----------------- Return (UI) -----------------
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">Sign In Required</h2>
            <p className="text-muted-foreground mb-6">
              Please sign in to view your consultation bookings.
            </p>
            <Link to="/auth">
              <Button className="w-full">Sign In</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* ----------------- Header ----------------- */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Heart className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold text-primary">
                HealthConnect
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/book-consultation">
              <Button size="sm" className="bg-gradient-primary text-primary-foreground">
                <Plus className="mr-2 h-4 w-4" />
                Book New
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* ----------------- Content ----------------- */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">My Consultations</h1>
            <p className="text-xl text-muted-foreground">
              Manage and track your healthcare appointments
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center gap-2 text-muted-foreground">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                Loading your consultations...
              </div>
            </div>
          ) : consultations.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  No Consultations Found
                </h3>
                <p className="text-muted-foreground mb-6">
                  You haven't booked any consultations yet. Start by booking
                  your first consultation.
                </p>
                <Link to="/book-consultation">
                  <Button className="bg-gradient-primary text-primary-foreground">
                    <Plus className="mr-2 h-4 w-4" />
                    Book Your First Consultation
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {consultations.map((consultation) => {
                const consultationType = getConsultationType(
                  consultation.consultation_type
                );
                const ConsultationIcon = consultationType.icon;

                return (
                  <Card
                    key={consultation.id}
                    className="shadow-card border-0 bg-gradient-card"
                  >
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                        {/* Left section */}
                        <div className="flex-1">
                          <div className="flex items-start gap-4 mb-4">
                            <div
                              className={`w-12 h-12 rounded-xl ${consultationType.color} flex items-center justify-center shadow-soft`}
                            >
                              <ConsultationIcon className="h-6 w-6 text-white" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-xl font-bold text-primary">
                                  {consultationType.name}
                                </h3>
                                {getStatusBadge(consultation.status)}
                              </div>
                              <p className="text-muted-foreground mb-2">
                                Booking Reference:{" "}
                                {consultation.booking_reference}
                              </p>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  {formatDate(consultation.preferred_date)}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  {consultation.preferred_time}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  {consultation.consultation_duration} minutes
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Details */}
                          <div className="grid md:grid-cols-2 gap-4 mb-4">
                            <div className="space-y-2">
                              <h4 className="font-semibold text-sm">
                                Patient Information
                              </h4>
                              <div className="bg-muted/30 p-3 rounded-lg space-y-1">
                                <div className="flex items-center gap-2 text-sm">
                                  <User className="h-4 w-4 text-primary" />
                                  <span>{consultation.patient_name}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                  <Mail className="h-4 w-4 text-primary" />
                                  <span>{consultation.email}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                  <Phone className="h-4 w-4 text-primary" />
                                  <span>{consultation.phone}</span>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <h4 className="font-semibold text-sm">
                                Consultation Details
                              </h4>
                              <div className="bg-muted/30 p-3 rounded-lg space-y-1">
                                <div className="flex justify-between items-center text-sm">
                                  <span>Fee:</span>
                                  <Badge className="bg-green-100 text-green-800">
                                    ${consultation.consultation_fee}
                                  </Badge>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                  <span>Payment:</span>
                                  <span className="capitalize">
                                    {consultation.payment_method}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                  <span>Booked:</span>
                                  <span>
                                    {new Date(
                                      consultation.created_at
                                    ).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {consultation.symptoms && (
                            <div className="mb-4">
                              <h4 className="font-semibold text-sm mb-2">
                                Symptoms/Concerns
                              </h4>
                              <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
                                {consultation.symptoms}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Right section */}
                        <div className="flex flex-col gap-2 min-w-[120px]">
                          {consultation.status === "confirmed" && (
                            <Button size="sm" className="bg-gradient-primary text-primary-foreground">
                              Join Call
                            </Button>
                          )}
                          {consultation.status === "pending" && (
                            <Button size="sm" variant="outline">
                              Reschedule
                            </Button>
                          )}
                          <Button size="sm" variant="outline">
                            View Details
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyConsultations;
