// src/pages/TeacherProfile.tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { auth, db } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LogOut, CheckCircle } from "lucide-react";
import BookSession from "./BookSession";
import { toast } from "sonner";

interface TeacherDoc {
  id?: string;
  name?: string;
  email?: string;
  teaching_field?: string;
  qualification?: string;
  work_experience?: string;
  approved?: boolean;
  verification_status?: string;
  certificates?: string[];
}

const useQuery = () => new URLSearchParams(useLocation().search);

const TeacherProfile = () => {
  const { teacherId } = useParams();
  const navigate = useNavigate();
  const q = useQuery();
  const openBook = q.get("book") === "1";

  const [teacher, setTeacher] = useState<TeacherDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [showBooking, setShowBooking] = useState(openBook);

  useEffect(() => {
    const load = async () => {
      if (!teacherId) return;
      setLoading(true);
      try {
        const ref = doc(db, "teachers", teacherId);
        const snap = await getDoc(ref);
        if (!snap.exists()) {
          toast.error("Teacher not found");
          navigate("/learner-dashboard");
          return;
        }
        setTeacher({ id: snap.id, ...(snap.data() as any) });
      } catch (err) {
        console.error(err);
        toast.error("Failed to load teacher");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [teacherId]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!teacher) return null;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">{teacher.name || teacher.email}</h1>
          <div className="flex items-center gap-2">
            {teacher.approved && (
              <Badge className="bg-green-500 text-white inline-flex items-center">
                <CheckCircle className="w-4 h-4 mr-1" /> Verified
              </Badge>
            )}
            <Button variant="ghost" onClick={() => navigate(-1)}>Back</Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <p><strong>Field:</strong> {teacher.teaching_field}</p>
            <p><strong>Qualification:</strong> {teacher.qualification}</p>
            <p><strong>Experience:</strong> {teacher.work_experience}</p>

            <div className="flex gap-3 mt-4">
              <Button onClick={() => setShowBooking(true)} className="bg-gradient-primary text-white">
                Book a Session
              </Button>
            </div>

            {/* certificates links if any (kept simple) */}
            {teacher.certificates && teacher.certificates.length > 0 && (
              <div className="mt-4">
                <h4 className="font-semibold">Certificates</h4>
                <ul className="list-disc pl-5">
                  {teacher.certificates.map((c, i) => (
                    <li key={i}>
                      <a href={c} target="_blank" rel="noreferrer" className="underline text-primary">
                        View Certificate #{i + 1}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {showBooking && teacher && (
        <BookSession teacherId={teacher.id!} onClose={() => setShowBooking(false)} />
      )}
    </div>
  );
};

export default TeacherProfile;
