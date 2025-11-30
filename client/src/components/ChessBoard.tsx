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

  type PossibleMove = {
    isCapture: boolean;
  };

  const scrollRef = useRef<HTMLDivElement>(null);
  const [isUndoing, setIsUndoing] = useState(false);
  const [possibleMoves, setPossibleMoves] = useState<Record<string, PossibleMove>>({});

  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);

  // déterminer les coups possible lors du click sur un pièce (case)
  const handleSquareClick = useCallback(
    (square: Square) => {
      const sq = square as Square;
      const piece = game.get(sq);

      // Si on clique sur une case contenant la pièce du joueur -> sélectionner
      if (piece && piece.color === game.turn()) {
        // toggle selection
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

        // sicase non valide
        if (!possibleMoves[to]) {
          setSelectedSquare(null);
          setPossibleMoves({});
          return;
        }

        // coup valide
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
    const styles: Record<string, React.CSSProperties> = {};

    // pièce sélectionnée
    if (selectedSquare) {
      styles[selectedSquare] = {
        backgroundColor: "rgba(255, 255, 0, 0.4)",
      };
    }

    // coups possibles
    for (const [square, move] of Object.entries(possibleMoves)) {
      if (move.isCapture) {
        styles[square] = {
          boxShadow: "inset 0 0 0 2px rgba(200, 0, 0, 0.8)",
          //  "radial-gradient(circle, transparent 60%, rgba(253, 0, 0, 0.6) 80%, transparent 85%)",
        };
      } else {
        styles[square] = {
          background: "radial-gradient(circle, rgba(239, 140, 2, 0.85) 10%, transparent 15%)",
        };
      }
    }

    // dernier coup
    if (lastMove) {
      styles[lastMove.from] = {
        backgroundColor: "rgba(255, 255, 0, 0.5)",
      };
      styles[lastMove.to] = {
        backgroundColor: "rgba(255, 255, 0, 0.5)",
      };
    }

    // highlight du roi en echec
    // échec / échec et mat
    if (game.isCheck()) {
      const kingSquare = findKingSquare(game);
      if (kingSquare) {
        styles[kingSquare] = {
          backgroundColor: game.isCheckmate()
            ? "rgba(200, 0, 0, 0.75)" // MAT = rouge foncé
            : "rgba(255, 0, 0, 0.45)", // ÉCHEC = rouge clair
        };
      }
    }

    return styles;
  }, [selectedSquare, possibleMoves, lastMove]);

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
        {game.isCheckmate() && (
          <div className="mb-2 text-red-500 font-bold text-center">
            ♚ Échec et mat — {game.turn() === "w" ? "Noirs" : "Blancs"} gagnent
          </div>
        )}

        {!game.isCheckmate() && game.isCheck() && (
          <div className="mb-2 text-yellow-400 font-semibold text-center">⚠ Échec</div>
        )}
      </div>
    </div>
  );
}
