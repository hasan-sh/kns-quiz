import React from "react";
import { Box, Typography, Button, CardContent, Card, CardActions } from "@mui/material";
import Grid from '@mui/material/Grid2';

const MainImagesPath = `${process.env.PUBLIC_URL}/kns_fotos`;


const KnsCard = ({ question, handleAnswer, selectedAnswer, finished }) => {
  const imagePath = `${MainImagesPath}/${question.question_id}.jpeg`;
  return (
    <Grid xs={12} sm={6} md={4}>
      <Card>
        <Box
          component="img"
          src={imagePath}
          alt={question.question_text}
          sx={{
            width: "100%",
            height: 200,
            objectFit: "contain",
          }}
        />
        <CardContent>
          <Typography variant="h6" gutterBottom align="center">
            {question.question_text}
          </Typography>
        </CardContent>
        <CardActions>
          <Grid container spacing={2}>
            <Grid xs={6}>
              <Button
                sx={{ textTransform: "none" }}
                variant={selectedAnswer === "A" ? "contained" : "outlined"}
                color="primary"
                fullWidth
                disabled={finished}
                onClick={() => handleAnswer("A")}
              >
                {question.answer_a}
              </Button>
            </Grid>
            <Grid xs={6}>
              <Button
                sx={{ textTransform: "none" }}
                variant={selectedAnswer === "B" ? "contained" : "outlined"}
                color="secondary"
                fullWidth
                disabled={finished}
                onClick={() => handleAnswer("B")}
              >
                {question.answer_b}
              </Button>
            </Grid>
          </Grid>
        </CardActions>
      </Card>
    </Grid>
  );
};

export default KnsCard;
