import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { GraduationCap, BookOpen, Users, Award } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();

      if (profile?.role === "teacher") {
        navigate("/teacher/dashboard");
      } else if (profile?.role === "learner") {
        navigate("/learner/dashboard");
      } else {
        navigate("/role-selection");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-white/10 backdrop-blur-sm rounded-3xl">
              <GraduationCap className="w-16 h-16 text-white" />
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Welcome to HyperSkill
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto">
            Making learning easy and accessible for everyone
          </p>
          <Button 
            size="lg" 
            className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-6 h-auto"
            onClick={() => navigate("/auth")}
          >
            Get Started
          </Button>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-white">
            <div className="mb-4">
              <BookOpen className="w-12 h-12" />
            </div>
            <h3 className="text-2xl font-bold mb-3">Learn Anything</h3>
            <p className="text-white/80">
              Access thousands of courses across multiple fields and topics
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-white">
            <div className="mb-4">
              <Users className="w-12 h-12" />
            </div>
            <h3 className="text-2xl font-bold mb-3">Expert Teachers</h3>
            <p className="text-white/80">
              Learn from verified, qualified teachers in their fields
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-white">
            <div className="mb-4">
              <Award className="w-12 h-12" />
            </div>
            <h3 className="text-2xl font-bold mb-3">Track Progress</h3>
            <p className="text-white/80">
              Monitor your learning journey and achieve your goals
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
