interface RupeeSymbolProps {
    size?: number;
    className?: string;
}

const RupeeSymbol = ({ size = 20, className = '' }: RupeeSymbolProps) => (
    <span
        className={`inline-flex align-middle mr-1 ${className}`}
        style={{ fontSize: `${size}px`, lineHeight: 1 }}
    >
        ₹
    </span>
);

export default RupeeSymbol;
