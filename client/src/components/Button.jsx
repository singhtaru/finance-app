export default function Button({
  children,
  onClick,
  type = "button",
  className = "",
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`
        px-4 py-2 rounded-lg font-medium transition
        bg-[#9684A1] text-[#FFFBFA]
        hover:bg-[#7B628E]
        ${className}
      `}
    >
      {children}
    </button>
  );
}
