import { useMemo } from 'react';

// Inline SVG QR-code placeholder. This is a decorative stand-in only — it does
// not encode `payload` into a scannable code — for use until a real ticketing/
// QR-generation backend exists. (No existing "Car Rentals" inline-SVG-placeholder
// component to copy from; the codebase's closest analog, `turbo/utils/getVehicleImage.ts`,
// is a static image lookup rather than inline SVG, so this is a small new component.)
type MetroQrPlaceholderProps = {
    payload: string;
    size?: number;
};

const GRID_SIZE = 11;

export default function MetroQrPlaceholder({ payload, size = 180 }: MetroQrPlaceholderProps) {
    const cellSize = size / GRID_SIZE;

    // Deterministic pseudo-random cell pattern seeded from the ticket payload,
    // so each ticket's placeholder looks a little different without any real encoding.
    const filledCells = useMemo(() => {
        let seed = 0;
        for (let i = 0; i < payload.length; i += 1) {
            seed = (seed * 31 + payload.charCodeAt(i)) % 100000;
        }
        const cells: boolean[] = [];
        for (let i = 0; i < GRID_SIZE * GRID_SIZE; i += 1) {
            seed = (seed * 9301 + 49297) % 233280;
            cells.push(seed / 233280 > 0.55);
        }
        return cells;
    }, [payload]);

    // Standard QR-style corner finder markers, always filled, for visual authenticity.
    const isCornerMarker = (row: number, col: number) => {
        const inCorner = (r: number, c: number) => r < 3 && c < 3;
        return (
            inCorner(row, col) ||
            inCorner(row, GRID_SIZE - 1 - col) ||
            inCorner(GRID_SIZE - 1 - row, col)
        );
    };

    return (
        <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            role="img"
            aria-label="Placeholder QR code"
        >
            <rect x={0} y={0} width={size} height={size} fill="white" />
            {Array.from({ length: GRID_SIZE }).map((_, row) =>
                Array.from({ length: GRID_SIZE }).map((__, col) => {
                    const filled = isCornerMarker(row, col) || filledCells[row * GRID_SIZE + col];
                    if (!filled) return null;
                    return (
                        <rect
                            key={`${row}-${col}`}
                            x={col * cellSize}
                            y={row * cellSize}
                            width={cellSize}
                            height={cellSize}
                            fill="#101010"
                        />
                    );
                })
            )}
        </svg>
    );
}
