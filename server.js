const express = require("express");
const { spawn } = require("child_process");

const app = express();

app.use(express.json({ limit: "5mb" }));

app.post("/analyze", async (req, res) => {
  const fen = req.body.fen;

  const stockfish = spawn("stockfish");

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
app.get("/", (req, res) => {
  res.send("Stockfish API running");
});
app.listen(process.env.PORT || 3000);
