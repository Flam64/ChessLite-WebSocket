import { useState } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";

export default function ChessBoard() {
  const [game, setGame] = useState(new Chess());

  const handlePieceDrop = ({
    sourceSquare,
    targetSquare,
    piece,
  }: {
    sourceSquare: string;
    targetSquare: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    piece: any;
  }) => {
    console.log("Pièce déplacée :", sourceSquare, "->", targetSquare, piece);

    if (!targetSquare) return false;

    const newGame = new Chess(game.fen());
    const move = newGame.move({ from: sourceSquare, to: targetSquare, promotion: "q" });

    if (!move) {
      console.log("Coup invalide !");
      return false;
    }

    setGame(newGame);
    return true;
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const chessboardOptions: any = {
    position: game.fen(),
    onPieceDrop: handlePieceDrop,
    arePiecesDraggable: true,
    boardOrientation: "white",
    customDarkSquareStyle: { backgroundColor: "#779952" },
    customLightSquareStyle: { backgroundColor: "#edeed1" },
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-600">
      {/* Plateau responsive : largeur max 400px, centré */}
      <div className="w-full max-w-[600px] mx-auto">
        <Chessboard options={chessboardOptions} />
      </div>
    </div>
  );
}
