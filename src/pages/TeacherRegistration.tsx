import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "@/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
      const user = auth.currentUser;
      if (!user) {
        toast.error("Please login first");
        navigate("/auth");
        return;
      }

      const teacherRef = doc(db, "teachers", user.uid);
      const teacherSnap = await getDoc(teacherRef);

      if (teacherSnap.exists()) {
        toast.error("You have already registered");
        navigate("/teacher-dashboard");
        return;
      }

      // save teacher WITHOUT certificates
      await setDoc(teacherRef, {
        user_id: user.uid,
        email: user.email,
        name: formData.name,
        age: parseInt(formData.age) || null,

        academic_details: {
          qualification: formData.qualification,
          highest_degree: formData.qualification,
          graduation_year: null,
        },

        experience: {
          summary: formData.workExperience,
          years: formData.workExperience ? 1 : 0,
        },

        teaching_specialization: {
          main: formData.teachingField,
          tags: formData.teachingField.split(" "),
        },

        teaching_field: formData.teachingField,
        qualification: formData.qualification,
        work_experience: formData.workExperience,

        approved: false,
        rejected: false,
        verification_status: "pending",
        created_at: new Date(),
      });

      toast.success("Registration submitted!");
      navigate("/teacher-dashboard");
    } catch (error: any) {
      toast.error("Failed to submit registration");
      console.error(error);
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
          <CardDescription>
            Tell us about yourself and your qualifications
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Name + Age */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Full Name *</Label>
                <Input
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <Label>Age</Label>
                <Input
                  type="number"
                  placeholder="30"
                  value={formData.age}
                  onChange={(e) =>
                    setFormData({ ...formData, age: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Qualification */}
            <div>
              <Label>Qualification *</Label>
              <Input
                placeholder="e.g., Master's in Computer Science"
                value={formData.qualification}
                onChange={(e) =>
                  setFormData({ ...formData, qualification: e.target.value })
                }
                required
              />
            </div>

            {/* Work Experience */}
            <div>
              <Label>Work Experience</Label>
              <Textarea
                placeholder="Describe your experience..."
                rows={3}
                value={formData.workExperience}
                onChange={(e) =>
                  setFormData({ ...formData, workExperience: e.target.value })
                }
              />
            </div>

            {/* Teaching Field */}
            <div>
              <Label>Teaching Field *</Label>
              <Input
                placeholder="e.g., Web Development"
                value={formData.teachingField}
                onChange={(e) =>
                  setFormData({ ...formData, teachingField: e.target.value })
                }
                required
              />
            </div>

            {/* Note */}
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Note:</strong> Your qualifications will be reviewed by our team.
              </p>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-primary"
              disabled={isLoading}
            >
              {isLoading ? "Submitting..." : "Submit Registration"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherRegistration;
