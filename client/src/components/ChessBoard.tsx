import { Chessboard } from "react-chessboard";
import { useChessGame } from "../hooks/useChessGame";

export default function ChessBoard() {
  const { game, makeMove } = useChessGame();

  const handlePieceDrop = ({
    sourceSquare,
    targetSquare,
  }: {
    sourceSquare: string;
    targetSquare: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    piece: any;
  }) => {
    if (!targetSquare) return false;

    const valid = makeMove(sourceSquare, targetSquare);
    return valid;
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
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="w-full max-w-[500px] mx-auto">
        <Chessboard options={chessboardOptions} />
      </div>
    </div>
  );
}
