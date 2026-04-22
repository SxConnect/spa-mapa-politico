export interface AppConfig {
  projectName: string;
  logo: string;
  headerImage: string;
  mapTitle: string;
  primaryColor: string;
  secondaryColor: string;
  mapColorEmpty: string;
  mapColorFilled: string;
  mapColorHover: string;
  aboutText: string;
  footerText: string;
  footerContact: string;
  theme: 'light' | 'dark';
}

export type Cargo =
  | 'presidente'
  | 'senador'
  | 'deputado-federal'
  | 'deputado-estadual'
  | 'governador'
  | 'prefeito';

export interface SocialLinks {
  instagram?: string;
  facebook?: string;
  twitter?: string;
  youtube?: string;
  tiktok?: string;
  linkedin?: string;
}

export interface Candidate {
  id: string;
  name: string; // Nome Político (como aparece no card)
  fullName: string; // Nome Completo
  photo: string;
  partyName: string;
  partyAbbr: string;
  campaignNumber: string;
  cargo: Cargo;
  state: string;
  municipality?: string;
  description: string;
  socialLinks: SocialLinks;
  websiteUrl?: string;
  whatsappUrl?: string;
  officialSiteUrl?: string;
  createdAt: string;
  active: boolean;
}

// Constantes fixas
export const BRAZIL_STATES = [
  { uf: 'AC', name: 'Acre' },
  { uf: 'AL', name: 'Alagoas' },
  { uf: 'AP', name: 'Amapá' },
  { uf: 'AM', name: 'Amazonas' },
  { uf: 'BA', name: 'Bahia' },
  { uf: 'CE', name: 'Ceará' },
  { uf: 'DF', name: 'Distrito Federal' },
  { uf: 'ES', name: 'Espírito Santo' },
  { uf: 'GO', name: 'Goiás' },
  { uf: 'MA', name: 'Maranhão' },
  { uf: 'MT', name: 'Mato Grosso' },
  { uf: 'MS', name: 'Mato Grosso do Sul' },
  { uf: 'MG', name: 'Minas Gerais' },
  { uf: 'PA', name: 'Pará' },
  { uf: 'PB', name: 'Paraíba' },
  { uf: 'PR', name: 'Paraná' },
  { uf: 'PE', name: 'Pernambuco' },
  { uf: 'PI', name: 'Piauí' },
  { uf: 'RJ', name: 'Rio de Janeiro' },
  { uf: 'RN', name: 'Rio Grande do Norte' },
  { uf: 'RS', name: 'Rio Grande do Sul' },
  { uf: 'RO', name: 'Rondônia' },
  { uf: 'RR', name: 'Roraima' },
  { uf: 'SC', name: 'Santa Catarina' },
  { uf: 'SP', name: 'São Paulo' },
  { uf: 'SE', name: 'Sergipe' },
  { uf: 'TO', name: 'Tocantins' },
] as const;

export const CARGOS = [
  { id: 'presidente', name: 'Presidente' },
  { id: 'senador', name: 'Senador' },
  { id: 'deputado-federal', name: 'Deputado Federal' },
  { id: 'deputado-estadual', name: 'Deputado Estadual' },
  { id: 'governador', name: 'Governador' },
  { id: 'prefeito', name: 'Prefeito' },
] as const;
