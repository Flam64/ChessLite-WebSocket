import { useEffect, useMemo, useRef, useState } from "react";
import { Chess, Move } from "chess.js";

import type { GameHistoryPanelProps } from "@/types/GameHistoryPanelProps";
import FormButton from "@/components/forms/FormButton";
import {
  IoCaretBackSharp,
  IoCaretForwardSharp,
  IoPlaySkipBackSharp,
  IoPlaySkipForwardSharp,
} from "react-icons/io5";
import { IoMdUndo } from "react-icons/io";

export default function GameHistoryPanel({
  moves,
  currentMoveIndex,
  game,
  goToMove,
  nextMove,
  prevMove,
  goToStart,
  goToEnd,
  undoLastMove,
  selectedMove,
}: GameHistoryPanelProps) {
  const [isUndoing, setIsUndoing] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

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
    <>
      {/* Historique et navigation */}
      <div className="w-96 shadow rounded p-4 h-[600px]  flex flex-col">
        {/* Boutons navigation */}
        <div className="flex gap-2 mb-4 justify-center">
          {/* Bouton annuler dernier coup */}
          <FormButton
            onClick={() => {
              if (moves.length === 0) return;
              setIsUndoing(true);
              setTimeout(() => {
                undoLastMove();
                setIsUndoing(false);
              }, 200);
            }}
            disabled={moves.length === 0 || isUndoing}
          >
            <IoMdUndo size={28} />
          </FormButton>

          {/* Bouton aller au premier coup */}
          <FormButton onClick={goToStart} disabled={moves.length === 0 || currentMoveIndex === 0}>
            <IoPlaySkipBackSharp size={28} />
          </FormButton>

          {/* Bouton coup précédent */}
          <FormButton onClick={prevMove} disabled={moves.length === 0 || currentMoveIndex === 0}>
            <IoCaretBackSharp size={28} />
          </FormButton>

          {/* Bouton coup suivant */}
          <FormButton
            onClick={nextMove}
            disabled={moves.length === 0 || currentMoveIndex === moves.length}
          >
            <IoCaretForwardSharp size={28} />
          </FormButton>
          {/* Bouton aller au dernier coup */}
          <FormButton
            onClick={goToEnd}
            disabled={moves.length === 0 || currentMoveIndex === moves.length}
          >
            <IoPlaySkipForwardSharp size={28} />
          </FormButton>
        </div>

        {/* Liste des coups avec scroll */}
        <div className="overflow-y-auto rounded bg-gray-800 flex-1" ref={scrollRef}>
          <table className="table-fixed w-full border-collapse">
            <tbody>
              {movesByTurn.map((turn, i) => {
                const isLastRow = i === movesByTurn.length - 1;

                // mise en surbrillance du coup séléctionné
                const isSelected = currentMoveIndex === i * 2 + 1 || currentMoveIndex === i * 2 + 2;
                return (
                  <tr
                    key={i}
                    className={`transition-all duration-200 ease-out
        ${isUndoing && isLastRow ? "opacity-0 translate-x-4" : "opacity-100 translate-x-0"}`}
                  >
                    <td className="text-center">{i + 1}</td>
                    <td
                      className={`cursor-pointer hover:bg-gray-600 ${
                        currentMoveIndex === i * 2 + 1 ? "bg-blue-700" : ""
                      }`}
                      onClick={() => goToMove(i * 2 + 1)} //rejouer les coups avec les blancs
                    >
                      {turn.white.san}
                    </td>
                    <td
                      className={`cursor-pointer hover:bg-gray-600 ${
                        currentMoveIndex === i * 2 + 2 ? "bg-blue-700" : ""
                      }`}
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
    </>
  );
}
