import assert from 'node:assert';
import test from 'node:test';
import { RaftNode } from '../dist/raft-node.js';

test('RaftNode initiates election, grants votes and applies committed log entries', () => {
  const n1 = new RaftNode('node-1', ['node-2', 'node-3']);
  const n2 = new RaftNode('node-2', ['node-1', 'node-3']);

  const electionArgs = n1.startElection();
  assert.strictEqual(n1.role, 'CANDIDATE');

  const vote = n2.handleRequestVote(electionArgs);
  assert.strictEqual(vote.voteGranted, true);

  n1.becomeLeader();
  n1.appendClientCommand({ op: 'SET', key: 'cluster_state', val: 'HEALTHY' });
  n1.commitEntries(1);

  assert.strictEqual(n1.stateMachine.get('cluster_state'), 'HEALTHY');
});
