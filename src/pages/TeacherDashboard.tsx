import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, LogOut, CheckCircle, Clock, XCircle } from "lucide-react";
import { toast } from "sonner";

interface TeacherData {
  name: string;
  qualification: string;
  teaching_field: string;
  verification_status: string;
  work_experience: string | null;
  age: number | null;
}

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const [teacherData, setTeacherData] = useState<TeacherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTeacherData();
  }, []);

  const loadTeacherData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase
        .from("teachers")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          // No teacher record found
          navigate("/teacher/registration");
          return;
        }
        throw error;
      }

      setTeacherData(data);
    } catch (error: any) {
      toast.error("Failed to load teacher data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
        return (
          <Badge className="bg-green-500 hover:bg-green-600">
            <CheckCircle className="w-3 h-3 mr-1" />
            Verified
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-500 hover:bg-yellow-600">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-red-500 hover:bg-red-600">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-primary rounded-lg">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              HyperSkill Teacher
            </h1>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">
              Welcome, {teacherData?.name || "Teacher"}!
            </h2>
            <p className="text-muted-foreground">
              Manage your profile and teaching activities
            </p>
          </div>

          {/* Verification Status Card */}
          <Card className="mb-6 shadow-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Verification Status</CardTitle>
                {teacherData && getStatusBadge(teacherData.verification_status)}
              </div>
              <CardDescription>
                {teacherData?.verification_status === "pending" &&
                  "Your qualifications are being reviewed by our team. This usually takes 1-2 business days."}
                {teacherData?.verification_status === "verified" &&
                  "Congratulations! You're verified and ready to start teaching."}
                {teacherData?.verification_status === "rejected" &&
                  "Unfortunately, your verification was not successful. Please contact support for more details."}
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Profile Information */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Your Profile</CardTitle>
              <CardDescription>Your teaching profile information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Name</p>
                  <p className="font-medium">{teacherData?.name}</p>
                </div>
                {teacherData?.age && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Age</p>
                    <p className="font-medium">{teacherData.age}</p>
                  </div>
                )}
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Qualification</p>
                <p className="font-medium">{teacherData?.qualification}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Teaching Field</p>
                <p className="font-medium">{teacherData?.teaching_field}</p>
              </div>

              {teacherData?.work_experience && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Work Experience</p>
                  <p className="font-medium whitespace-pre-wrap">{teacherData.work_experience}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default TeacherDashboard;
