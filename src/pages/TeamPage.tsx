import { useState } from 'react';
import PageHeader from '../components/PageHeader';
import { TEAM_MEMBERS, type TeamMember } from '../data/teamMembers';

function GithubIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
      <path d="M12 .5C5.73.5.5 5.73.5 12c0 5.08 3.29 9.38 7.86 10.9.58.1.79-.25.79-.56v-2c-3.2.7-3.87-1.37-3.87-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5z" />
    </svg>
  );
}

function Avatar({ member }: { member: TeamMember }) {
  const [failed, setFailed] = useState(false);

    if (failed || !member.photo) {
    return (
      <span
        aria-hidden="true"
        className="grid size-24 shrink-0 place-items-center rounded-full bg-slate-200 text-2xl font-bold text-slate-700"
      >
        {member.initials}
      </span>
    );
  }

  return (
    <img
      src={member.photo}
      alt={`Foto de ${member.name}`}
      onError={() => setFailed(true)}
      className="size-24 shrink-0 rounded-full border-4 border-white object-cover shadow"
    />
  );
}

function MemberCard({ member }: { member: TeamMember }) {
  const titleId = `member-${member.id}`;

  return (
    <article aria-labelledby={titleId} className="flex flex-col rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex flex-col items-center text-center">
        <Avatar member={member} />
        <h2 id={titleId} className="mt-3 break-words text-lg font-semibold text-slate-900">
          {member.name}
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Carnet: <span className="font-medium text-slate-900">{member.carnet}</span>
        </p>
        <a
          href={member.githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600"
        >
          <GithubIcon />
          <span>Ver perfil en GitHub</span>
          <span className="sr-only">
            {' '}
            de {member.name} (se abre en una pestaña nueva)
          </span>
        </a>
      </div>
    </article>
  );
}

function TeamPage() {
  return (
    <section aria-labelledby="team-title" className="space-y-6">
      <PageHeader
        id="team-title"
        title="Equipo"
        description="Integrantes del grupo 3 con especialidad de proyecto G02."
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {TEAM_MEMBERS.map((member) => (
          <MemberCard key={member.id} member={member} />
        ))}
      </div>
    </section>
  );
}

export default TeamPage;