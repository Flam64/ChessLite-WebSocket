// src/components/ChessBoard.tsx
import { useMemo, useCallback, useRef, useEffect } from "react";
import { Chessboard } from "react-chessboard";
import { useChessGame } from "../hooks/useChessGame";
import { Chess } from "chess.js";

export default function ChessBoard() {
  const {
    game,
    makeMove,
    moves,
    lastMove,
    currentMoveIndex,
    goToMove,
    nextMove,
    prevMove,
    goToStart,
    goToEnd,
    undoLastMove,
  } = useChessGame();

  const scrollRef = useRef<HTMLDivElement>(null);

  // Surbrillance du dernier coup
  const customSquareStyles = useMemo(() => {
    if (!lastMove) return {};
    return {
      [lastMove.from]: { backgroundColor: "rgba(255, 255, 0, 0.5)" },
      [lastMove.to]: { backgroundColor: "rgba(255, 255, 0, 0.5)" },
    };
  }, [lastMove]);

  // Déplacement d’une pièce
  const handlePieceDrop = useCallback(
    (sourceSquare: string, targetSquare: string) => {
      if (!targetSquare) return false;
      return makeMove(sourceSquare, targetSquare);
    },
    [makeMove]
  );

  // Regroupement des coups par tour (blanc + noir)
  const movesByTurn = useMemo(() => {
    type ChessMove = ReturnType<Chess["move"]>;

    const turns: { white: ChessMove; black?: ChessMove }[] = [];

    for (let i = 0; i < moves.length; i += 2) {
      turns.push({
        white: moves[i],
        black: moves[i + 1],
      });
    }
    return turns;
  }, [moves]);

  // Scroll auto vers le dernier coup
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [currentMoveIndex, movesByTurn]);

  return (
    <div className="flex justify-center items-start gap-6 p-6">
      <div className="w-[600px]">
        <Chessboard
          position={game.fen()}
          onPieceDrop={handlePieceDrop}
          arePiecesDraggable={true}
          boardOrientation="white"
          customDarkSquareStyle={{ backgroundColor: "#779952" }}
          customLightSquareStyle={{ backgroundColor: "#edeed1" }}
          customSquareStyles={customSquareStyles}
        />
      </div>

      {/* Historique et navigation */}
      <div className="w-72 shadow rounded p-4 h-[600px]  flex flex-col">
        {/* Boutons navigation */}
        <div className="flex gap-2 mb-4 justify-center">
          {/* Bouton annuler dernier coup */}
          <button
            onClick={undoLastMove}
            disabled={moves.length === 0}
            className={`px-3 py-1 rounded transition
    ${
      moves.length === 0
        ? "bg-gray-500 cursor-not-allowed opacity-50"
        : "bg-gray-700 hover:bg-gray-600"
    }`}
          >
            ↩
          </button>
          {/* Bouton aller au premier coup */}
          <button onClick={goToStart} className="px-3 py-1 rounded bg-gray-700 hover:bg-gray-600">
            ◀◀
          </button>
          {/* Bouton coup précédent */}
          <button onClick={prevMove} className="px-3 py-1 rounded bg-gray-700 hover:bg-gray-600">
            ◀
          </button>
          {/* Bouton coup suivant */}
          <button onClick={nextMove} className="px-3 py-1 rounded bg-gray-700 hover:bg-gray-600">
            ▶
          </button>
          {/* Bouton aller au dernier coup */}
          <button onClick={goToEnd} className="px-3 py-1 rounded bg-gray-700 hover:bg-gray-600">
            ▶▶
          </button>
        </div>

        {/* Liste des coups avec scroll */}
        <div className="overflow-y-auto rounded bg-gray-800 flex-1" ref={scrollRef}>
          <table className="table-fixed w-full border-collapse">
            <tbody>
              {movesByTurn.map((turn, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td className="cursor-pointer hover:bg-gray-600" onClick={() => goToMove(i * 2)}>
                    {turn.white.san}
                  </td>
                  <td
                    className="cursor-pointer hover:bg-gray-600"
                    onClick={() => turn.black && goToMove(i * 2 + 1)}
                  >
                    {turn.black?.san || ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
