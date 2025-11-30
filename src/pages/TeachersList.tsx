// src/pages/TeachersList.tsx
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { auth, db } from "@/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";
import { toast } from "sonner";

interface Teacher {
  id: string;
  name?: string;
  email?: string;
  teaching_field?: string;
  qualification?: string;
  work_experience?: string;
  approved?: boolean;
  verification_status?: string;
}

const useQuery = () => new URLSearchParams(useLocation().search);

const TeachersList = () => {
  const navigate = useNavigate();
  const q = useQuery();
  const fieldId = q.get("fieldId") || "";
  const fieldName = q.get("fieldName") || "";

  const [loading, setLoading] = useState(true);
  const [teachers, setTeachers] = useState<Teacher[]>([]);

  useEffect(() => {
    const loadTeachers = async () => {
      setLoading(true);
      try {
        // Query teachers: only approved ones and matching the field name
        // We assume teachers have teaching_field as a plain string (e.g., "Web Development")
        const teachersRef = collection(db, "teachers");
        const qSnap = query(
          teachersRef,
          where("approved", "==", true),
          where("teaching_field", "==", fieldName)
        );
        const snap = await getDocs(qSnap);
        const data = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Teacher[];
        setTeachers(data);
      } catch (err: any) {
        console.error("Failed loading teachers:", err);
        toast.error("Failed to load teachers");
      } finally {
        setLoading(false);
      }
    };

    // defensive: only call if fieldName (passed from Learner dashboard) exists
    if (!fieldName) {
      setTeachers([]);
      setLoading(false);
      return;
    }
    loadTeachers();
  }, [fieldName, fieldId]);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">
            Teachers for: <span className="text-primary">{fieldName || "—"}</span>
          </h2>
          <div>
            <Button variant="ghost" onClick={() => navigate("/learner-dashboard")}>
              Back
            </Button>
          </div>
        </div>

        {loading ? (
          <p>Loading teachers...</p>
        ) : teachers.length === 0 ? (
          <p className="text-muted-foreground">
            No verified teachers found for this skill yet. Try another field.
          </p>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {teachers.map((t) => (
              <Card key={t.id} className="cursor-pointer">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{t.name || t.email}</CardTitle>
                      <div className="text-sm text-muted-foreground">{t.teaching_field}</div>
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <Users className="w-5 h-5" />
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <p className="text-sm"><strong>Qualification:</strong> {t.qualification || "—"}</p>
                  <p className="text-sm"><strong>Experience:</strong> {t.work_experience || "—"}</p>

                  <div className="flex gap-3 mt-4">
                    <Button onClick={() => navigate(`/teacher/${t.id}`)}>View Profile</Button>
                    <Button
                      className="bg-gradient-primary text-white"
                      onClick={() => navigate(`/teacher/${t.id}?book=1`)}
                    >
                      Request Session
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeachersList;
