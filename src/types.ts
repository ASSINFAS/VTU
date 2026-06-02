/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type RoleType = 'customer' | 'agent' | 'vendor' | 'admin' | 'super_admin';
export type KYCStatus = 'unverified' | 'pending' | 'tier1' | 'tier2' | 'tier3';
export type TransactionType = 'airtime' | 'data' | 'cable' | 'electricity' | 'education' | 'bulk_sms' | 'funding' | 'transfer';
export type TransactionStatus = 'pending' | 'success' | 'failed';
export type VTUProviderType = 'VTU_NG' | 'VTUGATE' | 'SME_API';

export interface UserProfile {
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  role: RoleType;
  kycLevel: KYCStatus;
  bvn?: string;
  nin?: string;
  referralCode: string;
  referredBy?: string;
  twoFactorEnabled: boolean;
  deviceBound: boolean;
  createdAt: string;
}

export interface Wallet {
  walletId: string;
  ownerId: string;
  balance: number;
  lockedBalance: number;
  virtualBankName: string;
  virtualAccountNumber: string;
  updatedAt: string;
}

export interface Transaction {
  transactionId: string;
  ownerId: string;
  type: TransactionType;
  amount: number;
  network?: string;
  recipient: string;
  status: TransactionStatus;
  vtuProviderUsed?: VTUProviderType;
  commission: number;
  description: string;
  createdAt: string;
}

export interface AgentProfile {
  agentId: string;
  commissionBalance: number;
  agentTier: 'bronze' | 'silver' | 'gold';
  monthlyVolume: number;
  refereeCount: number;
  totalCommissionsPaid: number;
}

export interface VtuAPIConfig {
  primaryProvider: VTUProviderType;
  backupProvider: VTUProviderType;
  autoFailoverEnabled: boolean;
  airtimeDiscountPercent: number; // e.g., 3.5%
  dataProfitMarginPercent: number; // e.g., 5%
}

export interface SecurityAuditLog {
  logId: string;
  userId: string;
  action: string;
  deviceFingerprint: string;
  ipAddress: string;
  createdAt: string;
}
