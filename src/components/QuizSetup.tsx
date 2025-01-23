import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface OpenTDBQuestion {
  category: string;
  type: string;
  difficulty: string;
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
}

const QuizSetup = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [numQuestions, setNumQuestions] = useState("5");
  const [isLoading, setIsLoading] = useState(false);

  const fetchAndSaveQuestions = async () => {
    setIsLoading(true);
    try {
      // Fetch questions from OpenTDB
      const response = await fetch(
        `https://opentdb.com/api.php?amount=${numQuestions}&type=multiple`
      );
      const data = await response.json();

      if (data.response_code !== 0) {
        throw new Error("Failed to fetch questions from OpenTDB");
      }

      // Transform and save questions
      const questions = data.results.map((q: OpenTDBQuestion) => {
        const options = [...q.incorrect_answers, q.correct_answer].sort(
          () => Math.random() - 0.5
        );
        
        return {
          quiz_id: id,
          question: q.question,
          correct_answer: q.correct_answer,
          options,
          category: q.category,
          difficulty: q.difficulty,
          type: q.type,
          timer_seconds: 30,
        };
      });

      const { error } = await supabase.from("quiz_questions").insert(questions);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Quiz questions have been set up successfully!",
      });

      navigate(`/dashboard/quizzes/${id}`);
    } catch (error) {
      console.error("Error setting up quiz:", error);
      toast({
        title: "Error",
        description: "Failed to set up quiz questions",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quiz Setup</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium">Number of Questions</label>
          <Input
            type="number"
            min="1"
            max="50"
            value={numQuestions}
            onChange={(e) => setNumQuestions(e.target.value)}
            className="mt-1"
          />
        </div>
        <Button
          onClick={fetchAndSaveQuestions}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? "Loading Questions..." : "Start Quiz Setup"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default QuizSetup;