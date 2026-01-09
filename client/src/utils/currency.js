export const getCurrencySymbol = (code) => {
    switch (code) {
        case "INR": return "₹";
        case "USD": return "$";
        case "EUR": return "€";
        case "GBP": return "£";
        default: return code;
    }
};
