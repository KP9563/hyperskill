import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, GraduationCap, Clock, DollarSign, BookOpen } from "lucide-react";
import { toast } from "sonner";

interface Teacher {
  id: string;
  name: string;
  work_experience: string;
  hours_taught: number;
  price_per_session: number;
  qualification: string;
  verification_status: string;
}

const TeachersList = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fieldId = searchParams.get("fieldId");
  const fieldName = searchParams.get("fieldName");
  
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!fieldId || !fieldName) {
      toast.error("Invalid field selection");
      navigate("/learner/dashboard");
      return;
    }
    loadTeachers();
  }, [fieldId]);

  const loadTeachers = async () => {
    try {
      const { data, error } = await supabase
        .from("teachers")
        .select("*")
        .eq("teaching_field", fieldName)
        .eq("verification_status", "approved");

      if (error) throw error;
      setTeachers(data || []);
    } catch (error: any) {
      toast.error("Failed to load teachers");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/learner/dashboard")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="p-2 bg-gradient-primary rounded-lg">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{fieldName}</h1>
              <p className="text-sm text-muted-foreground">{teachers.length} teachers available</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {isLoading ? (
          <p className="text-muted-foreground">Loading teachers...</p>
        ) : teachers.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No Teachers Available</CardTitle>
              <CardDescription>
                There are currently no verified teachers for this field. Please check back later.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Available Teachers</CardTitle>
              <CardDescription>
                Browse and compare teachers for {fieldName}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Qualification</TableHead>
                    <TableHead>Work Experience</TableHead>
                    <TableHead className="text-center">Hours Taught</TableHead>
                    <TableHead className="text-right">Price per Session</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teachers.map((teacher) => (
                    <TableRow key={teacher.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-white font-semibold">
                            {teacher.name.charAt(0).toUpperCase()}
                          </div>
                          {teacher.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm">
                          <BookOpen className="w-4 h-4 text-muted-foreground" />
                          {teacher.qualification}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {teacher.work_experience || "Not specified"}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1 text-sm">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          {teacher.hours_taught}h
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1 text-sm font-semibold">
                          <DollarSign className="w-4 h-4 text-primary" />
                          {teacher.price_per_session.toFixed(2)}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default TeachersList;
