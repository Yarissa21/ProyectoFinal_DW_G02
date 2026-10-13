import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import ProfileLoader from '../components/selfService/ProfileLoader';
import ProfileCard from '../components/selfService/ProfileCard';
import ContactForm from '../components/selfService/ContactForm';

function MyProfilePage() {
  return (
    <section aria-labelledby="profile-title" className="space-y-6">
      <PageHeader
        id="profile-title"
        title="Mi perfil"
        description="Tu información laboral y tus datos de contacto."
        actions={
          <Link
            to="/inicio"
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600"
          >
            Volver al inicio
          </Link>
        }
      />
      <ProfileLoader>
        {(profile) => (
          <div className="space-y-6">
            <ProfileCard profile={profile} />
            <ContactForm profile={profile} />
          </div>
        )}
      </ProfileLoader>
    </section>
  );
}

export default MyProfilePage;
