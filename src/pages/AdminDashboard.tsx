import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface Consultation {
  id: string;
  patient_name: string;
  email: string;
  phone: string;
  consultation_type: string;
  preferred_date: string;
  preferred_time: string;
  consultation_fee: number;
  consultation_duration: number;
  status: string;
  booking_reference: string;
}

const AdminDashboard = () => {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch consultations
  const fetchConsultations = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("consultations")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching consultations:", error.message);
    } else {
      setConsultations(data || []);
    }
    setLoading(false);
  };

  // Approve or Reject consultation
  const updateStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase
      .from("consultations")
      .update({ status: newStatus })
      .eq("id", id);

    if (error) {
      console.error("Error updating status:", error.message);
    } else {
      fetchConsultations();
    }
  };

  useEffect(() => {
    fetchConsultations();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      {loading ? (
        <p>Loading consultations...</p>
      ) : consultations.length === 0 ? (
        <p>No consultations found.</p>
      ) : (
        <Card className="p-4 overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 border">Patient</th>
                <th className="p-2 border">Email</th>
                <th className="p-2 border">Phone</th>
                <th className="p-2 border">Type</th>
                <th className="p-2 border">Date</th>
                <th className="p-2 border">Time</th>
                <th className="p-2 border">Fee</th>
                <th className="p-2 border">Duration</th>
                <th className="p-2 border">Status</th>
                <th className="p-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {consultations.map((c) => (
                <tr key={c.id} className="text-center border-t">
                  <td className="p-2 border">{c.patient_name}</td>
                  <td className="p-2 border">{c.email}</td>
                  <td className="p-2 border">{c.phone}</td>
                  <td className="p-2 border">{c.consultation_type}</td>
                  <td className="p-2 border">{c.preferred_date}</td>
                  <td className="p-2 border">{c.preferred_time}</td>
                  <td className="p-2 border">₦{c.consultation_fee}</td>
                  <td className="p-2 border">{c.consultation_duration} mins</td>
                  <td
                    className={`p-2 border font-semibold ${
                      c.status === "approved"
                        ? "text-green-600"
                        : c.status === "rejected"
                        ? "text-red-600"
                        : "text-gray-600"
                    }`}
                  >
                    {c.status}
                  </td>
                  <td className="p-2 border space-x-2">
                    <Button
                      size="sm"
                      className="bg-green-500 text-white"
                      onClick={() => updateStatus(c.id, "approved")}
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      className="bg-red-500 text-white"
                      onClick={() => updateStatus(c.id, "rejected")}
                    >
                      Reject
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
};

export default AdminDashboard;
