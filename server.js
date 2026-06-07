const express = require("express");
const { spawn, exec } = require("child_process");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.json({ status: "working" });
});

app.get("/stockfish-check", (req, res) => {
  exec("which stockfish", (err, stdout, stderr) => {
    res.json({
      error: err ? err.message : null,
      stdout,
      stderr
    });
  });
});

app.post("/analyze", (req, res) => {
  const fen = req.body.fen;

  const stockfish = spawn("/usr/games/stockfish");

  let output = "";

  stockfish.stdout.on("data", data => {
    output += data.toString();
  });

  stockfish.stdin.write("uci\n");
  stockfish.stdin.write(`position fen ${fen}\n`);
  stockfish.stdin.write("go depth 15\n");

  setTimeout(() => {
    stockfish.stdin.write("quit\n");

    const bestMoveLine = output
      .split("\n")
      .find(line => line.includes("bestmove"));

    res.json({
      fen,
      result: bestMoveLine || output
    });
  }, 3000);
});
app.get("/find-stockfish", (req, res) => {
  const { exec } = require("child_process");

  exec("find / -name '*stockfish*' 2>/dev/null", (err, stdout) => {
    res.send(stdout);
  });
});
app.listen(process.env.PORT || 3000, () => {
  console.log("Server started");
});
