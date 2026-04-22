import { useState } from 'react';
import { Candidate } from '../../types';
import { Instagram, Facebook, Twitter, Youtube, Linkedin, Globe, Share2, Copy, Check } from 'lucide-react';

interface CandidateCardProps {
    candidate: Candidate;
    primaryColor: string;
    isHighlighted?: boolean;
}

// TikTok icon (not in lucide-react)
const TikTokIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
    </svg>
);

// WhatsApp icon
const WhatsAppIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
);

export default function CandidateCard({ candidate, primaryColor, isHighlighted }: CandidateCardProps) {
    const [showFullDescription, setShowFullDescription] = useState(false);
    const [showShareMenu, setShowShareMenu] = useState(false);
    const [copied, setCopied] = useState(false);

    const getInitials = (name: string) => {
        const parts = name.trim().split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    // Gerar URL de compartilhamento
    const shareUrl = window.location.href;
    const shareText = `Conheça ${candidate.name} - ${candidate.partyAbbr} - Nº ${candidate.campaignNumber}`;

    const handleShare = (platform: string) => {
        let url = '';

        switch (platform) {
            case 'whatsapp':
                url = `https://wa.me/?text=${encodeURIComponent(shareText + '\n' + shareUrl)}`;
                break;
            case 'facebook':
                url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
                break;
            case 'twitter':
                url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
                break;
            case 'copy':
                navigator.clipboard.writeText(shareUrl);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
                return;
        }

        if (url) {
            window.open(url, '_blank', 'noopener,noreferrer');
        }
        setShowShareMenu(false);
    };

    const socialIcons = [
        { key: 'instagram', Icon: Instagram, url: candidate.socialLinks.instagram, color: '#E1306C' },
        { key: 'facebook', Icon: Facebook, url: candidate.socialLinks.facebook, color: '#1877F2' },
        { key: 'twitter', Icon: Twitter, url: candidate.socialLinks.twitter, color: '#000000' },
        { key: 'youtube', Icon: Youtube, url: candidate.socialLinks.youtube, color: '#FF0000' },
        { key: 'tiktok', Icon: TikTokIcon, url: candidate.socialLinks.tiktok, color: '#000000' },
        { key: 'linkedin', Icon: Linkedin, url: candidate.socialLinks.linkedin, color: '#0A66C2' },
    ].filter(item => item.url);

    return (
        <div
            className={`bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-all duration-200 hover:shadow-xl hover:border-t-4 ${isHighlighted ? 'ring-4 ring-offset-2' : ''
                }`}
            style={{
                borderTopColor: primaryColor,
                ...(isHighlighted && { ringColor: primaryColor }),
            }}
            role="article"
            aria-label={`${candidate.name} — ${candidate.cargo}`}
        >
            {/* Photo */}
            {candidate.photo ? (
                <div className="w-full aspect-[3/4] overflow-hidden">
                    <img
                        src={candidate.photo}
                        alt={candidate.name}
                        className="w-full h-full object-cover"
                    />
                </div>
            ) : (
                <div
                    className="w-full aspect-[3/4] flex items-center justify-center text-white text-4xl font-bold"
                    style={{ backgroundColor: primaryColor }}
                >
                    {getInitials(candidate.name)}
                </div>
            )}

            <div className="p-6">

                {/* Name */}
                <h3 className="text-lg font-bold text-gray-900 dark:text-white text-center mb-1">
                    {candidate.name}
                </h3>

                {/* Party */}
                <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-3">
                    {candidate.partyName} ({candidate.partyAbbr})
                </p>

                {/* Campaign Number */}
                <div
                    className="mb-4 py-2 px-4 rounded-lg border-2 text-center"
                    style={{
                        backgroundColor: `${primaryColor}15`,
                        borderColor: primaryColor,
                        color: primaryColor,
                    }}
                >
                    <span className="text-2xl font-bold font-mono">
                        Nº {candidate.campaignNumber}
                    </span>
                </div>

                {/* Description */}
                {candidate.description && (
                    <div className="mb-4 text-sm text-gray-700 dark:text-gray-300">
                        <p className={showFullDescription ? '' : 'line-clamp-3'}>
                            {candidate.description}
                        </p>
                        {candidate.description.length > 150 && (
                            <button
                                onClick={() => setShowFullDescription(!showFullDescription)}
                                className="text-sm mt-1 hover:underline"
                                style={{ color: primaryColor }}
                            >
                                {showFullDescription ? 'ver menos' : 'ver mais ↓'}
                            </button>
                        )}
                    </div>
                )}

                {/* Social Links */}
                {socialIcons.length > 0 && (
                    <div className="flex justify-center gap-3 mb-4">
                        {socialIcons.map(({ key, Icon, url, color }) => (
                            <a
                                key={key}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-400 hover:scale-110 transition-all duration-150"
                                style={{ '--hover-color': color } as React.CSSProperties}
                                onMouseEnter={(e) => (e.currentTarget.style.color = color)}
                                onMouseLeave={(e) => (e.currentTarget.style.color = '#9CA3AF')}
                                aria-label={`${key} de ${candidate.name}`}
                            >
                                <Icon className="w-7 h-7" />
                            </a>
                        ))}
                    </div>
                )}

                {/* Website Button */}
                {candidate.websiteUrl && (
                    <a
                        href={candidate.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full py-2 px-4 rounded-lg text-white font-medium hover:opacity-90 transition-opacity mb-3"
                        style={{ backgroundColor: primaryColor }}
                        aria-label={`Site de ${candidate.name} (abre em nova aba)`}
                    >
                        <Globe className="w-5 h-5" />
                        Saiba mais
                    </a>
                )}

                {/* Action Buttons Row */}
                <div className="flex gap-2 mb-3">
                    {/* WhatsApp Button */}
                    {candidate.whatsappUrl && (
                        <a
                            href={candidate.whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 flex-1 py-2 px-3 rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
                            style={{ backgroundColor: '#25D366' }}
                            aria-label={`Falar com ${candidate.name} no WhatsApp (abre em nova aba)`}
                        >
                            <WhatsAppIcon />
                            <span className="text-sm">Fale com o candidato</span>
                        </a>
                    )}

                    {/* Share Button */}
                    <div className="relative flex-1">
                        <button
                            onClick={() => setShowShareMenu(!showShareMenu)}
                            className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-lg border-2 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            style={{ borderColor: primaryColor, color: primaryColor }}
                            aria-label="Compartilhar candidato"
                        >
                            <Share2 className="w-5 h-5" />
                            <span className="text-sm">Compartilhar</span>
                        </button>

                        {/* Share Menu */}
                        {showShareMenu && (
                            <div className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-2 z-10">
                                <button
                                    onClick={() => handleShare('whatsapp')}
                                    className="flex items-center gap-3 w-full px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                >
                                    <WhatsAppIcon />
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">WhatsApp</span>
                                </button>
                                <button
                                    onClick={() => handleShare('facebook')}
                                    className="flex items-center gap-3 w-full px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                >
                                    <Facebook className="w-5 h-5" />
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Facebook</span>
                                </button>
                                <button
                                    onClick={() => handleShare('twitter')}
                                    className="flex items-center gap-3 w-full px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                >
                                    <Twitter className="w-5 h-5" />
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Twitter</span>
                                </button>
                                <button
                                    onClick={() => handleShare('copy')}
                                    className="flex items-center gap-3 w-full px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                >
                                    {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        {copied ? 'Link copiado!' : 'Copiar link'}
                                    </span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Official Site Button */}
                {candidate.officialSiteUrl && (
                    <a
                        href={candidate.officialSiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full py-2 px-4 rounded-lg border-2 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        style={{ borderColor: primaryColor, color: primaryColor }}
                        aria-label={`Site oficial de ${candidate.name} (abre em nova aba)`}
                    >
                        <Globe className="w-5 h-5" />
                        Site oficial do Candidato
                    </a>
                )}
            </div>
        </div>
    );
}
