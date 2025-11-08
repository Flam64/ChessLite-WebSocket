import { useState } from "react";
import { Chess, Move } from "chess.js";

export function useChessGame() {
  const [game, setGame] = useState(new Chess());

  const makeMove = (from: string, to: string) => {
    const newGame = new Chess(game.fen());
    const move = newGame.move({ from, to, promotion: "q" });
    if (move === null) return false;
    setGame(newGame);
    return true;
  };

  return { game, makeMove };
}
