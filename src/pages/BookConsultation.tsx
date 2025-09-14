import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar,
  Clock,
  Video,
  MapPin,
  User,
  Phone,
  Mail,
  Heart,
  ArrowLeft,
  CheckCircle,
  Stethoscope,
  Users,
  MessageCircle,
  CreditCard,
  Shield
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const BookConsultation = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    patientName: "",
    email: user?.email || "",
    phone: "",
    dateOfBirth: "",
    consultationType: "",
    preferredDate: "",
    preferredTime: "",
    symptoms: "",
    medicalHistory: "",
    emergencyContact: "",
    paymentMethod: ""
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const consultationTypes = [
    {
      id: "general",
      name: "General Consultation",
      description: "General health checkup and consultation",
      duration: "30 minutes",
      price: "₦60,000",
      icon: Stethoscope,
      color: "bg-blue-500"
    },
    {
      id: "specialist",
      name: "Specialist Consultation",
      description: "Consultation with medical specialists",
      duration: "45 minutes", 
      price: "₦150,000",
      icon: Users,
      color: "bg-purple-500"
    },
    {
      id: "mental-health",
      name: "Mental Health Counseling",
      description: "Psychology and mental health support",
      duration: "60 minutes",
      price: "₦80,000",
      icon: MessageCircle,
      color: "bg-green-500"
    },
    {
      id: "emergency",
      name: "Emergency Consultation",
      description: "Urgent medical consultation",
      duration: "20 minutes",
      price: "₦50,000",
      icon: Heart,
      color: "bg-red-500"
    }      
  ];

  const timeSlots = [
    "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
    "12:00 PM", "12:30 PM", "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM",
    "04:00 PM", "04:30 PM", "05:00 PM", "05:30 PM"
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleNextStep = () => {
    if (validateCurrentStep()) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 1:
        if (!formData.consultationType) {
          toast({
            title: "Selection Required",
            description: "Please select a consultation type to continue.",
            variant: "destructive"
          });
          return false;
        }
        break;
      case 2:
        if (!formData.patientName || !formData.email || !formData.phone) {
          toast({
            title: "Information Required",
            description: "Please fill in all required personal information.",
            variant: "destructive"
          });
          return false;
        }
        break;
      case 3:
        if (!formData.preferredDate || !formData.preferredTime) {
          toast({
            title: "Schedule Required",
            description: "Please select your preferred date and time.",
            variant: "destructive"
          });
          return false;
        }
        break;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const selectedConsultationType = consultationTypes.find(type => type.id === formData.consultationType);

      const { data, error } = await supabase
        .from("consultations")
        .insert([
          {
            user_id: user?.id,
            patient_name: formData.patientName,
            email: formData.email,
            phone: formData.phone,
            date_of_birth: formData.dateOfBirth,
            consultation_type: formData.consultationType,
            preferred_date: formData.preferredDate,
            preferred_time: formData.preferredTime,
            symptoms: formData.symptoms,
            medical_history: formData.medicalHistory,
            emergency_contact: formData.emergencyContact,
            payment_method: formData.paymentMethod,
            consultation_fee: selectedConsultationType?.price.replace(/[^\d]/g, ""), // save as number
            consultation_duration: selectedConsultationType?.duration,
            status: "pending",
            booking_reference: crypto.randomUUID(),
          },
        ]);

      if (error) {
        console.error("Error saving consultation:", error.message);
        toast({
          title: "Booking Failed",
          description: "There was an error booking your consultation. Please try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Consultation Booked!",
          description: "Your consultation has been successfully scheduled.",
        });
        navigate("/my-consultations");
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      toast({
        title: "Booking Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedConsultationType = consultationTypes.find(type => type.id === formData.consultationType);

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
              <span className="text-2xl font-bold text-primary">HealthConnect</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">Step {currentStep} of 4</Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    step <= currentStep ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  }`}>
                    {step < currentStep ? <CheckCircle className="h-5 w-5" /> : step}
                  </div>
                  {step < 4 && (
                    <div className={`h-1 w-full mx-4 ${
                      step < currentStep ? 'bg-primary' : 'bg-muted'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Select Service</span>
              <span>Personal Info</span>
              <span>Schedule</span>
              <span>Confirmation</span>
            </div>
          </div>

          {/* Step 1: Consultation Type Selection */}
          {currentStep === 1 && (
            <Card className="shadow-card border-0 bg-gradient-card">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Choose Your Consultation Type</CardTitle>
                <CardDescription>
                  Select the type of consultation that best fits your needs
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid md:grid-cols-2 gap-6">
                  {consultationTypes.map((type) => (
                    <Card 
                      key={type.id}
                      className={`cursor-pointer transition-all border-2 ${
                        formData.consultationType === type.id 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => setFormData({...formData, consultationType: type.id})}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className={`w-12 h-12 rounded-xl ${type.color} flex items-center justify-center`}>
                            <type.icon className="h-6 w-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-2">{type.name}</h3>
                            <p className="text-muted-foreground mb-3">{type.description}</p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">{type.duration}</span>
                              </div>
                              <Badge className="bg-green-100 text-green-800">{type.price}</Badge>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <div className="flex justify-end mt-8">
                  <Button onClick={handleNextStep} disabled={!formData.consultationType}>
                    Next Step
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Personal Information */}
          {currentStep === 2 && (
            <Card className="shadow-card border-0 bg-gradient-card">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Personal Information</CardTitle>
                <CardDescription>
                  Please provide your personal details for the consultation
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="patientName">Full Name *</Label>
                    <Input
                      id="patientName"
                      name="patientName"
                      placeholder="Enter your full name"
                      value={formData.patientName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="Enter your phone number"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input
                      id="dateOfBirth"
                      name="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="emergencyContact">Emergency Contact</Label>
                    <Input
                      id="emergencyContact"
                      name="emergencyContact"
                      placeholder="Emergency contact name and phone number"
                      value={formData.emergencyContact}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="flex justify-between mt-8">
                  <Button variant="outline" onClick={handlePrevStep}>
                    Previous
                  </Button>
                  <Button onClick={handleNextStep}>
                    Next Step
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Schedule Selection */}
          {currentStep === 3 && (
            <Card className="shadow-card border-0 bg-gradient-card">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Schedule Your Consultation</CardTitle>
                <CardDescription>
                  Choose your preferred date and time for the consultation
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <Label htmlFor="preferredDate">Preferred Date *</Label>
                    <Input
                      id="preferredDate"
                      name="preferredDate"
                      type="date"
                      value={formData.preferredDate}
                      onChange={handleInputChange}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                    
                    <div className="space-y-4">
                      <Label htmlFor="symptoms">Symptoms/Concerns</Label>
                      <Textarea
                        id="symptoms"
                        name="symptoms"
                        placeholder="Please describe your symptoms or health concerns..."
                        value={formData.symptoms}
                        onChange={handleInputChange}
                        rows={4}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <Label>Available Time Slots *</Label>
                    <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                      {timeSlots.map((time) => (
                        <Button
                          key={time}
                          variant={formData.preferredTime === time ? "default" : "outline"}
                          size="sm"
                          onClick={() => setFormData({...formData, preferredTime: time})}
                          className="justify-center"
                        >
                          {time}
                        </Button>
                      ))}
                    </div>
                    
                    <div className="space-y-4 mt-6">
                      <Label htmlFor="medicalHistory">Medical History (Optional)</Label>
                      <Textarea
                        id="medicalHistory"
                        name="medicalHistory"
                        placeholder="Any relevant medical history, current medications, allergies..."
                        value={formData.medicalHistory}
                        onChange={handleInputChange}
                        rows={4}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-between mt-8">
                  <Button variant="outline" onClick={handlePrevStep}>
                    Previous
                  </Button>
                  <Button onClick={handleNextStep}>
                    Next Step
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Confirmation */}
          {currentStep === 4 && (
            <Card className="shadow-card border-0 bg-gradient-card">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Confirm Your Consultation</CardTitle>
                <CardDescription>
                  Please review your booking details before confirming
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold mb-3">Consultation Details</h3>
                      {selectedConsultationType && (
                        <div className="bg-muted/30 p-4 rounded-lg">
                          <div className="flex items-center gap-3 mb-2">
                            <selectedConsultationType.icon className="h-5 w-5 text-primary" />
                            <span className="font-medium">{selectedConsultationType.name}</span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{selectedConsultationType.description}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Duration: {selectedConsultationType.duration} minutes</span>
                            <Badge className="bg-green-100 text-green-800">${selectedConsultationType.price}</Badge>
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <h3 className="font-semibold mb-3">Schedule</h3>
                      <div className="bg-muted/30 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar className="h-4 w-4 text-primary" />
                          <span>{new Date(formData.preferredDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-primary" />
                          <span>{formData.preferredTime}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold mb-3">Patient Information</h3>
                      <div className="bg-muted/30 p-4 rounded-lg space-y-2">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-primary" />
                          <span>{formData.patientName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-primary" />
                          <span>{formData.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-primary" />
                          <span>{formData.phone}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-3">Payment Method</h3>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            id="card"
                            name="paymentMethod"
                            value="card"
                            checked={formData.paymentMethod === "card"}
                            onChange={handleInputChange}
                          />
                          <Label htmlFor="card" className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4" />
                            Credit/Debit Card
                          </Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            id="insurance"
                            name="paymentMethod"
                            value="insurance"
                            checked={formData.paymentMethod === "insurance"}
                            onChange={handleInputChange}
                          />
                          <Label htmlFor="insurance" className="flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            Insurance
                          </Label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between mt-8">
                  <Button variant="outline" onClick={handlePrevStep}>
                    Previous
                  </Button>
                  <Button 
                    onClick={handleSubmit} 
                    disabled={isSubmitting || !formData.paymentMethod}
                    className="bg-gradient-primary text-primary-foreground"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Booking...
                      </div>
                    ) : (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Confirm Booking
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookConsultation;



