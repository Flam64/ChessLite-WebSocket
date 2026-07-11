import type { FormButtonProps } from "@/types/FormButtonProps";

export default function FormButton({ onClick, disabled, children }: FormButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-3 py-1 rounded transition ${
        disabled ? "bg-gray-500 cursor-not-allowed opacity-50" : "bg-gray-700 hover:bg-gray-600"
      }`}
    >
      {children}
    </button>
  );
}
