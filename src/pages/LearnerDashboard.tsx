// src/pages/LearnerDashboard.tsx

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

// Skill type based on your JSON file
interface Skill {
  id: string;
  name: string;
  category: string;
  description: string;
  tags?: string[];
  level?: string;
}

interface Category {
  id: string;
  name: string;
  description: string;
}
interface Field {
  id: string;
  category_id: string;
  name: string;
  description: string;
  teacher_count: number;
}

const LearnerDashboard = () => {
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [fields, setFields] = useState<Field[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [showSkills, setShowSkills] = useState(false);

  // -------------------------------------------
  // LOAD FIREBASE + LOCAL skills.json
  // -------------------------------------------
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) navigate("/auth");
      else {
        loadFirebaseData();
        loadSkills();
      }
    });

    return () => unsub();
  }, []);

  // Load skills.json locally
  const loadSkills = async () => {
    try {
      const res = await fetch("/src/data/skills.json");
      const json = await res.json();
      setSkills(json);
    } catch (err) {
      console.error("Failed to load skills.json:", err);
      toast.error("Could not load skills list");
    }
  };

  const loadFirebaseData = async () => {
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

  // -------------------------------------------
  // ACTIONS
  // -------------------------------------------
  const handleLogout = async () => {
    await signOut(auth);
    navigate("/auth");
  };

  const handleSkillClick = (skill: Skill) => {
    navigate(`/learner/teachers?fieldName=${encodeURIComponent(skill.name)}`);
  };

  const handleFieldClick = (field: Field) => {
    navigate(`/learner/teachers?fieldName=${encodeURIComponent(field.name)}`);
  };

  // -------------------------------------------
  // FILTERS
  // -------------------------------------------
  const filteredSkills = skills.filter((skill) => {
    const q = searchQuery.toLowerCase();
    return (
      skill.name.toLowerCase().includes(q) ||
      skill.category.toLowerCase().includes(q) ||
      skill.description.toLowerCase().includes(q)
    );
  });

  const filteredCategories = categories.filter((cat) => {
    if (!searchQuery) return true;

    const catFields = fields.filter((f) => f.category_id === cat.id);
    const q = searchQuery.toLowerCase();

    return (
      cat.name.toLowerCase().includes(q) ||
      catFields.some((f) => f.name.toLowerCase().includes(q))
    );
  });

  // -------------------------------------------
  // UI
  // -------------------------------------------
  return (
    <div className="min-h-screen bg-background">

      {/* HEADER */}
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
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </Button>

        </div>
      </header>

      {/* BODY */}
      <main className="container mx-auto px-4 py-8">

        {/* SEARCH AREA */}
        <section className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Discover Your Next Skill</h2>
          <p className="text-muted-foreground mb-6">Search and explore thousands of learning opportunities</p>

          <div className="relative max-w-2xl">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search skills, topics, or fields…"
              className="pl-10 h-12 text-base"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </section>

        {/* SKILLS SECTION */}
        <section className="mb-12">
          <Card className="p-6 shadow-sm bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl font-semibold">Explore Skills</CardTitle>
              <CardDescription>Browse skills across all categories</CardDescription>
            </CardHeader>

            <div className="mt-4">
              <Button
                variant="outline"
                className="w-full flex justify-between items-center py-6 text-lg"
                onClick={() => setShowSkills(!showSkills)}
              >
                All Skills
                <span>{showSkills ? "▲" : "▼"}</span>
              </Button>

              {showSkills && (
                <div className="mt-4 grid md:grid-cols-3 gap-4">
                  {filteredSkills.slice(0, 60).map((skill) => (
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

                  {filteredSkills.length > 60 && (
                    <p className="text-sm text-muted-foreground px-2">
                      Showing top 60 results. Use search for more.
                    </p>
                  )}
                </div>
              )}
            </div>
          </Card>
        </section>

        {/* SUGGESTED */}
        <section className="mb-10">
          <h3 className="text-xl font-semibold mb-4">Suggested for You</h3>

          <div className="grid md:grid-cols-3 gap-4">
            {fields.slice(0, 3).map((field) => (
              <Card
                key={field.id}
                className="hover:shadow-card cursor-pointer transition-shadow"
                onClick={() => handleFieldClick(field)}
              >
                <CardHeader>
                  <CardTitle>{field.name}</CardTitle>
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
        </section>

        {/* CATEGORIES */}
        <section>
          <h3 className="text-xl font-semibold mb-4">All Learning Fields</h3>

          {isLoading ? (
            <p className="text-muted-foreground">Loading…</p>
          ) : (
            <Accordion type="single" collapsible className="space-y-4">
              {filteredCategories.map((cat) => {
                const relatedFields = fields.filter((f) => f.category_id === cat.id);

                return (
                  <AccordionItem
                    key={cat.id}
                    value={cat.id}
                    className="border rounded-lg shadow-sm bg-card px-6"
                  >
                    <AccordionTrigger>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-primary rounded-lg">
                          <GraduationCap className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-lg">{cat.name}</h4>
                          <p className="text-sm text-muted-foreground">{cat.description}</p>
                        </div>
                      </div>
                    </AccordionTrigger>

                    <AccordionContent className="pt-4">
                      <div className="grid md:grid-cols-2 gap-3">
                        {relatedFields.map((f) => (
                          <Card
                            key={f.id}
                            className="cursor-pointer hover:bg-muted/50 transition-colors"
                            onClick={() => handleFieldClick(f)}
                          >
                            <CardHeader className="pb-2">
                              <CardTitle className="text-base">{f.name}</CardTitle>
                              <CardDescription>{f.description}</CardDescription>
                            </CardHeader>

                            <CardContent>
                              <div className="text-xs flex items-center text-muted-foreground">
                                <Users className="w-3 h-3 mr-1" />
                                {f.teacher_count} teachers available
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
        </section>

      </main>
    </div>
  );
};

export default LearnerDashboard;
