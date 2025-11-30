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

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const SUBJECT_LIST = [
  "Math",
  "Physics",
  "Chemistry",
  "Biology",
  "Computer Science",
  "Web Development",
  "App Development",
  "Machine Learning",
  "Design",
  "English",
  "Tamil",
];

const LANGUAGES = [
  "English",
  "Tamil",
  "Hindi",
  "Telugu",
  "Kannada",
  "Malayalam",
];

const TeacherRegistration = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    age: "",
    qualification: "",
    workExperience: "",
    teachingField: "",
    hourlyRate: "",
    driveLink: "",
  });

  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [availability, setAvailability] = useState<{ day: string; time: string }[]>([
    { day: "", time: "" },
  ]);

  const toggleSubject = (subject: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(subject) ? prev.filter((s) => s !== subject) : [...prev, subject]
    );
  };

  const toggleLanguage = (lang: string) => {
    setSelectedLanguages((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]
    );
  };

  const updateAvailability = (index: number, key: "day" | "time", value: string) => {
    const slots = [...availability];
    slots[index][key] = value;
    setAvailability(slots);
  };

  const addSlot = () => {
    setAvailability([...availability, { day: "", time: "" }]);
  };

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

      await setDoc(teacherRef, {
        user_id: user.uid,
        email: user.email,
        name: formData.name,
        age: parseInt(formData.age) || null,
        qualification: formData.qualification,
        work_experience: formData.workExperience,
        teaching_field: formData.teachingField,

        subjects: selectedSubjects,
        languages: selectedLanguages,
        hourly_rate: formData.hourlyRate ? Number(formData.hourlyRate) : null,
        drive_link: formData.driveLink,

        availability,

        approved: false,
        rejected: false,
        verification_status: "pending",
        status: "pending_verification",
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
                placeholder="e.g., Master's in CS"
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

            {/* Teaching Languages */}
            <div>
              <Label>Teaching Languages *</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {LANGUAGES.map((lang) => (
                  <button
                    type="button"
                    key={lang}
                    onClick={() => toggleLanguage(lang)}
                    className={`px-3 py-1 rounded-full border text-sm ${
                      selectedLanguages.includes(lang)
                        ? "bg-primary text-white"
                        : "bg-muted"
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>

            {/* Subjects */}
            <div>
              <Label>Subjects You Teach *</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {SUBJECT_LIST.map((sub) => (
                  <button
                    type="button"
                    key={sub}
                    onClick={() => toggleSubject(sub)}
                    className={`px-3 py-1 rounded-full border text-sm ${
                      selectedSubjects.includes(sub)
                        ? "bg-primary text-white"
                        : "bg-muted"
                    }`}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            </div>

            {/* Pricing */}
            <div>
              <Label>Hourly Rate (₹)</Label>
              <Input
                type="number"
                placeholder="e.g. 500"
                value={formData.hourlyRate}
                onChange={(e) =>
                  setFormData({ ...formData, hourlyRate: e.target.value })
                }
              />
            </div>

            {/* Drive Link */}
            <div>
              <Label>Drive Link for Certificates</Label>
              <Input
                placeholder="Paste Google Drive folder link"
                value={formData.driveLink}
                onChange={(e) =>
                  setFormData({ ...formData, driveLink: e.target.value })
                }
              />
            </div>

            {/* Availability */}
            <div>
              <Label>Your Available Slots</Label>
              {availability.map((slot, idx) => (
                <div key={idx} className="grid grid-cols-2 gap-3 mt-2">
                  <select
                    className="border rounded p-2 text-sm"
                    value={slot.day}
                    onChange={(e) => updateAvailability(idx, "day", e.target.value)}
                  >
                    <option value="">Select Day</option>
                    {DAYS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>

                  <Input
                    type="time"
                    value={slot.time}
                    onChange={(e) => updateAvailability(idx, "time", e.target.value)}
                  />
                </div>
              ))}

              <button
                type="button"
                onClick={addSlot}
                className="text-primary text-sm mt-2 underline"
              >
                + Add another slot
              </button>
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
