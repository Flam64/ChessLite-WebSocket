declare module "react-chessboard" {
  import { FC } from "react";

  type ChessboardProps = {
    boardPosition?: string;
    onPieceDrop?: (source: string, target: stringp, iece?: string) => boolean;
    customDarkSquareStyle?: React.CSSProperties;
    customLightSquareStyle?: React.CSSProperties;
    id?: string;
    className?: string;
  };

  export const Chessboard: FC<ChessboardProps>;
}
