// src/components/ChessBoard.tsx
import { useMemo, useCallback, useRef, useEffect, useState } from "react";
import { Chessboard } from "react-chessboard";
import { useChessGame } from "../hooks/useChessGame";
import { Chess, Square, Move } from "chess.js";
import type React from "react";

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
  const [isUndoing, setIsUndoing] = useState(false);
  const [possibleMoves, setPossibleMoves] = useState<Record<string, React.CSSProperties>>({});
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);

  // déterminer les coups possible lors du click sur un pièce (case)
  const handleSquareClick = useCallback(
    (square: Square) => {
      //ignorer un pièce adverse
      const piece = game.get(square);
      if (!piece || piece.color !== game.turn()) {
        setSelectedSquare(null);
        setPossibleMoves({});
        return;
      }

      if (square === selectedSquare) {
        setSelectedSquare(null);
        setPossibleMoves({});
        return;
      }

      // Coups légaux depuis cette case
      const moves = game.moves({ square, verbose: true }) as Move[];

      // Pas de coups → on ne fait rien
      if (moves.length === 0) {
        setSelectedSquare(null);
        setPossibleMoves({});
        return;
      }

      //const highlights: Record<string, any> = {};
      const highlights: Record<string, React.CSSProperties> = {};

      moves.forEach((move) => {
        highlights[move.to] = {
          background: move.captured
            ? "radial-gradient(circle, rgba(253, 0, 0, 0.6) 70%, transparent 75%)"
            : "radial-gradient(circle, rgba(239, 140, 2, 0.85) 10%, transparent 15%)",
        };
      });

      // Highlight de la case sélectionnée
      highlights[square] = {
        backgroundColor: "rgba(255, 255, 0, 0.4)",
      };

      setSelectedSquare(square);
      setPossibleMoves(highlights);
    },
    [game, selectedSquare]
  );

  // Surbrillance du dernier coup
  const customSquareStyles = useMemo(() => {
    const styles: Record<string, React.CSSProperties> = {
      ...possibleMoves,
    };

    if (lastMove) {
      styles[lastMove.from] = {
        backgroundColor: "rgba(255, 255, 0, 0.5)",
      };
      styles[lastMove.to] = {
        backgroundColor: "rgba(255, 255, 0, 0.5)",
      };
    }

    return styles;
  }, [possibleMoves, lastMove]);

  // Déplacement d’une pièce
  const handlePieceDrop = useCallback(
    (sourceSquare: string, targetSquare: string) => {
      if (!targetSquare) return false;
      setPossibleMoves({});
      setSelectedSquare(null);

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
          onSquareClick={handleSquareClick}
        />
      </div>

      {/* Historique et navigation */}
      <div className="w-72 shadow rounded p-4 h-[600px]  flex flex-col">
        {/* Boutons navigation */}
        <div className="flex gap-2 mb-4 justify-center">
          {/* Bouton annuler dernier coup */}
          <button
            onClick={() => {
              if (moves.length === 0) return;

              setIsUndoing(true);

              setTimeout(() => {
                undoLastMove();
                setIsUndoing(false);
              }, 200);
            }}
            disabled={moves.length === 0 || isUndoing}
            className={`px-3 py-1 rounded transition
    ${
      moves.length === 0 || isUndoing
        ? "bg-gray-500 cursor-not-allowed opacity-50"
        : "bg-gray-700 hover:bg-gray-600"
    }`}
          >
            ↩
          </button>

          {/* Bouton aller au premier coup */}
          <button
            onClick={goToStart}
            disabled={moves.length === 0 || currentMoveIndex === 0}
            className={`px-3 py-1 rounded bg-gray-700 hover:bg-gray-600
            ${
              moves.length === 0 || currentMoveIndex === 0
                ? "bg-gray-500 cursor-not-allowed opacity-50"
                : "bg-gray-700 hover:bg-gray-600"
            }`}
          >
            ◀◀
          </button>
          {/* Bouton coup précédent */}
          <button
            onClick={prevMove}
            disabled={moves.length === 0 || currentMoveIndex === 0}
            className={`px-3 py-1 rounded bg-gray-700 hover:bg-gray-600
            ${
              moves.length === 0 || currentMoveIndex === 0
                ? "bg-gray-500 cursor-not-allowed opacity-50"
                : "bg-gray-700 hover:bg-gray-600"
            }`}
          >
            ◀
          </button>
          {/* Bouton coup suivant */}
          <button
            onClick={nextMove}
            disabled={moves.length === 0 || currentMoveIndex === moves.length}
            className={`px-3 py-1 rounded bg-gray-700 hover:bg-gray-600
            ${
              moves.length === 0 || currentMoveIndex === moves.length
                ? "bg-gray-500 cursor-not-allowed opacity-50"
                : "bg-gray-700 hover:bg-gray-600"
            }`}
          >
            ▶
          </button>
          {/* Bouton aller au dernier coup */}
          <button
            onClick={goToEnd}
            disabled={moves.length === 0 || currentMoveIndex === moves.length}
            className={`px-3 py-1 rounded bg-gray-700 hover:bg-gray-600
            ${
              moves.length === 0 || currentMoveIndex === moves.length
                ? "bg-gray-500 cursor-not-allowed opacity-50"
                : "bg-gray-700 hover:bg-gray-600"
            }`}
          >
            ▶▶
          </button>
        </div>

        {/* Liste des coups avec scroll */}
        <div className="overflow-y-auto rounded bg-gray-800 flex-1" ref={scrollRef}>
          <table className="table-fixed w-full border-collapse">
            <tbody>
              {movesByTurn.map((turn, i) => {
                const isLastRow = i === movesByTurn.length - 1;

                return (
                  <tr
                    key={i}
                    className={`transition-all duration-200 ease-out
        ${isUndoing && isLastRow ? "opacity-0 translate-x-4" : "opacity-100 translate-x-0"}`}
                  >
                    <td>{i + 1}</td>
                    <td
                      className="cursor-pointer hover:bg-gray-600"
                      onClick={() => goToMove(i * 2)}
                    >
                      {turn.white.san}
                    </td>
                    <td
                      className="cursor-pointer hover:bg-gray-600"
                      onClick={() => turn.black && goToMove(i * 2 + 1)}
                    >
                      {turn.black?.san || ""}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
