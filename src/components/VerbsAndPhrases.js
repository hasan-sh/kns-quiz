import React, { useEffect, useState } from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Box,
  Grid
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const DataPath = `${process.env.PUBLIC_URL}/data/verbs_phrases.json`;

const VerbsAndPhrases = () => {
    const [data, setData] = useState({verbs: [], phrases: []});
    useEffect(() => {
        fetch(DataPath, { headers: { "Content-Type": "application/json" } })
        .then((res) => res.json())
        .then((data) => {
            setData(data)
        });
    }, []);

  return (
    <Box sx={{ padding: '16px' }}>
      {/* Verbs Section */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Common Verbs</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            {data.verbs.map((verb, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  {verb.text}
                </Typography>
                <Typography variant="body2">{verb.example}</Typography>
              </Grid>
            ))}
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Phrases Section */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Common Phrases</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            {data.phrases.map((phrase, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  {phrase.text}
                </Typography>
                <Typography variant="body2">{phrase.meaning}</Typography>
              </Grid>
            ))}
          </Grid>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default VerbsAndPhrases;
