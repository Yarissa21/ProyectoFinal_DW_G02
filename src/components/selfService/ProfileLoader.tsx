import type { ReactNode } from 'react';
import ErrorAlert from '../ErrorAlert';
import LoadingState from '../LoadingState';
import NotLinkedNotice, { NOT_LINKED_CODE } from './NotLinkedNotice';
import { useMyProfile } from '../../hooks/useSelfService';
import { describeError } from '../../services/errorMessages';
import type { SelfServiceProfile } from '../../types/selfService';

interface ProfileLoaderProps {
  children: (profile: SelfServiceProfile) => ReactNode;
  loadingLabel?: string;
}

/** Resuelve los estados de la consulta del perfil propio: carga, error, perfil no vinculado y datos. */
function ProfileLoader({ children, loadingLabel = 'Cargando tu perfil…' }: ProfileLoaderProps) {
  const query = useMyProfile();

  if (query.isPending) return <LoadingState label={loadingLabel} />;

  if (query.isError) {
    const error = describeError(query.error);
    if (error.code === NOT_LINKED_CODE) {
      return <NotLinkedNotice error={error} fetching={query.isFetching} onRetry={() => void query.refetch()} />;
    }
    return <ErrorAlert error={error} onRetry={() => void query.refetch()} />;
  }

  return <>{children(query.data)}</>;
}

export default ProfileLoader;
