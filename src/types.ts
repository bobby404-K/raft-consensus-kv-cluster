export type NodeRole = 'FOLLOWER' | 'CANDIDATE' | 'LEADER';

export interface LogEntry {
  term: number;
  index: number;
  command: { op: 'SET' | 'DEL'; key: string; val?: string };
}

export interface RequestVoteArgs {
  term: number;
  candidateId: string;
  lastLogIndex: number;
  lastLogTerm: number;
}

export interface RequestVoteResult {
  term: number;
  voteGranted: boolean;
}
