import { LogEntry, NodeRole, RequestVoteArgs, RequestVoteResult } from './types.js';

export class RaftNode {
  public role: NodeRole = 'FOLLOWER';
  public currentTerm = 0;
  public votedFor: string | null = null;
  public log: LogEntry[] = [];
  public commitIndex = 0;
  public stateMachine = new Map<string, string>();

  constructor(public nodeId: string, public peers: string[] = []) {}

  startElection(): RequestVoteArgs {
    this.role = 'CANDIDATE';
    this.currentTerm++;
    this.votedFor = this.nodeId;

    const lastLog = this.log[this.log.length - 1];
    return {
      term: this.currentTerm,
      candidateId: this.nodeId,
      lastLogIndex: lastLog ? lastLog.index : 0,
      lastLogTerm: lastLog ? lastLog.term : 0
    };
  }

  handleRequestVote(args: RequestVoteArgs): RequestVoteResult {
    if (args.term > this.currentTerm) {
      this.currentTerm = args.term;
      this.role = 'FOLLOWER';
      this.votedFor = null;
    }

    const voteGranted = args.term === this.currentTerm && (this.votedFor === null || this.votedFor === args.candidateId);
    if (voteGranted) {
      this.votedFor = args.candidateId;
    }

    return { term: this.currentTerm, voteGranted };
  }

  becomeLeader(): void {
    this.role = 'LEADER';
  }

  appendClientCommand(command: { op: 'SET' | 'DEL'; key: string; val?: string }): LogEntry {
    if (this.role !== 'LEADER') throw new Error('Not cluster leader');
    const entry: LogEntry = {
      term: this.currentTerm,
      index: this.log.length + 1,
      command
    };
    this.log.push(entry);
    return entry;
  }

  commitEntries(newCommitIndex: number): void {
    while (this.commitIndex < newCommitIndex && this.commitIndex < this.log.length) {
      this.commitIndex++;
      const entry = this.log[this.commitIndex - 1];
      if (entry.command.op === 'SET') {
        this.stateMachine.set(entry.command.key, entry.command.val!);
      } else {
        this.stateMachine.delete(entry.command.key);
      }
    }
  }
}
