import { useEffect, useRef } from 'react';
import ErrorAlert from '../ErrorAlert';
import type { ServerIssue } from '../../utils/formErrors';

interface ServerIssueAlertProps {
  issue: ServerIssue;
  onRetry: () => void;
}

function ServerIssueAlert({ issue, onRetry }: ServerIssueAlertProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current?.scrollIntoView({ block: 'nearest' });
  }, [issue]);

  return (
    <div ref={ref} className="space-y-2">
      <ErrorAlert error={issue.error} onRetry={onRetry} />
      {issue.extra.length > 0 && (
        <ul className="list-disc space-y-1 pl-5 text-sm text-red-900">
          {issue.extra.map((text) => (
            <li key={text}>{text}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ServerIssueAlert;