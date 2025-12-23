function Input({ value, onChange, placeholder, type = "text" }) {
  return (
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={onChange}
      className="
        w-full px-4 py-2.5 mb-5
        rounded-lg
        border-2 border-[#9684A1]
        bg-[#FFFBFA]
        text-[#03012C]
        placeholder:text-[#9684A1]
        focus:outline-none
        focus:border-[#E16F7C]
        focus:ring-2 focus:ring-[#E16F7C]/30
      "
    />
  );
}

export default Input;
