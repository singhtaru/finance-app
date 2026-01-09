function Input({ value, onChange, placeholder, type = "text", className = "" }) {
  return (
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={onChange}
      className={`
        w-full px-4 py-2.5 mb-4
        rounded-xl
        bg-[#F0F2F5]
        text-[#03012C]
        placeholder:text-gray-400
        border-none
        focus:outline-none
        focus:ring-2 focus:ring-[#FF6B6B]/30
        transition-all duration-200
        ${className}
      `}
    />
  );
}

export default Input;
