import { useState } from 'react';
import { BRAZIL_STATES } from '../../types';
import Brazil from '@svg-maps/brazil';

interface BrazilMapProps {
    selectedState: string | null;
    statesWithCandidates: string[];
    candidateCount: (uf: string) => number;
    onStateClick: (uf: string) => void;
    primaryColor: string;
    mapColorEmpty: string;
    mapColorFilled: string;
    mapColorHover: string;
}

export default function BrazilMap({
    selectedState,
    statesWithCandidates,
    candidateCount,
    onStateClick,
    primaryColor,
    mapColorEmpty,
    mapColorFilled,
    mapColorHover,
}: BrazilMapProps) {
    const [hoveredState, setHoveredState] = useState<string | null>(null);
    const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

    const handleMouseMove = (e: React.MouseEvent) => {
        setTooltipPos({ x: e.clientX, y: e.clientY });
    };

    const getStateFill = (uf: string) => {
        if (selectedState === uf) return primaryColor;
        if (!statesWithCandidates.includes(uf)) return mapColorEmpty;
        return mapColorFilled;
    };

    const getStateInfo = (uf: string) => {
        const ufUpper = uf.toUpperCase();
        const state = BRAZIL_STATES.find((s) => s.uf === ufUpper);
        const count = candidateCount(ufUpper);
        return {
            name: state?.name || ufUpper,
            count,
            hasCandidates: count > 0,
        };
    };

    return (
        <div className="relative w-full max-w-4xl mx-auto px-4">
            <svg
                viewBox={Brazil.viewBox}
                className="w-full h-auto max-h-[70vh] mx-auto"
                role="img"
                aria-label="Mapa do Brasil interativo"
                onMouseMove={handleMouseMove}
                preserveAspectRatio="xMidYMid meet"
            >
                <title>Mapa do Brasil</title>

                {Brazil.locations.map((location) => {
                    const uf = location.id;
                    const ufUpper = uf.toUpperCase();
                    const info = getStateInfo(uf);
                    const hasCandidates = info.hasCandidates;

                    return (
                        <path
                            key={uf}
                            d={location.path}
                            fill={getStateFill(ufUpper)}
                            stroke="#ffffff"
                            strokeWidth={selectedState === ufUpper ? 2 : 1}
                            className={`transition-all duration-150 ${hasCandidates ? 'cursor-pointer' : 'cursor-default'
                                }`}
                            style={{
                                fill: hoveredState === uf && hasCandidates ? mapColorHover : getStateFill(ufUpper),
                            }}
                            onClick={() => hasCandidates && onStateClick(ufUpper)}
                            onMouseEnter={() => setHoveredState(uf)}
                            onMouseLeave={() => setHoveredState(null)}
                            role={hasCandidates ? 'button' : undefined}
                            tabIndex={hasCandidates ? 0 : undefined}
                            aria-label={
                                hasCandidates
                                    ? `Ver candidatos de ${info.name}`
                                    : `${info.name} — sem candidatos cadastrados`
                            }
                            onKeyDown={(e) => {
                                if (hasCandidates && (e.key === 'Enter' || e.key === ' ')) {
                                    e.preventDefault();
                                    onStateClick(ufUpper);
                                }
                            }}
                        />
                    );
                })}
            </svg>

            {/* Tooltip */}
            {hoveredState && (
                <div
                    className="fixed z-50 pointer-events-none bg-gray-900 text-white px-3 py-2 rounded-lg shadow-lg text-sm"
                    style={{
                        left: tooltipPos.x + 10,
                        top: tooltipPos.y + 10,
                    }}
                >
                    {(() => {
                        const info = getStateInfo(hoveredState);
                        return (
                            <>
                                <div className="font-semibold">
                                    {info.name} ({hoveredState.toUpperCase()})
                                </div>
                                <div className="text-xs text-gray-300">
                                    {info.count > 0
                                        ? `${info.count} candidato${info.count > 1 ? 's' : ''} cadastrado${info.count > 1 ? 's' : ''}`
                                        : 'Nenhum candidato ainda'}
                                </div>
                            </>
                        );
                    })()}
                </div>
            )}
        </div>
    );
}
