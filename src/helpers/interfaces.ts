import { BigNumber } from '@ethersproject/bignumber';
import { Fragment, JsonFragment } from '@ethersproject/abi';

export interface Strategy {
  id: string;
  spacesCount: number;
  author: string;
  version: string;
  about?: string;
  schema?: StrategySchema | null;
  examples?: StrategyExample[];
}

interface StrategyExample {
  name: string;
  strategy: Record<string, any>;
  network: string;
  addresses: string[];
  snapshot: number;
}

interface StrategySchema {
  $schema: string;
  $ref: string;
  definitions: {
    Strategy: Record<string, unknown>;
  };
}

export interface StrategyDefinitionProperties {
  type: string;
  title: string;
  default?: any;
  examples?: string[];
  description?: string;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
}
export interface StrategyDefinition {
  title: string;
  type: string;
  default?: any;
  description?: string;
  required?: string[];
  additionalProperties?: boolean;
  properties?: StrategyDefinitionProperties;
}

export interface ProfileActivity {
  id: string;
  created: number;
  type: string;
  title: string;
  space: { id: string; avatar: string };
  vote?: { proposalId: string; choice: string; type: string };
}

export interface TreasuryAsset {
  contract_name: string;
  contract_ticker_symbol: string;
  contract_address: string;
  contract_decimals: number;
  logo_url: string;
  balance: string;
  balance_24h: string;
  quote: number;
  quote_24h: number;
}

export interface TreasuryWallet {
  name: string;
  address: string;
  network: string;
}

export interface ExtendedSpace {
  id: string;
  name: string;
  symbol: string;
  network: string;
  strategies: SpaceStrategy[];
  about: string;
  avatar: string;
  skin: string;
  domain: string | null;
  website: string | null;
  terms: string | null;
  github: string | null;
  twitter: string | null;
  followersCount: number;
  private: boolean;
  admins: string[];
  members: string[];
  categories: string[];
  parent: ExtendedSpace | null;
  children: ExtendedSpace[];
  filters: { minScore: number; onlyMembers: boolean };
  plugins: Record<string, any>;
  validation: { name: string; params: Record<string, any> };
  treasuries: TreasuryAsset[];
  voting: {
    delay: number | null;
    hideAbstain: boolean;
    period: number | null;
    quorum: number | null;
    type: string | null;
  };
}

export interface SpaceStrategy {
  name: string;
  network: string;
  params: Record<string, unknown>;
}

export interface Proposal {
  id: string;
  title: string;
  ipfs: string;
  network: string;
  choices: string[];
  type: string;
  snapshot: string;
  author: string;
  body: string;
  created: number;
  start: number;
  end: number;
  state: string;
  symbol: string;
  discussion: string;
  quorum: number;
  scores: number[];
  scores_state: string;
  scores_total: number;
  scores_by_strategy: number[][];
  votes: number;
  plugins: Record<string, any>;
  space: ExtendedSpace;
  strategies: SpaceStrategy[];
}

export interface Results {
  scoresByStrategy: number[][];
  scores: number[];
  scoresTotal: number;
}

export interface Vote {
  ipfs: string;
  voter: string;
  choice: number | number[] | Record<string, any>;
  balance: number;
  scores: number[];
  vp: number;
  vp_by_strategy: number[];
}

// Execution

export type ABI = string | Array<Fragment | JsonFragment | string>;

export interface SafeTransaction {
  to: string;
  value: string;
  data: string;
  operation: string;
  nonce: string;
}

export interface RealityOracleProposal {
  dao: string;
  oracle: string;
  cooldown: number;
  expiration: number;
  proposalId: string;
  questionId: string | undefined;
  executionApproved: boolean;
  finalizedAt: number | undefined;
  nextTxIndex: number | undefined;
  transactions: SafeTransaction[];
  txHashes: string[];
  currentBond: BigNumber | undefined;
  isApproved: boolean;
  endTime: number | undefined;
}

export interface SafeAsset {
  address: string;
  name: string;
  logoUri?: string;
}

export interface CollectableAsset extends SafeAsset {
  id: string;
  tokenName?: string;
}

export interface TokenAsset extends SafeAsset {
  symbol: string;
  decimals: number;
}

export interface CollectableAssetTransaction extends SafeTransaction {
  type: 'transferNFT';
  recipient: string;
  collectable: CollectableAsset;
}

export interface TokenAssetTransaction extends SafeTransaction {
  type: 'transferFunds';
  amount: string;
  recipient: any;
  token: TokenAsset;
}

export interface CustomContractTransaction extends SafeTransaction {
  type: 'contractInteraction';
  abi: string[];
}

export interface SafeModuleTransactionBatch {
  hash: string;
  transactions: SafeTransaction[];
}

export interface SafeExecutionData {
  hash: string | null;
  txs: SafeModuleTransactionBatch[];
  network: string;
  realityModule: string;
}
