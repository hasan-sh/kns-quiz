import React from "react";
import { Box, Typography, Button } from "@mui/material";
import Grid from '@mui/material/Grid';

const MainImagesPath = `${process.env.PUBLIC_URL}/kns_fotos`;


const QuestionCard = ({ question, handleAnswer, selectedAnswer }) => {
  const imagePath = `${MainImagesPath}/${question.question_id}.jpeg`;

  
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        mt: 3,
        p: 2,
        border: "1px solid #ccc",
        borderRadius: "8px",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
      }}
    >
      {/* Image */}
      <Box
        component="img"
        src={imagePath}
        alt={question.question_text}
        sx={{
          width: "100%",
          maxWidth: 400,
          height: "auto",
          objectFit: "contain",
          mb: 3,
        }}
      />

      {/* Question Text */}
      <Typography variant="h5" gutterBottom align="center">
        {question.question_text}
      </Typography>

      {/* Answer Buttons */}
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Button
            sx={{textTransform : "none"}}
            variant={selectedAnswer === "A" ? "contained" : "outlined"}
            color="primary"
            fullWidth
            onClick={() => handleAnswer("A")}
          >
            {question.answer_a}
          </Button>
        </Grid>
        <Grid item xs={6}>
          <Button
            sx={{textTransform : "none"}}
            variant={selectedAnswer === "B" ? "contained" : "outlined"}
            color="secondary"
            fullWidth
            onClick={() => handleAnswer("B")}
          >
            {question.answer_b}
          </Button>
        </Grid>
      </Grid>
    </Box>
    );
};

export default QuestionCard;
