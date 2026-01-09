export default function Card({ children, className = "" }) {
  return (
    <div className={`bg-[#FFFBFA] rounded-2xl shadow-lg p-6 sm:p-10 w-full max-w-md md:max-w-lg mx-auto text-[#03012C] ${className}`}>
      {children}
    </div>
  );
}
