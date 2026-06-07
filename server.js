const express = require("express");
const { spawn } = require("child_process");

const app = express();

app.use(express.json({ limit: "5mb" }));

app.post("/analyze", async (req, res) => {
  const fen = req.body.fen;

  const stockfish = spawn("stockfish");

stockfish.on("error", (err) => {
  console.error("Stockfish error:", err);
});

  let output = "";

  stockfish.stdout.on("data", (data) => {
    output += data.toString();
  });

  stockfish.stdin.write("uci\n");
  stockfish.stdin.write(`position fen ${fen}\n`);
  stockfish.stdin.write("go depth 15\n");

  setTimeout(() => {
    stockfish.stdin.write("quit\n");

    const lines = output.split("\n");
    const bestMoveLine = lines.find(line =>
      line.includes("bestmove")
    );

    res.json({
      fen,
      result: bestMoveLine || output
    });
  }, 3000);
});
app.get("/test", (req, res) => {
  res.json({ status: "working" });
});
app.get("/analyze-test", async (req, res) => {
  const stockfish = spawn("stockfish");

  let output = "";

  stockfish.stdout.on("data", (data) => {
    output += data.toString();
  });

  stockfish.stdin.write("uci\n");
  stockfish.stdin.write(
    "position fen rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1\n"
  );
  stockfish.stdin.write("go depth 10\n");

  setTimeout(() => {
    stockfish.stdin.write("quit\n");
    res.send(output);
  }, 3000);
});
app.listen(process.env.PORT || 3000);
