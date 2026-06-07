const express = require("express");
const { spawn, exec } = require("child_process");

const app = express();

app.use(express.json({ limit: "5mb" }));

// Health check
app.get("/", (req, res) => {
  res.json({
    status: "working"
  });
});

// Check if Stockfish exists
app.get("/stockfish-check", (req, res) => {
  exec("which stockfish", (error, stdout, stderr) => {
    if (error) {
      return res.json({
        error: error.message,
        stdout,
        stderr
      });
    }

    res.json({
      stockfish_path: stdout.trim()
    });
  });
});

// Analyze position
app.post("/analyze", (req, res) => {
  const fen = req.body.fen;

  if (!fen) {
    return res.status(400).json({
      error: "FEN is required"
    });
  }

  const stockfish = spawn("stockfish");

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

    const bestMoveLine = output
      .split("\n")
      .find((line) => line.includes("bestmove"));

    res.json({
      fen,
      result: bestMoveLine || output
    });
  }, 3000);
});
app.get("/debug", (req, res) => {
  const fs = require("fs");

  res.json({
    cwd: process.cwd(),
    dockerfileExists: fs.existsSync("./Dockerfile"),
    nodeVersion: process.version,
    platform: process.platform
  });
});
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
