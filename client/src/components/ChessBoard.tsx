// src/components/ChessBoard.tsx

import { useMemo, useCallback, useRef, useEffect, useState } from "react";
import { Chessboard } from "react-chessboard";
import { useChessGame } from "../hooks/useChessGame";
import { Chess, Square, Move } from "chess.js";
import type React from "react";
import { buildCustomSquareStyles } from "../utils/chessStyles";

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

  type PossibleMove = {
    isCapture: boolean;
  };

  const scrollRef = useRef<HTMLDivElement>(null);
  const [isUndoing, setIsUndoing] = useState(false);
  const [possibleMoves, setPossibleMoves] = useState<Record<string, PossibleMove>>({});

  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);

  // déterminer les coups possibles lors du click sur un pièce
  const handleSquareClick = useCallback(
    (square: Square) => {
      const sq = square as Square;
      const piece = game.get(sq);

      // clique sur une case contenant la pièce du joueur -> sélection
      if (piece && piece.color === game.turn()) {
        if (sq === selectedSquare) {
          setSelectedSquare(null);
          setPossibleMoves({});
          return;
        }

        const moves = game.moves({ square: sq, verbose: true }) as Move[];
        if (moves.length === 0) {
          setSelectedSquare(null);
          setPossibleMoves({});
          return;
        }

        const nextPossibleMoves: Record<string, PossibleMove> = {};
        for (const m of moves) nextPossibleMoves[m.to] = { isCapture: !!m.captured };

        setSelectedSquare(sq);
        setPossibleMoves(nextPossibleMoves);
        return;
      }

      // Si on a déjà une sélection, tenter de jouer vers la case cliquée
      if (selectedSquare) {
        const from = selectedSquare as Square;
        const to = square as Square;

        // si clic en dehors de la selection des coups possibles, annuler la selection et l'affichage des coups possible pour cette pièce
        if (!possibleMoves[to]) {
          setSelectedSquare(null);
          setPossibleMoves({});
          return;
        }

        // coup valide -> le mouvement de la pièce à lieu
        makeMove(from, to);

        // nettoyer l'UI (si ok ou non, on réinitialise la sélection)
        setSelectedSquare(null);
        setPossibleMoves({});
        return;
      }

      // clic sur case vide sans sélection -> rien
    },
    [game, selectedSquare, makeMove]
  );

  // style à appliquer aux pièces : surbrillance du dernier coup, pièces pouvant être capturées...
  const customSquareStyles = useMemo(() => {
    return buildCustomSquareStyles(selectedSquare, possibleMoves, game);
  }, [selectedSquare, possibleMoves, game]);

  // Déplacement d’une pièce
  const handlePieceDrop = useCallback(
    (sourceSquare: string, targetSquare: string) => {
      if (!targetSquare) return false;

      const piece = game.get(sourceSquare as Square);

      if (!piece || piece.color !== game.turn()) return false;

      setPossibleMoves({});
      setSelectedSquare(null);

      return makeMove(sourceSquare as Square, targetSquare as Square);
    },
    [game, makeMove]
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

  // trouver la case du roi menacé
  function findKingSquare(game: Chess): string | null {
    const board = game.board();

    for (let rank = 0; rank < 8; rank++) {
      for (let file = 0; file < 8; file++) {
        const piece = board[rank][file];
        if (piece && piece.type === "k" && piece.color === game.turn()) {
          const fileChar = "abcdefgh"[file];
          const rankChar = (8 - rank).toString();
          return `${fileChar}${rankChar}`;
        }
      }
    }
    return null;
  }

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
                      onClick={() => goToMove(i * 2 + 1)} //rejouer les coups avec les blancs
                    >
                      {turn.white.san}
                    </td>
                    <td
                      className="cursor-pointer hover:bg-gray-600"
                      onClick={() => turn.black && goToMove(i * 2 + 2)} //rejouer les coups avec les noirs
                    >
                      {turn.black?.san || ""}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {game.isCheckmate() && (
          <div className="mb-2 text-red-500 font-bold text-center">
            ♚ Échec et mat — victoire des {game.turn() === "w" ? "Noirs" : "Blancs"}
          </div>
        )}

        {!game.isCheckmate() && game.isCheck() && (
          <div className="mb-2 text-yellow-400 font-semibold text-center">⚠ Échec</div>
        )}
      </div>
    </div>
  );
}
