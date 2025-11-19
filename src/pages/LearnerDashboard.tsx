import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "@/firebase";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Search, LogOut, GraduationCap, Users } from "lucide-react";
import { toast } from "sonner";

// CATEGORY TYPE
interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
}

// FIELD TYPE
interface Field {
  id: string;
  category_id: string;
  name: string;
  description: string;
  teacher_count: number;
}

// SKILL TYPE
interface Skill {
  id: string;
  name: string;
  category: string;
  description: string;
}

const LearnerDashboard = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [fields, setFields] = useState<Field[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Dropdown toggle
  const [showSkills, setShowSkills] = useState(false);

  // 🔥 Static Skills List
  const skills: Skill[] = [
    { id: "skill_web", name: "Web Development", category: "Technology", description: "Frontend & backend programming" },
    { id: "skill_app", name: "App Development", category: "Technology", description: "Android & iOS development" },
    { id: "skill_ai", name: "Artificial Intelligence", category: "Technology", description: "AI & machine learning" },
    { id: "skill_ml", name: "Machine Learning", category: "Technology", description: "Model training & pipelines" },
    { id: "skill_ds", name: "Data Science", category: "Technology", description: "Analytics & visualization" },
    { id: "skill_graphic", name: "Graphic Design", category: "Creative", description: "Design & branding" },
    { id: "skill_vfx", name: "VFX", category: "Creative", description: "Visual effects & compositing" },
    { id: "skill_animation", name: "Animation", category: "Creative", description: "2D & 3D animation" },
    { id: "skill_music", name: "Music Production", category: "Creative", description: "Beats & mixing" },
    { id: "skill_marketing", name: "Digital Marketing", category: "Business", description: "SEO, ads & strategy" },
    { id: "skill_sales", name: "Sales Skills", category: "Business", description: "Communication & selling" },
    { id: "skill_finance", name: "Finance", category: "Business", description: "Investments & money management" },
    { id: "skill_cooking", name: "Cooking", category: "Lifestyle", description: "Learn to cook delicious meals" },
    { id: "skill_fitness", name: "Fitness Training", category: "Lifestyle", description: "Workout & health" },
    { id: "skill_yoga", name: "Yoga", category: "Lifestyle", description: "Mind-body wellness" },
  ];

  // FIREBASE LOAD
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) navigate("/auth");
      else loadData();
    });

    return () => unsubscribe();
  }, []);

  const loadData = async () => {
    try {
      const categoriesQuery = query(collection(db, "learning_categories"), orderBy("name"));
      const fieldsQuery = query(collection(db, "learning_fields"), orderBy("name"));

      const [catSnap, fieldSnap] = await Promise.all([
        getDocs(categoriesQuery),
        getDocs(fieldsQuery),
      ]);

      setCategories(catSnap.docs.map((d) => ({ id: d.id, ...d.data() })) as Category[]);
      setFields(fieldSnap.docs.map((d) => ({ id: d.id, ...d.data() })) as Field[]);
    } catch (error) {
      toast.error("Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/auth");
  };

  const handleFieldClick = (field: { id: string; name: string }) => {
    navigate(`/learner/teachers?fieldId=${field.id}&fieldName=${encodeURIComponent(field.name)}`);
  };

  const handleSkillClick = (skill: Skill) => {
    navigate(`/learner/teachers?skillId=${skill.id}&skillName=${encodeURIComponent(skill.name)}`);
  };

  // FILTER SKILLS
  const filteredSkills = skills.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // FILTER CATEGORIES
  const filteredCategories = categories.filter((category) => {
    if (!searchQuery) return true;
    const categoryFields = fields.filter((f) => f.category_id === category.id);
    const matchesCategory = category.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesField = categoryFields.some((f) =>
      f.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return matchesCategory || matchesField;
  });

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
              HyperSkill
            </h1>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">

        {/* SEARCH BAR */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Discover Your Next Skill</h2>
          <p className="text-muted-foreground mb-6">Search and explore thousands of learning opportunities</p>

          <div className="relative max-w-2xl">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              placeholder="Search for skills, topics, or fields..."
              className="pl-10 h-12 text-base"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* -------------------------- */}
        {/* DROPDOWN — EXPLORE SKILLS  */}
        {/* -------------------------- */}
        <div className="mb-10 mt-4">
          <Button
            variant="outline"
            className="w-full flex justify-between items-center py-6 text-lg"
            onClick={() => setShowSkills(!showSkills)}
          >
            Explore All Skills
            <span>{showSkills ? "▲" : "▼"}</span>
          </Button>

          {showSkills && (
            <div className="mt-4 grid md:grid-cols-3 gap-4">
              {filteredSkills.map((skill) => (
                <Card
                  key={skill.id}
                  className="hover:shadow-card transition-shadow cursor-pointer"
                  onClick={() => handleSkillClick(skill)}
                >
                  <CardHeader>
                    <CardTitle className="text-lg">{skill.name}</CardTitle>
                    <CardDescription>{skill.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* SUGGESTED */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">Suggested for You</h3>
          <div className="grid md:grid-cols-3 gap-4">
            {fields.slice(0, 3).map((field) => (
              <Card
                key={field.id}
                className="hover:shadow-card transition-shadow cursor-pointer"
                onClick={() => handleFieldClick(field)}
              >
                <CardHeader>
                  <CardTitle className="text-lg">{field.name}</CardTitle>
                  <CardDescription>{field.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Users className="w-4 h-4 mr-1" />
                    {field.teacher_count} teachers
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* ALL CATEGORIES */}
        <div>
          <h3 className="text-xl font-semibold mb-4">All Learning Fields</h3>

          {isLoading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : (
            <Accordion type="single" collapsible className="space-y-4">
              {filteredCategories.map((category) => {
                const categoryFields = fields.filter((f) => f.category_id === category.id);

                return (
                  <AccordionItem
                    key={category.id}
                    value={category.id}
                    className="border rounded-lg px-6 shadow-sm bg-card"
                  >
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-3 text-left">
                        <div className="p-2 bg-gradient-primary rounded-lg">
                          <GraduationCap className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-lg">{category.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {category.description}
                          </p>
                        </div>
                      </div>
                    </AccordionTrigger>

                    <AccordionContent className="pt-4">
                      <div className="grid md:grid-cols-2 gap-3">
                        {categoryFields.map((field) => (
                          <Card
                            key={field.id}
                            className="hover:bg-muted/50 transition-colors cursor-pointer"
                            onClick={() => handleFieldClick(field)}
                          >
                            <CardHeader className="pb-3">
                              <CardTitle className="text-base">{field.name}</CardTitle>
                              <CardDescription className="text-sm">{field.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="pt-0">
                              <div className="flex items-center text-xs text-muted-foreground">
                                <Users className="w-3 h-3 mr-1" />
                                {field.teacher_count} teachers available
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          )}
        </div>

      </main>
    </div>
  );
};

export default LearnerDashboard;
