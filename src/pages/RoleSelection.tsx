import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, BookOpen } from "lucide-react";
import { toast } from "sonner";

const RoleSelection = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleRoleSelection = async (role: "teacher" | "learner") => {
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Please login first");
        navigate("/auth");
        return;
      }

      const { error } = await supabase
        .from("profiles")
        .update({ role })
        .eq("id", user.id);

      if (error) throw error;

      if (role === "teacher") {
        navigate("/teacher/registration");
      } else {
        // Create learner entry
        const { error: learnerError } = await supabase
          .from("learners")
          .insert({ user_id: user.id });

        if (learnerError && !learnerError.message.includes("duplicate")) {
          throw learnerError;
        }

        navigate("/learner/dashboard");
      }

      toast.success(`Welcome as a ${role}!`);
    } catch (error: any) {
      toast.error(error.message || "Failed to set role");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Choose Your Path</h1>
          <p className="text-white/80 text-lg">Are you here to teach or to learn?</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="shadow-elevated hover:shadow-2xl transition-all cursor-pointer group" onClick={() => !isLoading && handleRoleSelection("teacher")}>
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-gradient-primary rounded-2xl group-hover:scale-110 transition-transform">
                  <GraduationCap className="w-12 h-12 text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl">I'm a Teacher</CardTitle>
              <CardDescription className="text-base">
                Share your knowledge and expertise with eager learners
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                  Create and share courses
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                  Verify your qualifications
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                  Connect with students worldwide
                </li>
              </ul>
              <Button className="w-full mt-4 bg-gradient-primary" disabled={isLoading}>
                Continue as Teacher
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-elevated hover:shadow-2xl transition-all cursor-pointer group" onClick={() => !isLoading && handleRoleSelection("learner")}>
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-gradient-accent rounded-2xl group-hover:scale-110 transition-transform">
                  <BookOpen className="w-12 h-12 text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl">I'm a Learner</CardTitle>
              <CardDescription className="text-base">
                Discover new skills and expand your knowledge
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent"></span>
                  Access thousands of courses
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent"></span>
                  Learn from verified teachers
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent"></span>
                  Track your progress
                </li>
              </ul>
              <Button className="w-full mt-4 bg-gradient-accent" disabled={isLoading}>
                Continue as Learner
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;
