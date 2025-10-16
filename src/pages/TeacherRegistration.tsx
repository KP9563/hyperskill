import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap } from "lucide-react";
import { toast } from "sonner";

const TeacherRegistration = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    qualification: "",
    workExperience: "",
    teachingField: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Please login first");
        navigate("/auth");
        return;
      }

      const { error } = await supabase
        .from("teachers")
        .insert({
          user_id: user.id,
          name: formData.name,
          age: parseInt(formData.age) || null,
          qualification: formData.qualification,
          work_experience: formData.workExperience,
          teaching_field: formData.teachingField,
        });

      if (error) {
        if (error.message.includes("duplicate")) {
          toast.error("You have already registered as a teacher");
          navigate("/teacher/dashboard");
          return;
        }
        throw error;
      }

      toast.success("Registration submitted! Your qualifications are being verified.");
      navigate("/teacher/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Failed to submit registration");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero p-4">
      <Card className="w-full max-w-2xl shadow-elevated">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <div className="p-3 bg-gradient-primary rounded-2xl">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl">Teacher Registration</CardTitle>
          <CardDescription className="text-base">
            Tell us about yourself and your qualifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="30"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="qualification">Qualification *</Label>
              <Input
                id="qualification"
                placeholder="e.g., Master's in Computer Science"
                value={formData.qualification}
                onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="workExperience">Work Experience</Label>
              <Textarea
                id="workExperience"
                placeholder="Describe your relevant work experience..."
                value={formData.workExperience}
                onChange={(e) => setFormData({ ...formData, workExperience: e.target.value })}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="teachingField">Teaching Field *</Label>
              <Input
                id="teachingField"
                placeholder="e.g., Web Development, Data Science"
                value={formData.teachingField}
                onChange={(e) => setFormData({ ...formData, teachingField: e.target.value })}
                required
              />
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Note:</strong> Your qualifications will be verified by our team. 
                You'll be notified once the verification is complete.
              </p>
            </div>

            <Button type="submit" className="w-full bg-gradient-primary" disabled={isLoading}>
              {isLoading ? "Submitting..." : "Submit Registration"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherRegistration;
