const express = require("express");
const { spawn } = require("child_process");

const app = express();

app.use(express.json({ limit: "5mb" }));

// Health Check
app.get("/", (req, res) => {
  res.json({
    status: "working",
    message: "Stockfish API is running"
  });
});

// Analyze Chess Position
app.post("/analyze", (req, res) => {
  const fen = req.body.fen;

  if (!fen) {
    return res.status(400).json({
      error: "FEN is required"
    });
  }

  // IMPORTANT: Use full Stockfish path found on Railway
  const stockfish = spawn("/usr/games/stockfish");

  let output = "";

  stockfish.stdout.on("data", (data) => {
    output += data.toString();
  });

  stockfish.stderr.on("data", (data) => {
    console.error(data.toString());
  });

  stockfish.on("error", (err) => {
    console.error(err);

    return res.status(500).json({
      error: err.message
    });
  });

  stockfish.stdin.write("uci\n");
  stockfish.stdin.write(`position fen ${fen}\n`);
  stockfish.stdin.write("go depth 15\n");

setTimeout(() => {
  stockfish.stdin.write("quit\n");

  const lines = output.split("\n");

  const bestMoveLine = lines.find(line =>
    line.startsWith("bestmove")
  );

  const bestMove = bestMoveLine
    ? bestMoveLine.split(" ")[1]
    : null;

  res.json({
    fen,
    bestMove
  });
}, 3000);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
