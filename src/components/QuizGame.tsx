import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Timer, CheckCircle2, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Question {
  id: string;
  question: string;
  correct_answer: string;
  options: string[];
  timer_seconds: number;
}

const QuizGame = () => {
  const { id } = useParams<{ id: string }>();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isAnswered, setIsAnswered] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchQuestions();
  }, [id]);

  useEffect(() => {
    if (!isAnswered && questions[currentQuestionIndex]) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleTimeout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [currentQuestionIndex, questions, isAnswered]);

  const fetchQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from("quiz_questions")
        .select("*")
        .eq("quiz_id", id)
        .order("created_at", { ascending: true });

      if (error) throw error;
      if (data) {
        setQuestions(data);
        setTimeLeft(data[0]?.timer_seconds || 30);
      }
    } catch (error) {
      console.error("Error fetching questions:", error);
      toast({
        title: "Error",
        description: "Failed to fetch quiz questions",
        variant: "destructive",
      });
    }
  };

  const handleTimeout = () => {
    setIsAnswered(true);
    toast({
      title: "Time's up!",
      description: "Moving to next question...",
      variant: "destructive",
    });
    setTimeout(nextQuestion, 2000);
  };

  const handleAnswerSelect = async (answer: string) => {
    if (isAnswered) return;
    
    setSelectedAnswer(answer);
    setIsAnswered(true);
    
    const isCorrect = answer === questions[currentQuestionIndex].correct_answer;
    if (isCorrect) {
      setScore((prev) => prev + 1);
    }

    // Update quiz score in database
    try {
      const { error } = await supabase
        .from("quizzes")
        .update({
          current_score: isCorrect ? score + 1 : score,
          max_score: questions.length,
        })
        .eq("id", id);

      if (error) throw error;
    } catch (error) {
      console.error("Error updating score:", error);
    }

    toast({
      title: isCorrect ? "Correct!" : "Incorrect",
      description: isCorrect
        ? "Well done!"
        : `The correct answer was: ${questions[currentQuestionIndex].correct_answer}`,
      variant: isCorrect ? "default" : "destructive",
    });

    setTimeout(nextQuestion, 2000);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
      setTimeLeft(questions[currentQuestionIndex + 1]?.timer_seconds || 30);
    } else {
      toast({
        title: "Quiz completed!",
        description: `Final score: ${score}/${questions.length}`,
      });
    }
  };

  if (questions.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <p>Loading quiz questions...</p>
        </CardContent>
      </Card>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Question {currentQuestionIndex + 1}/{questions.length}</span>
          <span className="flex items-center text-orange-500">
            <Timer className="mr-2 h-5 w-5" />
            {timeLeft}s
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-lg font-medium">{currentQuestion.question}</div>
        <div className="grid gap-3">
          {currentQuestion.options.map((option, index) => (
            <Button
              key={index}
              variant={
                isAnswered
                  ? option === currentQuestion.correct_answer
                    ? "default"
                    : option === selectedAnswer
                    ? "destructive"
                    : "outline"
                  : "outline"
              }
              className="justify-start h-auto py-3 px-4"
              onClick={() => handleAnswerSelect(option)}
              disabled={isAnswered}
            >
              {isAnswered && option === currentQuestion.correct_answer && (
                <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
              )}
              {isAnswered && option === selectedAnswer && option !== currentQuestion.correct_answer && (
                <XCircle className="mr-2 h-4 w-4 text-red-500" />
              )}
              {option}
            </Button>
          ))}
        </div>
        <div className="mt-4 text-right text-sm text-muted-foreground">
          Score: {score}/{questions.length}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuizGame;