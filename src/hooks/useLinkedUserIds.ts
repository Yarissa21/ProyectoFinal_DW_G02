import { useQuery } from '@tanstack/react-query';
import { listEmployees } from '../services/employeeService';
import { employeeKeys } from './useEmployees';

const PAGE_SIZE = 100;
const MAX_PAGES = 50;

async function fetchLinkedUserIds(): Promise<string[]> {
  const ids: string[] = [];
  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const result = await listEmployees({ page, limit: PAGE_SIZE });
    for (const employee of result.items) {
      if (employee.user) ids.push(employee.user.id);
    }
    if (!result.meta.hasNextPage) break;
  }
  return ids;
}

export function useLinkedUserIds() {
  return useQuery({
    queryKey: [...employeeKeys.lists(), 'linked-user-ids'] as const,
    queryFn: fetchLinkedUserIds,
  });
}