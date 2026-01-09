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
        px-6 py-2.5 rounded-xl font-semibold transition-all duration-200 transform
        active:scale-95 shadow-lg
        bg-gradient-to-r from-[#6C63FF] to-[#FF6B6B] text-white hover:from-[#5a52d5] hover:to-[#ff5252] hover:shadow-[#6C63FF]/30 hover:-translate-y-0.5
        ${className}
      `}
    >
      {children}
    </button>
  );
}
