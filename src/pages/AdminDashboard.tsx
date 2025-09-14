import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  Search,
  Filter,
  Download,
  Eye,
  DollarSign,
  TrendingUp,
  UserCheck
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Consultation {
  id: string;
  user_id?: string;
  patient_name: string;
  email: string;
  phone: string;
  date_of_birth?: string;
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

const AdminDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [filteredConsultations, setFilteredConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
    totalRevenue: 0
  });

  // Check if user is admin
  if (!user || user.email !== "marvellousbenji721@gmail.com") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
            <p className="text-muted-foreground mb-6">
              You are not authorized to access the admin dashboard.
            </p>
            <Link to="/">
              <Button className="w-full">Go to Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const consultationTypeDetails = {
    "general": {
      name: "General Consultation",
      icon: Stethoscope,
      color: "bg-blue-500"
    },
    "specialist": {
      name: "Specialist Consultation", 
      icon: Users,
      color: "bg-purple-500"
    },
    "mental-health": {
      name: "Mental Health Counseling",
      icon: MessageCircle,
      color: "bg-green-500"
    },
    "emergency": {
      name: "Emergency Consultation",
      icon: Heart,
      color: "bg-red-500"
    }
  };

  const statusDetails = {
    "pending": {
      label: "Pending",
      icon: AlertCircle,
      color: "bg-yellow-100 text-yellow-800"
    },
    "confirmed": {
      label: "Confirmed",
      icon: CheckCircle,
      color: "bg-green-100 text-green-800"
    },
    "completed": {
      label: "Completed",
      icon: CheckCircle,
      color: "bg-blue-100 text-blue-800"
    },
    "cancelled": {
      label: "Cancelled",
      icon: XCircle,
      color: "bg-red-100 text-red-800"
    }
  };

  useEffect(() => {
    fetchConsultations();
  }, []);

  useEffect(() => {
    filterConsultations();
    calculateStats();
  }, [consultations, searchTerm, statusFilter]);

  const fetchConsultations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('consultations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setConsultations(data || []);
    } catch (error: any) {
      console.error('Error fetching consultations:', error);
      toast({
        title: "Error",
        description: "Failed to load consultations. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filterConsultations = () => {
    let filtered = consultations;

    if (searchTerm) {
      filtered = filtered.filter(consultation => 
        consultation.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        consultation.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        consultation.booking_reference.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(consultation => consultation.status === statusFilter);
    }

    setFilteredConsultations(filtered);
  };

  const calculateStats = () => {
    const total = consultations.length;
    const pending = consultations.filter(c => c.status === 'pending').length;
    const confirmed = consultations.filter(c => c.status === 'confirmed').length;
    const completed = consultations.filter(c => c.status === 'completed').length;
    const cancelled = consultations.filter(c => c.status === 'cancelled').length;
    const totalRevenue = consultations
      .filter(c => c.status === 'completed')
      .reduce((sum, c) => sum + Number(c.consultation_fee), 0);

    setStats({
      total,
      pending,
      confirmed,
      completed,
      cancelled,
      totalRevenue
    });
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('consultations')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Status Updated",
        description: `Consultation has been ${newStatus}.`
      });
      
      fetchConsultations();
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update consultation status.",
        variant: "destructive"
      });
    }
  };

  const getConsultationType = (type: string) => {
    return consultationTypeDetails[type as keyof typeof consultationTypeDetails] || {
      name: type,
      icon: Stethoscope,
      color: "bg-gray-500"
    };
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short', 
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
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
              <span className="text-2xl font-bold text-primary">HealthConnect Admin</span>
            </div>
          </div>
          <Badge className="bg-red-100 text-red-800">
            Admin Dashboard
          </Badge>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Page Title */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">Admin Dashboard</h1>
            <p className="text-xl text-muted-foreground">
              Manage consultations and monitor platform activity
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                <div className="text-sm text-muted-foreground">Total</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                <div className="text-sm text-muted-foreground">Pending</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{stats.confirmed}</div>
                <div className="text-sm text-muted-foreground">Confirmed</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.completed}</div>
                <div className="text-sm text-muted-foreground">Completed</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-red-600">{stats.cancelled}</div>
                <div className="text-sm text-muted-foreground">Cancelled</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalRevenue)}</div>
                <div className="text-sm text-muted-foreground">Revenue</div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, email, or booking reference"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 rounded-lg border-2 bg-background"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Consultations List */}
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center gap-2 text-muted-foreground">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                Loading consultations...
              </div>
            </div>
          ) : filteredConsultations.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Consultations Found</h3>
                <p className="text-muted-foreground">
                  {searchTerm || statusFilter !== "all" 
                    ? "No consultations match your current filters."
                    : "No consultation bookings have been made yet."
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredConsultations.map((consultation) => {
                const consultationType = getConsultationType(consultation.consultation_type);
                const ConsultationIcon = consultationType.icon;
                
                return (
                  <Card key={consultation.id} className="shadow-card border-0 bg-gradient-card">
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
                        {/* Left section */}
                        <div className="flex-1">
                          <div className="flex items-start gap-4 mb-4">
                            <div className={`w-12 h-12 rounded-xl ${consultationType.color} flex items-center justify-center shadow-soft`}>
                              <ConsultationIcon className="h-6 w-6 text-white" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-xl font-bold text-primary">
                                  {consultation.patient_name}
                                </h3>
                                {getStatusBadge(consultation.status)}
                              </div>
                              <p className="text-muted-foreground mb-2">
                                {consultationType.name} • {consultation.booking_reference}
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
                                  <DollarSign className="h-4 w-4" />
                                  {formatCurrency(consultation.consultation_fee)}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Patient Details */}
                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="bg-muted/30 p-3 rounded-lg">
                              <h4 className="font-semibold text-sm mb-2">Contact Information</h4>
                              <div className="space-y-1 text-sm">
                                <div className="flex items-center gap-2">
                                  <Mail className="h-3 w-3 text-primary" />
                                  <span>{consultation.email}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Phone className="h-3 w-3 text-primary" />
                                  <span>{consultation.phone}</span>
                                </div>
                                {consultation.emergency_contact && (
                                  <div className="flex items-center gap-2">
                                    <UserCheck className="h-3 w-3 text-primary" />
                                    <span>{consultation.emergency_contact}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="bg-muted/30 p-3 rounded-lg">
                              <h4 className="font-semibold text-sm mb-2">Booking Details</h4>
                              <div className="space-y-1 text-sm">
                                <div>Payment: {consultation.payment_method}</div>
                                <div>Duration: {consultation.consultation_duration} minutes</div>
                                <div>Booked: {formatDate(consultation.created_at)}</div>
                              </div>
                            </div>
                          </div>

                          {consultation.symptoms && (
                            <div className="mt-4">
                              <h4 className="font-semibold text-sm mb-2">Symptoms/Concerns</h4>
                              <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
                                {consultation.symptoms}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Right section - Actions */}
                        <div className="flex flex-col gap-2 min-w-[140px]">
                          {consultation.status === 'pending' && (
                            <>
                              <Button 
                                size="sm" 
                                className="bg-green-600 hover:bg-green-700 text-white"
                                onClick={() => updateStatus(consultation.id, 'confirmed')}
                              >
                                <CheckCircle className="mr-1 h-4 w-4" />
                                Approve
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => updateStatus(consultation.id, 'cancelled')}
                              >
                                <XCircle className="mr-1 h-4 w-4" />
                                Decline
                              </Button>
                            </>
                          )}
                          
                          {consultation.status === 'confirmed' && (
                            <Button 
                              size="sm" 
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                              onClick={() => updateStatus(consultation.id, 'completed')}
                            >
                              <CheckCircle className="mr-1 h-4 w-4" />
                              Mark Complete
                            </Button>
                          )}
                          
                          <Button size="sm" variant="outline">
                            <Eye className="mr-1 h-4 w-4" />
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

export default AdminDashboard;