import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap, BookOpen, Users, Award, Globe, Star } from "lucide-react";

const Index = () => {

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16 animate-fade-in">
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
          <div className="flex gap-4 justify-center flex-wrap">
            <Button 
              size="lg" 
              className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-6 h-auto shadow-elevated"
            >
              Browse Courses
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="border-2 border-white text-white hover:bg-white/10 text-lg px-8 py-6 h-auto"
            >
              Become a Teacher
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-8 mb-20 max-w-4xl mx-auto">
          <div className="text-center text-white">
            <div className="text-5xl font-bold mb-2">10K+</div>
            <div className="text-lg text-white/80">Active Students</div>
          </div>
          <div className="text-center text-white">
            <div className="text-5xl font-bold mb-2">500+</div>
            <div className="text-lg text-white/80">Expert Teachers</div>
          </div>
          <div className="text-center text-white">
            <div className="text-5xl font-bold mb-2">50+</div>
            <div className="text-lg text-white/80">Course Categories</div>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-white hover:bg-white/20 transition-all">
            <div className="mb-4">
              <BookOpen className="w-12 h-12" />
            </div>
            <h3 className="text-2xl font-bold mb-3">Learn Anything</h3>
            <p className="text-white/80">
              Access thousands of courses across multiple fields and topics
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-white hover:bg-white/20 transition-all">
            <div className="mb-4">
              <Users className="w-12 h-12" />
            </div>
            <h3 className="text-2xl font-bold mb-3">Expert Teachers</h3>
            <p className="text-white/80">
              Learn from verified, qualified teachers in their fields
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-white hover:bg-white/20 transition-all">
            <div className="mb-4">
              <Globe className="w-12 h-12" />
            </div>
            <h3 className="text-2xl font-bold mb-3">Global Community</h3>
            <p className="text-white/80">
              Connect with learners from around the world
            </p>
          </div>
        </div>

        {/* Popular Categories */}
        <div className="mb-20">
          <h2 className="text-4xl font-bold text-white text-center mb-12">Popular Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-6xl mx-auto">
            {[
              "Programming", 
              "Design", 
              "Business", 
              "Marketing", 
              "Photography", 
              "Music", 
              "Languages", 
              "Fitness"
            ].map((category) => (
              <Card key={category} className="hover:shadow-xl transition-all cursor-pointer group">
                <CardContent className="p-6 text-center">
                  <Star className="w-8 h-8 mx-auto mb-2 text-primary group-hover:scale-110 transition-transform" />
                  <div className="font-semibold text-lg">{category}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
