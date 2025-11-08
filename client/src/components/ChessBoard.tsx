import { useState } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";

export default function ChessBoard() {
  const [game, setGame] = useState(new Chess());

  const onDrop = (source: string, target: string, piece?: string) => {
    console.info("Piece deplacee", source, target, piece);

    const move = game.move({ from: source, to: target, promotion: "q" });
    if (!move) return false;

    setGame(new Chess(game.fen()));
    return true;
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <Chessboard
        boardPosition={game.fen()}
        onPieceDrop={(from, to, piece) => onDrop(from, to, piece)}
      />
    </div>
  );
}
