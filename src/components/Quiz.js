import React, { useState, useEffect } from "react";
import { Pagination, Box, Button, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import questions from "../data/questions.json";
import QuestionCard from "./QuestionCard";
import ScoreReport from "./ScoreReport";

const Quiz = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showScore, setShowScore] = useState(false);
  const [selectedNumberOfQuestions, setSelectedNumberOfQuestions] = useState(23);
  const [randomizeQuestions, setRandomizeQuestions] = useState(1);

  // Shuffle questions and pick a random subset
  const getRandomQuestions = (num) => {
    const shuffled = randomizeQuestions ? [...questions].sort(() => 0.5 - Math.random()) : questions;
    return shuffled.slice(0, num);
  };

  const [randomQuestions, setRandomQuestions] = useState(getRandomQuestions(selectedNumberOfQuestions));

  useEffect(() => {
    setRandomQuestions(getRandomQuestions(selectedNumberOfQuestions));
    setCurrentQuestion(0);  // Reset to the first question whenever the number of questions changes
    setAnswers({});
    setShowScore(false);
  }, [selectedNumberOfQuestions, randomizeQuestions]);


  // Calculate the score dynamically
  const calculateScore = () => {
    return Object.entries(answers).reduce((score, [key, value]) => {
      const question = randomQuestions.find((q) => q.question_id === key);
      return question?.correct_answer === value ? score + 1 : score;
    }, 0);
  };

  // Generate a report of incorrect answers
  const getIncorrectQuestions = () => {
    return Object.entries(answers)
      .filter(([key, value]) => {
        const question = randomQuestions.find((q) => q.question_id === key);
        return question?.correct_answer !== value;
      })
      .map(([key]) => {
        return randomQuestions.find((q) => q.question_id === key);
      });
  };

  const handleAnswer = (selectedAnswer) => {
    setAnswers((prev) => ({
      ...prev,
      [randomQuestions[currentQuestion].question_id]: selectedAnswer,
    }));

    // Automatically advance to the next question
    const nextQuestion = currentQuestion + 1;
    if (nextQuestion < randomQuestions.length) {
      setCurrentQuestion(nextQuestion);
    } else {
      setShowScore(true); // End quiz if it was the last question
    }
  };

  const handlePageChange = (event, page) => {
    setCurrentQuestion(page - 1);
  };

  const restartQuiz = () => {
    setAnswers({});
    setCurrentQuestion(0);
    setShowScore(false);
  };

  const score = calculateScore();
  const incorrectQuestions = getIncorrectQuestions();

  return (
    <Box sx={{ mt: 4 }}>
        <Box display="flex" justifyContent="center" gap={4} mb={4}>
            <FormControl sx={{ width: 150 }}>
                <InputLabel id="question-count-label">Questions</InputLabel>
                <Select
                labelId="question-count-label"
                value={selectedNumberOfQuestions}
                label="Questions"
                onChange={(e) => setSelectedNumberOfQuestions(e.target.value)}
                >
                {[5, 10, 15, 20, 23, ...Array.from({ length: questions.length - 23 }, (_, i) => i + 24)].map((num) => (
                    <MenuItem key={num} value={num}>
                    {num}
                    </MenuItem>
                ))}
                </Select>
            </FormControl>
            <FormControl sx={{ width: 150 }}>
                <InputLabel id="random-questions">Randomized?</InputLabel>
                <Select
                    labelId="random-questions"
                    value={randomizeQuestions}
                    label="Questions"
                    onChange={(e) => setRandomizeQuestions(e.target.value)}
                    >
                <MenuItem value={0}>Ordered</MenuItem>
                <MenuItem value={1}>Random</MenuItem>
                </Select>
            </FormControl>
        </Box>

      {showScore ? (
        <ScoreReport
          score={score}
          totalQuestions={randomQuestions.length}
          incorrectQuestions={incorrectQuestions}
          answers={answers}
          questions={questions}
          restartQuiz={restartQuiz}
        />
      ) : (
        <>
          <QuestionCard
            question={randomQuestions[currentQuestion]}
            selectedAnswer={answers[randomQuestions[currentQuestion].question_id] || ""}
            handleAnswer={handleAnswer}
          />
          <Box mt={4} display="flex" justifyContent="center">
            <Pagination
              count={randomQuestions.length}
              page={currentQuestion + 1}
              onChange={handlePageChange}
              color="primary"
              siblingCount={1}
              boundaryCount={1}
            />
          </Box>
          <Box mt={2} textAlign="center">
            <Button
              variant="contained"
              color="secondary"
              onClick={() => setShowScore(true)}
            >
              Finish Quiz
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
};

export default Quiz;
