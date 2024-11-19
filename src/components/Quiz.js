import React, { useState, useEffect } from "react";
import { Pagination, Box, Button, FormControl, InputLabel, Select, MenuItem, PaginationItem } from "@mui/material";
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
    restartQuiz();
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
    setRandomQuestions(getRandomQuestions(selectedNumberOfQuestions));
    setAnswers({});
    setCurrentQuestion(0);
    setShowScore(false);
  };

  const score = calculateScore();
  const incorrectQuestions = getIncorrectQuestions();

  return (
    <Box display="flex" flexDirection="column" gap={4} sx={{ mt: 4 }}>
        <Box display="flex" justifyContent="center" gap={2}>
            <FormControl sx={{ width: 150 }}>
                <InputLabel id="question-count-label">Questions</InputLabel>
                <Select
                labelId="question-count-label"
                value={selectedNumberOfQuestions}
                label="Questions"
                onChange={(e) => {
                    const n = e.target.value;
                    setSelectedNumberOfQuestions(n)
                    setRandomQuestions(getRandomQuestions(n))
                }}>
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

      {showScore &&
        <ScoreReport
          score={score}
          totalQuestions={randomQuestions.length}
          incorrectQuestions={incorrectQuestions}
          answers={answers}
          questions={questions}
          hide={() => setShowScore(false)}
        />}

        <QuestionCard
            question={randomQuestions[currentQuestion]}
            selectedAnswer={answers[randomQuestions[currentQuestion].question_id] || ""}
            handleAnswer={handleAnswer}
            finished={showScore}
        />

        <Box gap={1} display="flex" flexDirection="column" alignItems="center">
          <Pagination
              shape="rounded"
              variant="outlined"
              count={randomQuestions.length}
              page={currentQuestion + 1}
              onChange={handlePageChange}
              siblingCount={1}
              boundaryCount={1}
              renderItem={(item) => {
                const isAnswered = item.type === 'page' && answers[randomQuestions[item.page - 1]?.question_id];
                return (
                  <PaginationItem
                    {...item}
                    style={{
                      fontWeight: isAnswered ? "bold" : "normal",
                      backgroundColor: isAnswered || item.selected ? "#d1e7dd" : "inherit",
                    }}
                  />
                );
              }}
          />

          <Box display="flex" justifyContent="center" gap={2}>
              <Button
                  variant="contained"
                  color="warning"
                  onClick={restartQuiz}
              >
                  Restart Quiz
              </Button>
              <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => setShowScore(true)}
              >
                  Show Results
              </Button>
          </Box>
        </Box>
    </Box>
  );
};

export default Quiz;
