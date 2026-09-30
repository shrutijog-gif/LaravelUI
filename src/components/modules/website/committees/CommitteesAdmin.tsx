import React, { useState } from 'react';
import { CommitteesList } from './CommitteesList';
import { CommitteeContentManager } from './CommitteeContentManager';

export interface Committee {
  id: string;
  name: string;
  type: CommitteeType;
}

export type CommitteeType =
  | 'Statutory'
  | 'Non-Statutory'
  | 'Student Support'
  | 'Activity Group';

export const COMMITTEE_TYPES: CommitteeType[] = [
  'Statutory',
  'Non-Statutory',
  'Student Support',
  'Activity Group',
];

const SEED_COMMITTEES: Committee[] = [
  { id: 'c1', name: 'IQAC', type: 'Statutory' },
  { id: 'c2', name: 'Anti-Ragging Committee', type: 'Statutory' },
  { id: 'c3', name: 'Women Empowerment Cell', type: 'Student Support' },
  { id: 'c4', name: 'NSS Committee', type: 'Activity Group' },
  { id: 'c5', name: 'Cultural Committee', type: 'Activity Group' },
];

type View = 'list' | 'manage';

export const CommitteesAdmin: React.FC = () => {
  const [view, setView] = useState<View>('list');
  const [committees, setCommittees] = useState<Committee[]>(SEED_COMMITTEES);
  const [selectedCommittee, setSelectedCommittee] = useState<Committee | null>(null);

  const handleManage = (committee: Committee) => {
    setSelectedCommittee(committee);
    setView('manage');
  };

  const handleBack = () => {
    setView('list');
    setSelectedCommittee(null);
  };

  if (view === 'manage' && selectedCommittee) {
    return (
      <CommitteeContentManager
        committee={selectedCommittee}
        onBack={handleBack}
      />
    );
  }

  return (
    <CommitteesList
      committees={committees}
      onCommitteesChange={setCommittees}
      onManage={handleManage}
    />
  );
};
