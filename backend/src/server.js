import express from 'express';

const app = express();
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'HMS Backend' });
});

app.listen(3000, () => {
  console.log('Backend running on http://localhost:3000');
});
