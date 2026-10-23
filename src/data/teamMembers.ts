const PHOTOS = import.meta.glob<string>('../assets/*.{jpg,jpeg,png,webp,avif}', {
  eager: true,
  import: 'default',
});

function findPhoto(fileName: string): string | undefined {
  const key = Object.keys(PHOTOS).find((path) => {
    const base = path.split('/').pop()?.replace(/\.[^.]+$/, '');
    return base?.toLowerCase() === fileName.toLowerCase();
  });
  return key ? PHOTOS[key] : undefined;
}

export interface TeamMember {
  id: string;
  name: string;
  initials: string;
  carnet: string;
  photo?: string;
  githubUser: string;
  githubUrl: string;
}

export const TEAM_MEMBERS: TeamMember[] = [
  {
    id: 'yarissa',
    name: 'Yarissa Alexandra Hernández Mijangos',
    initials: 'YH',
    carnet: '1790-23-1812',
    photo: findPhoto('Yarissa'),
    githubUser: 'Yarissa21',
    githubUrl: 'https://github.com/Yarissa21',
  },
  {
    id: 'anthony',
    name: 'Anthony Obed Ortiz Ochoa',
    initials: 'AO',
    carnet: '1790-23-3899',
    photo: findPhoto('Anthony'),
    githubUser: 'AnthonyOrtiz8A',
    githubUrl: 'https://github.com/AnthonyOrtiz8A',
  },
  {
    id: 'eliasif',
    name: 'Zurisdai Eliasif Alberto Parada Ramírez',
    initials: 'ZP',
    carnet: '1790-23-7417',
    photo: findPhoto('Zurisdai'),
    githubUser: 'zurisdaalbertoeliasifparadaram-create',
    githubUrl: 'https://github.com/zurisdaalbertoeliasifparadaram-create',
  },
];