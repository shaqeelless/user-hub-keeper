import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import Confetti from "react-confetti";
import { useNavigate } from "react-router-dom";
import { FaAngry } from "react-icons/fa"; // Angry Face Icon
import classNames from "classnames";

import he from "he"; // Importing `he` for decoding HTML entities

// Quiz question type
interface Question {
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
}

const QuizApp = () => {
  const [topics, setTopics] = useState<any[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string>("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(30); // 30 seconds for each question
  const [isQuizStarted, setIsQuizStarted] = useState(false);
  const [isWin, setIsWin] = useState(false);
  const [isLose, setIsLose] = useState(false);
  const [shake, setShake] = useState(false); // To trigger screen shake effect
  const { toast } = useToast();
  const navigate = useNavigate();

  // Decode the current question text to ensure it's clean (without HTML entities)
  const decodedQuestion = questions[currentQuestionIndex]?.question
    ? he.decode(questions[currentQuestionIndex]?.question)
    : "Loading question...";

  // Fetch available topics for the quiz
  useEffect(() => {
    const fetchTopics = async () => {
      const response = await fetch("https://opentdb.com/api_category.php");
      const data = await response.json();
      setTopics(data.trivia_categories);
    };
    fetchTopics();
  }, []);

  // Fetch quiz questions based on selected topic
  const fetchQuestions = async (categoryId: string) => {
    try {
      const response = await fetch(
        `https://opentdb.com/api.php?amount=5&category=${categoryId}&type=multiple`
      );
      const data = await response.json();
      setQuestions(data.results);
      setCurrentQuestionIndex(0);
      setScore(0);
      setTimer(30);
      setIsQuizStarted(true);
      setIsWin(false);
      setIsLose(false);
    } catch (error) {
      console.error("Error fetching questions:", error);
      toast({
        title: "Error",
        description: "Failed to fetch questions",
        variant: "destructive",
      });
    }
  };

  // Handle topic change
  const handleTopicChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTopic(event.target.value);
  };

  // Start the quiz after selecting a topic
  const startQuiz = () => {
    if (selectedTopic) {
      fetchQuestions(selectedTopic);
    } else {
      toast({
        title: "Select a topic",
        description: "Please select a quiz topic to start",
        variant: "destructive",
      });
    }
  };

  // Handle answer selection
  const handleAnswerSelection = (answer: string) => {
    const currentQuestion = questions[currentQuestionIndex];
    if (answer === currentQuestion.correct_answer) {
      setScore(score + 1);
    }

    // Move to the next question after answering
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setTimer(30); // reset timer for the next question
    } else {
      setIsQuizStarted(false);
      if (score === questions.length) {
        setIsWin(true);
      } else {
        setIsLose(true);
        setShake(true);
        setTimeout(() => setShake(false), 1000); // Stop the shake after 1 second
      }
    }
  };

  // Timer for each question
  useEffect(() => {
    if (timer > 0 && isQuizStarted) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer, isQuizStarted]);

  const retryQuiz = () => {
    fetchQuestions(selectedTopic);
    setIsLose(false);
  };

  const selectNewCategory = () => {
    setIsQuizStarted(false);
    setIsLose(false);
    setSelectedTopic("");
  };

  return (
    <div className="relative">
      {/* Confetti Overlay */}
      {isWin && <Confetti />}
      
      {/* Quiz Result Overlay */}
      {isLose && (
        <div
          className={classNames(
            "absolute inset-0 flex justify-center items-center text-4xl text-red-600",
            shake ? "animate-shake" : ""
          )}
        >
          <FaAngry className="mr-2" />
          <div>You Lose!</div>
          <div className="flex space-x-4 mt-4">
            <Button onClick={retryQuiz} className="w-full">
              Retry Quiz
            </Button>
            <Button onClick={selectNewCategory} className="w-full">
              Select New Category
            </Button>
          </div>
        </div>
      )}
      
      {!isQuizStarted ? (
        <div className="space-y-4 p-4">
          <label htmlFor="topic-select" className="block text-xl mb-2">Select a Quiz Topic</label>
          <select
            id="topic-select"
            value={selectedTopic}
            onChange={handleTopicChange}
            className="border rounded p-2 w-full"
          >
            <option value="" disabled>-- Select a Topic --</option>
            {topics.map((topic) => (
              <option key={topic.id} value={topic.id}>{topic.name}</option>
            ))}
          </select>
          <Button onClick={startQuiz} className="mt-4 w-full">Start Quiz</Button>
        </div>
      ) : (
        <div className="space-y-4 p-4">
          {/* Header with Score and Remaining Questions */}
          <div className="flex justify-between items-center mb-4">
            <p>Score: {score}</p>
            <p>{questions.length - currentQuestionIndex} Questions Left</p>
            <p>Time Remaining: {timer}s</p>
          </div>

          {/* Current Question */}
          <div>
            <h2 className="text-2xl mb-4">{decodedQuestion}</h2>
            <div className="space-y-2">
              {[...questions[currentQuestionIndex]?.incorrect_answers, questions[currentQuestionIndex]?.correct_answer]
                .sort()
                .map((answer, index) => (
                  <Button
                    key={index}
                    onClick={() => handleAnswerSelection(answer)}
                    className="w-full py-2"
                  >
                    {answer}
                  </Button>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizApp;
