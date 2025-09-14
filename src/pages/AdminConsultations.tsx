import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";

interface Consultation {
  id: string;
  patient_name: string;
  consultation_type: string;
  preferred_date: string;
  preferred_time: string;
  consultation_fee: number;
  status: "pending" | "confirmed" | "completed" | "cancelled";
}

const AdminConsultations = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);

  // Only allow your admin account
  if (user?.email !== "omatulemarvellous721@gmail.com") {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Card className="p-8 text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold">Access Denied</h2>
          <p className="text-gray-600">You are not authorized to view this page.</p>
        </Card>
      </div>
    );
  }

  useEffect(() => {
    fetchConsultations();
  }, []);

  const fetchConsultations = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("consultations")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      toast({
        title: "Error loading consultations",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setConsultations(data || []);
    }
    setLoading(false);
  };

  const updateStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase
      .from("consultations")
      .update({ status: newStatus })
      .eq("id", id);

    if (error) {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "Status updated", description: `Marked as ${newStatus}` });
      fetchConsultations(); // refresh list
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <AlertCircle className="h-6 w-6 animate-spin mr-2 text-blue-500" />
        Loading consultations...
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Admin Consultations</h1>
      {consultations.length === 0 ? (
        <p className="text-gray-500">No consultations found.</p>
      ) : (
        <div className="grid gap-6">
          {consultations.map((c) => (
            <Card key={c.id} className="shadow">
              <CardHeader>
                <CardTitle>{c.patient_name} – {c.consultation_type}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p><strong>Date:</strong> {c.preferred_date} at {c.preferred_time}</p>
                <p><strong>Fee:</strong> ₦{c.consultation_fee.toLocaleString()}</p>
                <Badge className="mb-2">{c.status}</Badge>
                <div className="flex gap-3">
                  <Button
                    size="sm"
                    className="bg-green-600 text-white"
                    onClick={() => updateStatus(c.id, "confirmed")}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" /> Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => updateStatus(c.id, "cancelled")}
                  >
                    <XCircle className="h-4 w-4 mr-1" /> Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminConsultations;
