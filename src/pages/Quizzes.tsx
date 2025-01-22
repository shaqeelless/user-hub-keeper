import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { BookOpen, PlusSquare, Trash2 } from "lucide-react";

interface Quiz {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
}

const Quizzes = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const { data, error } = await supabase
        .from("quizzes")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setQuizzes(data || []);
    } catch (error) {
      console.error("Error fetching quizzes:", error);
      toast({
        title: "Error",
        description: "Failed to fetch quizzes",
        variant: "destructive",
      });
    }
  };

  const createQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      const { error } = await supabase.from("quizzes").insert([
        {
          title,
          description,
          user_id: user?.id,
        },
      ]);

      if (error) throw error;

      setTitle("");
      setDescription("");
      fetchQuizzes();
      toast({
        title: "Success",
        description: "Quiz created successfully",
      });
    } catch (error) {
      console.error("Error creating quiz:", error);
      toast({
        title: "Error",
        description: "Failed to create quiz",
        variant: "destructive",
      });
    }
  };

  const deleteQuiz = async (id: string) => {
    try {
      const { error } = await supabase.from("quizzes").delete().eq("id", id);

      if (error) throw error;
      fetchQuizzes();
      toast({
        title: "Success",
        description: "Quiz deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting quiz:", error);
      toast({
        title: "Error",
        description: "Failed to delete quiz",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quizzes</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={createQuiz} className="space-y-4 mb-6">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Quiz title"
          />
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Quiz description"
          />
          <Button type="submit">
            <PlusSquare className="mr-2" />
            Create Quiz
          </Button>
        </form>
        <div className="grid gap-4">
          {quizzes.map((quiz) => (
            <div
              key={quiz.id}
              className="flex items-center justify-between p-4 border rounded"
            >
              <div>
                <h3 className="font-semibold">{quiz.title}</h3>
                {quiz.description && (
                  <p className="text-sm text-gray-500">{quiz.description}</p>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="icon">
                  <BookOpen className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteQuiz(quiz.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default Quizzes;