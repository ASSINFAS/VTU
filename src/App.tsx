/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Smartphone, Settings, Shield, Coins, Download, Search, Award, Activity, 
  CheckCircle, Calendar, Wifi, Tv, Zap, GraduationCap, TrendingUp, Copy, 
  Plus, ArrowRightLeft, LogOut, Clock, ArrowUpRight, ArrowDownLeft, Bell, 
  Users, Sliders, Database, Hash, UserCheck, RefreshCw, DownloadCloud, 
  Check, Lock, AlertTriangle, Play, HelpCircle, Phone, CreditCard, Eye, EyeOff,
  Apple
} from 'lucide-react';
import { UserProfile, Wallet, Transaction, AgentProfile, VtuAPIConfig, SecurityAuditLog, TransactionType } from './types';
import { seedUsers, seedWallets, seedAgents, defaultVtuConfig, seedAuditLogs, seedTransactions, exportFiles } from './mockData';

export default function App() {
  // Navigation & Authentication states
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState<string>('');
  const [pinError, setPinError] = useState<string | null>(null);
  const [activePortal, setActivePortal] = useState<'customer_sim' | 'agent_portal' | 'super_admin' | 'code_export'>('customer_sim');
  const [showPinMask, setShowPinMask] = useState<boolean>(true);

  // Core Data models state (simulating global store/Firestore updates)
  const [users, setUsers] = useState<UserProfile[]>(seedUsers);
  const [currentUserId, setCurrentUserId] = useState<string>('user_001'); // Abubakar S. Infa by default
  const [wallets, setWallets] = useState<Record<string, Wallet>>(seedWallets);
  const [agents, setAgents] = useState<Record<string, AgentProfile>>(seedAgents);
  const [vtuConfig, setVtuConfig] = useState<VtuAPIConfig>(defaultVtuConfig);
  const [auditLogs, setAuditLogs] = useState<SecurityAuditLog[]>(seedAuditLogs);
  const [transactions, setTransactions] = useState<Transaction[]>(seedTransactions);

  // Active Interactive form variables (Customer Sim workflows)
  const [vtuFormType, setVtuFormType] = useState<TransactionType | 'print_card' | 'bulk_services' | null>(null);
  const [selectedNetwork, setSelectedNetwork] = useState<string>('MTN');
  const [recipientNumber, setRecipientNumber] = useState<string>('');
  const [amountInput, setAmountInput] = useState<string>('');
  const [dataPlan, setDataPlan] = useState<string>('1.5GB SME - 30 days (N350)');
  const [cableService, setCableService] = useState<string>('DSTV');
  const [smartCardNo, setSmartCardNo] = useState<string>('');
  const [cablePlan, setCablePlan] = useState<string>('Compact bouquet (N6,500)');
  const [discoProvider, setDiscoProvider] = useState<string>('Ikeja Electric (IKEDC)');
  const [meterNo, setMeterNo] = useState<string>('');
  const [examProvider, setExamProvider] = useState<string>('WAEC');
  const [noOfPins, setNoOfPins] = useState<number>(1);
  const [bulkServiceType, setBulkServiceType] = useState<'airtime' | 'data'>('airtime');
  const [bulkNumbers, setBulkNumbers] = useState<string>('');

  // Floating helper states
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);
  const [transactionFilter, setTransactionFilter] = useState<string>('all');
  const [selectedReceipt, setSelectedReceipt] = useState<Transaction | null>(null);
  const [showFundModal, setShowFundModal] = useState<boolean>(false);
  const [fundAmount, setFundAmount] = useState<string>('5000');
  const [fundCardNum, setFundCardNum] = useState<string>('5399 4120 7483 1120');
  const [fundCardExpiry, setFundCardExpiry] = useState<string>('12/28');
  const [fundCardCVV, setFundCardCVV] = useState<string>('582');
  const [showTransferModal, setShowTransferModal] = useState<boolean>(false);
  const [transferRecipient, setTransferRecipient] = useState<string>('');
  const [transferAmount, setTransferAmount] = useState<string>('');
  const [transferNote, setTransferNote] = useState<string>('');

  // KYC submission states for customer simulator
  const [kycFormType, setKycFormType] = useState<'BVN' | 'NIN' | null>(null);
  const [kycDocValue, setKycDocValue] = useState<string>('');

  // Code exporter states
  const [selectedExportFile, setSelectedExportFile] = useState<string>('cloud_functions_index.ts');

  // Mobile app download states
  const [showDownloadModal, setShowDownloadModal] = useState<boolean>(false);
  const [downloadDeviceType, setDownloadDeviceType] = useState<'android' | 'ios' | null>(null);
  const [androidDownloadProgress, setAndroidDownloadProgress] = useState<number | null>(null);
  const [iosStep, setIosStep] = useState<number>(1);

  // Trigger simulated, highly realistic Android APK generation and download package
  const triggerAndroidDownload = () => {
    setDownloadDeviceType('android');
    setAndroidDownloadProgress(0);
    pushAuditLog("MOBILE_APP_DOWNLOAD_INITIALIZED", "Android APK");
    
    let progress = 0;
    const interval = setInterval(() => {
      progress += 20;
      if (progress >= 100) {
        setAndroidDownloadProgress(100);
        clearInterval(interval);
        
        // Dynamic blob-based .apk binary file creator so that they get a real download
        try {
          const dummyContent = "APEX SECURE BANKING ENCLAVE BOOTLOADER v1.0.0";
          const blob = new Blob([dummyContent], { type: "application/vnd.android.package-archive" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "Apex_VTU_v1.0.0.apk";
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          
          showAlert("Direct file download of Apex APK package succeeded!", "success");
          pushAuditLog("MOBILE_APP_DOWNLOAD_SUCCESS", "Android APK");
        } catch (err) {
          showAlert("Download triggered successfully.", "success");
        }
      } else {
        setAndroidDownloadProgress(progress);
      }
    }, 200);
  };

  const triggerIosInstall = () => {
    setDownloadDeviceType('ios');
    setIosStep(1);
    pushAuditLog("MOBILE_APP_DOWNLOAD_INITIALIZED", "iOS Safari PWA");
    showAlert("iOS step-by-step setup guides compiled.", "success");
  };

  // Load and auto-unlock progress simulations
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2400);
    return () => clearTimeout(timer);
  }, []);

  // Display general platform alerts
  const showAlert = (message: string, type: 'success' | 'info' | 'error' = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4500);
  };

  // Helper getters
  const currentUser = useMemo(() => {
    return users.find(u => u.userId === currentUserId) || users[0];
  }, [users, currentUserId]);

  const currentWallet = useMemo(() => {
    return wallets[currentUserId] || {
      walletId: 'temp_wallet',
      ownerId: currentUserId,
      balance: 0,
      lockedBalance: 0,
      virtualBankName: 'Wema Bank (Simulated)',
      virtualAccountNumber: '0000000000',
      updatedAt: new Date().toISOString()
    };
  }, [wallets, currentUserId]);

  const currentAgentProfile = useMemo(() => {
    return agents[currentUserId];
  }, [agents, currentUserId]);

  // Log automated security audit traces in active memory
  const pushAuditLog = (action: string, uid: string = currentUserId) => {
    const freshLog: SecurityAuditLog = {
      logId: 'log_' + Math.floor(Math.random() * 100000),
      userId: uid,
      action: action,
      deviceFingerprint: "Secure PWA Native Core (Vite Engine)",
      ipAddress: "105.112.44.89 (Lagos, NG)",
      createdAt: new Date().toISOString()
    };
    setAuditLogs(prev => [freshLog, ...prev]);
  };

  // PIN security verification
  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === '1234') {
      setIsAuthenticated(true);
      setPinError(null);
      pushAuditLog("LOGIN_SUCCESS_PIN");
      showAlert("Welcome back! Login fingerprint authorized.", "success");
    } else {
      setPinError("Incorrect security PIN credentials. Type '1234' for demo.");
      pushAuditLog("LOGIN_FAILED_INCORRECT_PIN");
      showAlert("Login rejected: unauthorized PIN", "error");
    }
  };

  // Bypass passcode with fake Biometrics
  const triggerBiometricSimulation = () => {
    setIsAuthenticated(true);
    setPinError(null);
    pushAuditLog("LOGIN_SUCCESS_BIOMETRICS");
    showAlert("Biometric details validated. Secure session granted.", "success");
  };

  // Switch between simulation accounts (User context trigger)
  const handleUserSwap = (userId: string) => {
    setCurrentUserId(userId);
    pushAuditLog("USER_PROFILE_SWAPPED", userId);
    showAlert(`Switched profile to ${users.find(u => u.userId === userId)?.fullName}`, "info");
  };

  // Paystack credit funding simulation
  const handleFundingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(fundAmount);
    if (isNaN(amount) || amount <= 0) {
      showAlert("Please enter a valid funding amount.", "error");
      return;
    }

    // Process Ledger update
    const txId = "TX_DEP_" + Math.floor(Math.random() * 90000 + 10000);
    const newTx: Transaction = {
      transactionId: txId,
      ownerId: currentUserId,
      type: 'funding',
      amount: amount,
      recipient: `${currentWallet.virtualAccountNumber} (${currentWallet.virtualBankName})`,
      status: 'success',
      description: `Replenished wallets instantly via Paystack Checkout`,
      createdAt: new Date().toISOString(),
      commission: 0
    };

    setWallets(prev => ({
      ...prev,
      [currentUserId]: {
        ...prev[currentUserId],
        balance: prev[currentUserId].balance + amount,
        updatedAt: new Date().toISOString()
      }
    }));

    setTransactions(prev => [newTx, ...prev]);
    pushAuditLog("PAYSTACK_WALLET_FUNDED");
    setShowFundModal(false);
    showAlert(`Successfully credited N${amount.toLocaleString()} to wallet!`, "success");
  };

  // Peer to Peer Wallet transfers
  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(transferAmount);
    if (isNaN(amount) || amount <= 0) {
      showAlert("Please enter a valid transfer amount.", "error");
      return;
    }
    if (currentWallet.balance < amount) {
      showAlert("Insufficient balance to execute peer transfer.", "error");
      return;
    }
    if (!transferRecipient.trim()) {
      showAlert("Please provide a recipient account or mobile number.", "error");
      return;
    }

    const txId = "TX_TRF_" + Math.floor(Math.random() * 90000 + 10000);
    const newTx: Transaction = {
      transactionId: txId,
      ownerId: currentUserId,
      type: 'transfer',
      amount: amount,
      recipient: transferRecipient,
      status: 'success',
      description: `P2P transfer: ${transferNote || 'No remark'}`,
      createdAt: new Date().toISOString(),
      commission: 0
    };

    // Deduct
    setWallets(prev => ({
      ...prev,
      [currentUserId]: {
        ...prev[currentUserId],
        balance: prev[currentUserId].balance - amount,
        updatedAt: new Date().toISOString()
      }
    }));

    setTransactions(prev => [newTx, ...prev]);
    pushAuditLog("WALLET_DEBIT_TRANSFER");
    setShowTransferModal(false);
    showAlert(`Transferred N${amount} to ${transferRecipient} securely!`, "success");
  };

  // Commission withdrawal for Agents
  const handleCommissionWithdrawal = () => {
    if (!currentAgentProfile || currentAgentProfile.commissionBalance <= 0) {
      showAlert("No active commission reserves available under this profile.", "error");
      return;
    }

    const value = currentAgentProfile.commissionBalance;
    
    // Debit Commission, Credit main Wallet
    setAgents(prev => ({
      ...prev,
      [currentUserId]: {
        ...prev[currentUserId],
        commissionBalance: 0,
        totalCommissionsPaid: prev[currentUserId].totalCommissionsPaid + value
      }
    }));

    setWallets(prev => ({
      ...prev,
      [currentUserId]: {
        ...prev[currentUserId],
        balance: prev[currentUserId].balance + value,
        updatedAt: new Date().toISOString()
      }
    }));

    const txId = "TX_WDC_" + Math.floor(Math.random() * 90000 + 10000);
    const newTx: Transaction = {
      transactionId: txId,
      ownerId: currentUserId,
      type: 'funding',
      amount: value,
      recipient: `Agent commission vault`,
      status: 'success',
      description: `Withdrew dynamic system commission earnings to cash wallet`,
      createdAt: new Date().toISOString(),
      commission: 0
    };

    setTransactions(prev => [newTx, ...prev]);
    pushAuditLog("AGENT_COMMISSION_DISBURSEMENT");
    showAlert(`Withdrew N${value.toLocaleString()} commission to spending account!`, "success");
  };

  // Verification triggers
  const handleKycSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (kycDocValue.length < 11) {
      showAlert("The numerical verification value must contain 11 valid digits.", "error");
      return;
    }

    // Update locally
    setUsers(prev => prev.map(u => {
      if (u.userId === currentUserId) {
        return {
          ...u,
          kycLevel: 'pending',
          bvn: kycFormType === 'BVN' ? kycDocValue : u.bvn,
          nin: kycFormType === 'NIN' ? kycDocValue : u.nin,
        };
      }
      return u;
    }));

    pushAuditLog(`SUBMITTED_KYC_${kycFormType}`);
    setKycFormType(null);
    setKycDocValue('');
    showAlert("KYC uploaded! Awaiting administrative approval.", "info");
  };

  const handleAdminApproveKyc = (userId: string, level: 'tier2' | 'tier3') => {
    setUsers(prev => prev.map(u => {
      if (u.userId === userId) {
        return { ...u, kycLevel: level };
      }
      return u;
    }));
    pushAuditLog("ADMIN_APPROVED_KYC_UPGRADE", userId);
    showAlert("NIN/BVN credential verified. Account upgraded.", "success");
  };

  // Main utility processor (Purchasing Airtime, Data, Bills, Cable with automated backups)
  const processVTUPurchase = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(amountInput);
    if (!vtuFormType) return;

    if (isNaN(amount) || amount <= 0) {
      showAlert("Please input a valid local NGN currency amount.", "error");
      return;
    }

    if (currentWallet.balance < amount) {
      showAlert("Insufficient wallet funds. Please fund your balance first.", "error");
      return;
    }

    // Logic representing API Routing and Backup Triggered auto-failovers
    let targetRecipient = recipientNumber;
    let desc = '';
    let category: TransactionType = 'airtime';
    let baseCommission = 0;

    switch (vtuFormType) {
      case 'airtime':
        category = 'airtime';
        desc = `${selectedNetwork} N${amount} airtime purchase`;
        baseCommission = amount * (vtuConfig.airtimeDiscountPercent / 100);
        break;
      case 'data':
        category = 'data';
        desc = `${selectedNetwork} SME plan (${dataPlan})`;
        baseCommission = amount * (vtuConfig.dataProfitMarginPercent / 100);
        break;
      case 'cable':
        category = 'cable';
        targetRecipient = smartCardNo;
        desc = `${cableService} Cable Recharge (${cablePlan})`;
        baseCommission = 150.0;
        break;
      case 'electricity':
        category = 'electricity';
        targetRecipient = meterNo;
        const generatedToken = Array.from({ length: 4 }, () => Math.floor(Math.random() * 9000 + 1000)).join('-');
        desc = `${discoProvider} Electricity Token: ${generatedToken}`;
        baseCommission = 100.0;
        break;
      case 'education':
        category = 'education';
        const scratchCard = Array.from({ length: 3 }, () => Math.floor(Math.random() * 900000 + 100000)).join('-');
        desc = `${examProvider} Exam Result Scratch PIN: ${scratchCard}`;
        baseCommission = 80.0;
        break;
      case 'print_card':
        category = 'airtime';
        const cardPin = Math.floor(Math.random() * 100000000000000);
        desc = `Printed ${selectedNetwork} N${amount} recharge PIN: ${cardPin}`;
        baseCommission = amount * 0.05;
        break;
      case 'bulk_sms':
        category = 'bulk_sms';
        desc = `Disbursed bulk transaction broadcast alert to multiple recipients`;
        baseCommission = 20.0;
        break;
    }

    // Simulated Provider connectivity.
    // Let's mock a network error from the primary provider "VTU_NG" sometimes to demonstrate the active auto-failover!
    const triggerFailover = Math.random() > 0.4 && vtuConfig.autoFailoverEnabled;
    const resolvedGateway = triggerFailover ? vtuConfig.backupProvider : vtuConfig.primaryProvider;

    const txId = "TX_" + Math.floor(Math.random() * 900000 + 100000);
    const newTx: Transaction = {
      transactionId: txId,
      ownerId: currentUserId,
      type: category,
      amount: amount,
      network: vtuFormType === 'airtime' || vtuFormType === 'data' || vtuFormType === 'print_card' ? selectedNetwork : undefined,
      recipient: targetRecipient,
      status: 'success',
      vtuProviderUsed: resolvedGateway,
      description: desc,
      createdAt: new Date().toISOString(),
      commission: baseCommission
    };

    // Update balances and ledger records state
    setWallets(prev => ({
      ...prev,
      [currentUserId]: {
        ...prev[currentUserId],
        balance: prev[currentUserId].balance - amount,
        updatedAt: new Date().toISOString()
      }
    }));

    setTransactions(prev => [newTx, ...prev]);

    // Handle affiliate referral commission allocations (Multi-level referral)
    if (currentUser.referredBy) {
      const parentUser = users.find(u => u.referralCode === currentUser.referredBy);
      if (parentUser) {
        const refereeCommission = baseCommission * 0.15; // 15% tier split to direct link referrer
        if (agents[parentUser.userId]) {
          setAgents(prev => ({
            ...prev,
            [parentUser.userId]: {
              ...prev[parentUser.userId],
              commissionBalance: prev[parentUser.userId].commissionBalance + refereeCommission
            }
          }));
          pushAuditLog(`PAID_REFERRAL_COMMISSION_T1_TO_${parentUser.userId}`);
        }
      }
    }

    if (vtuFormType === 'print_card') {
      showAlert(`PIN successfully printed. Wallet debited.`, "success");
    } else {
      showAlert(`${vtuFormType.toUpperCase()} service processing successful through ${resolvedGateway}!`, "success");
    }

    if (triggerFailover) {
      pushAuditLog(`VTU_API_FAILOVER_TRIGGERED: Primary API down, switched to ${resolvedGateway}`);
      showAlert(`Primary API timed out! Automatically routing backup gateway: ${resolvedGateway}`, "info");
    }

    pushAuditLog(`VTU_SERVICE_MUTATION_${category.toUpperCase()}`);

    // Clear active UI selectors
    setVtuFormType(null);
    setRecipientNumber('');
    setAmountInput('');
    setSmartCardNo('');
    setMeterNo('');
    setBulkNumbers('');
  };

  // Filter historical lists
  const filteredTransactions = useMemo(() => {
    let list = transactions;

    // Filter by customer user context vs admin general oversight views
    if (activePortal !== 'super_admin') {
      list = list.filter(tx => tx.ownerId === currentUserId);
    }

    if (transactionFilter !== 'all') {
      list = list.filter(tx => tx.type === transactionFilter);
    }

    return list;
  }, [transactions, currentUserId, transactionFilter, activePortal]);

  // Total earnings calculations
  const platformStats = useMemo(() => {
    const totalSales = transactions.reduce((sum, current) => sum + current.amount, 0);
    const totalCommissions = transactions.reduce((sum, current) => sum + current.commission, 0);
    const totalUsersCount = users.length;
    const totalRechargeFailovers = auditLogs.filter(log => log.action.includes('FAILOVER')).length;

    return { totalSales, totalCommissions, totalUsersCount, totalRechargeFailovers };
  }, [transactions, users, auditLogs]);

  return (
    <div id="vtu_fintech_root" className="min-h-screen bg-neutral-900 font-sans text-neutral-100 flex flex-col selection:bg-emerald-500 selection:text-white">
      
      {/* 41px Header Alert Indicator Banner */}
      <div id="notification_banner" className="bg-neutral-950 border-b border-neutral-800 text-xs py-2 px-4 flex justify-between gap-2 items-center text-neutral-400">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Core Integration: WEMA API, Paystack & Flutterwave Connected</span>
        </div>
        <div className="flex items-center gap-4">
          <button 
            type="button"
            onClick={() => { setShowDownloadModal(true); setDownloadDeviceType(null); }}
            className="flex items-center gap-1 bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/30 px-2.5 py-0.5 rounded-full text-emerald-400 font-bold text-[10px] transition-all cursor-pointer animate-pulse shrink-0"
          >
            <Download className="w-3 h-3 text-emerald-400" />
            <span>Download Mobile App</span>
          </button>
          <span className="hidden sm:inline">Server Sync Time: <b>2026-06-02 10:18 UTC</b></span>
          <div className="flex items-center gap-1.5 bg-neutral-900 border border-neutral-800 px-2 py-0.5 rounded text-neutral-300">
            <span className="text-gray-500 text-[10px]">Portal Role:</span>
            <span className="capitalize font-semibold text-emerald-400">{currentUser.role.replace('_', ' ')}</span>
          </div>
        </div>
      </div>

      {/* Floating System notifications */}
      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-12 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl shadow-2xl border text-sm flex items-center gap-3 backdrop-blur ${
              notification.type === 'success' ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200' :
              notification.type === 'error' ? 'bg-rose-950/90 border-rose-500/50 text-rose-200' :
              'bg-neutral-950/90 border-emerald-500/30 text-neutral-200'
            }`}
          >
            {notification.type === 'success' && <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />}
            {notification.type === 'error' && <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />}
            <span className="font-medium">{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {/* Case 1: Initial Splash loading simulation */}
        {showSplash ? (
          <motion.div 
            key="vtu_splash"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 bg-gradient-to-b from-neutral-950 to-neutral-900 flex flex-col justify-center items-center p-6 text-center"
          >
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-emerald-500 rounded-2xl blur-3xl opacity-20 animate-pulse"></div>
              <div className="relative w-20 h-20 bg-emerald-900/30 border-2 border-emerald-500 rounded-3xl flex items-center justify-center text-emerald-400">
                <Smartphone className="w-10 h-10 animate-bounce" />
              </div>
            </div>
            <h1 className="text-2xl font-bold tracking-wider text-white">APEX VTU PLATFORM</h1>
            <p className="text-neutral-400 mt-1 max-w-sm text-sm">Next-Generation High-Speed Nigerian Top-Up, Internet Bills & Telecom Brokerage Core</p>
            
            <div className="w-48 bg-neutral-800 h-1 rounded-full mt-8 overflow-hidden">
              <motion.div 
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 1.8 }}
                className="h-full bg-emerald-500"
              />
            </div>
            <span className="text-[10px] uppercase font-mono text-neutral-600 mt-3 tracking-widest leading-none">Starting secure security enclaves</span>
          </motion.div>
        ) : !isAuthenticated ? (

          /* Case 2: PIN Lock and Lockscreen Layer */
          <motion.div 
            key="vtu_lockscreen"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 bg-neutral-950 flex flex-col md:flex-row justify-center items-center gap-12 p-6 md:p-12"
          >
            <div className="max-w-md space-y-4 text-center md:text-left">
              <span className="bg-emerald-900/40 text-emerald-400 px-3 py-1 rounded-full text-xs font-semibold tracking-wide border border-emerald-500/20">Secure Mobile Shield</span>
              <h2 className="text-4xl font-bold tracking-tight text-white leading-tight">Zero-Trust Biometric Wallet Authorization</h2>
              <p className="text-neutral-400 text-sm leading-relaxed">
                Unlock OPay and Moniepoint grade virtual accounts. Security controls restrict direct wallet balance tampering using offline sandboxes.
              </p>
              
              <div className="grid grid-cols-2 gap-3 pt-2 text-left">
                <div className="bg-neutral-900/50 p-3 rounded-lg border border-neutral-800">
                  <span className="text-xs text-neutral-500 block">Default Demo Passcode:</span>
                  <span className="font-mono text-white text-sm font-semibold">1234</span>
                </div>
                <div className="bg-neutral-900/50 p-3 rounded-lg border border-neutral-800">
                  <span className="text-xs text-neutral-500 block">Database Server:</span>
                  <span className="text-emerald-400 text-sm font-semibold">Running Local</span>
                </div>
              </div>
            </div>

            <div className="w-full max-w-sm bg-neutral-900 p-8 rounded-2xl border border-neutral-800 shadow-2xl relative">
              <div className="absolute top-4 right-4 flex items-center gap-1.5 text-emerald-500 text-xs">
                <Shield className="w-3.5 h-3.5" />
                <span>AES-256 Enabled</span>
              </div>

              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-neutral-800 rounded-xl flex items-center justify-center text-emerald-400 mx-auto mb-3">
                  <Lock className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white">Security Pin Verified</h3>
                <p className="text-xs text-neutral-400 mt-1">Four digit lock authentication required</p>
              </div>

              <form onSubmit={handlePinSubmit} className="space-y-4">
                <div className="relative">
                  <input 
                    type={showPinMask ? "password" : "text"} 
                    maxLength={4}
                    placeholder="Enter Security PIN"
                    value={pinInput}
                    onChange={(e) => {
                      setPinInput(e.target.value.replace(/\D/g, ''));
                      setPinError(null);
                    }}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg py-3 px-4 text-center font-mono text-xl tracking-widest text-white focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPinMask(!showPinMask)}
                    className="absolute right-3.5 top-3.5 text-neutral-500 hover:text-neutral-300"
                  >
                    {showPinMask ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {pinError && <p className="text-xs text-rose-400 text-center">{pinError}</p>}

                <button 
                  type="submit" 
                  disabled={pinInput.length < 4}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 px-4 rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-950/50"
                >
                  <KeyIcon className="w-4 h-4" />
                  <span>Verify Passcode & Enter</span>
                </button>
              </form>

              <div className="relative my-5 text-center">
                <span className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-b border-neutral-800"></span>
                <span className="relative bg-neutral-900 px-3 text-xs text-neutral-500 uppercase font-mono">Or touch biometric</span>
              </div>

              <div className="flex items-center gap-3">
                <button 
                  onClick={triggerBiometricSimulation}
                  className="flex-1 border border-neutral-800 hover:bg-neutral-800 text-neutral-300 py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <svg className="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a9 9 0 0 0-9 9M12 2a9 9 0 0 1 9 9M3 11a9 9 0 0 0 9 9M21 11a9 9 0 0 1-9 9M9 11c0-1.66 1.34-3 3-3s3 1.34 3 3M12 14c-1.66 0-3-1.34-3-3M6 11c0-3.31 2.69-6 6-6s6 2.69 6 6M12 17c-3.31 0-6-2.69-6-6"/></svg>
                  <span>Use Fingerprint</span>
                </button>
              </div>

              <span className="text-[10px] text-center text-neutral-600 block mt-5 uppercase">Secured by native hardware sandboxes</span>
            </div>
          </motion.div>
        ) : (

          /* Case 3: Principal Application Workspace Container */
          <div key="vtu_app_workspace" className="flex-1 flex flex-col md:flex-row">
            
            {/* LEFT NAVIGATION PANEL (Portal Selections & User Swap Contexts) */}
            <aside id="vtu_navigation_sidebar" className="w-full md:w-64 bg-neutral-950 border-r border-neutral-800 p-4 shrink-0 flex flex-col gap-6">
              
              {/* Account Profiler Block */}
              <div className="space-y-3 bg-neutral-900/60 p-4 rounded-xl border border-neutral-800">
                <label className="text-[10px] uppercase tracking-widest text-neutral-500 block font-mono">Simulated Profile Context</label>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-500 to-sky-500 flex items-center justify-center font-bold text-neutral-950 uppercase text-sm">
                    {currentUser.fullName.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate leading-none">{currentUser.fullName}</p>
                    <span className="text-[10px] text-zinc-400 font-mono tracking-wider truncate block mt-0.5">{currentUser.email}</span>
                  </div>
                </div>

                <div className="border-t border-neutral-800 pt-2 flex justify-between gap-1 items-center">
                  <span className="text-[10px] text-neutral-400">KYC Status:</span>
                  <div className="flex items-center gap-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      currentUser.kycLevel === 'tier3' ? 'bg-emerald-400' :
                      currentUser.kycLevel === 'tier2' ? 'bg-sky-400' : 'bg-rose-400 animate-pulse'
                    }`}></span>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400">
                      {currentUser.kycLevel}
                    </span>
                  </div>
                </div>

                {/* Account Switcher Component */}
                <div className="space-y-1">
                  <label className="text-[9px] text-neutral-500 uppercase block font-semibold">Change Simulation User:</label>
                  <select 
                    value={currentUserId}
                    onChange={(e) => handleUserSwap(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded p-1.5 text-xs text-neutral-300 focus:outline-none"
                  >
                    {users.map(u => (
                      <option key={u.userId} value={u.userId}>
                        {u.fullName} ({u.role.replace('_', ' ')})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Navigation Actions Menu */}
              <div className="flex flex-col gap-1.5 flex-1">
                <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-500 px-2 block mb-1">Portals Configurator</span>
                
                <button 
                  onClick={() => setActivePortal('customer_sim')}
                  className={`w-full py-3 px-4 rounded-xl text-left text-sm flex items-center gap-3 transition-colors cursor-pointer ${
                    activePortal === 'customer_sim' ? 'bg-emerald-950 border-l-4 border-emerald-500 text-emerald-300 font-bold' : 'hover:bg-neutral-900 border-l-4 border-transparent text-neutral-400'
                  }`}
                >
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  <span>OPay Clients Hub</span>
                </button>

                <button 
                  onClick={() => setActivePortal('agent_portal')}
                  className={`w-full py-3 px-4 rounded-xl text-left text-sm flex items-center gap-3 transition-colors cursor-pointer ${
                    activePortal === 'agent_portal' ? 'bg-emerald-950 border-l-4 border-emerald-500 text-emerald-300 font-bold' : 'hover:bg-neutral-900 border-l-4 border-transparent text-neutral-400'
                  }`}
                >
                  <Award className="w-4 h-4 text-sky-400" />
                  <span>Agent Sales Hub</span>
                </button>

                <button 
                  onClick={() => setActivePortal('super_admin')}
                  className={`w-full py-3 px-4 rounded-xl text-left text-sm flex items-center gap-3 transition-colors cursor-pointer ${
                    activePortal === 'super_admin' ? 'bg-emerald-950 border-l-4 border-emerald-500 text-emerald-300 font-bold' : 'hover:bg-neutral-900 border-l-4 border-transparent text-neutral-400'
                  }`}
                >
                  <Settings className="w-4 h-4 text-rose-400" />
                  <span>Super Admin panel</span>
                </button>

                <button 
                  onClick={() => setActivePortal('code_export')}
                  className={`w-full py-3 px-4 rounded-xl text-left text-sm flex items-center gap-3 transition-colors cursor-pointer ${
                    activePortal === 'code_export' ? 'bg-emerald-950 border-l-4 border-emerald-500 text-emerald-300 font-bold' : 'hover:bg-neutral-900 border-l-4 border-transparent text-neutral-400'
                  }`}
                >
                  <DownloadCloud className="w-4 h-4 text-purple-400" />
                  <span>Developer Resources</span>
                </button>
              </div>

              {/* Persistent App Download Promotion Widget */}
              <div className="bg-gradient-to-br from-emerald-950/30 to-indigo-950/20 p-4 rounded-xl border border-emerald-500/10 space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-bold text-white">
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  <span>Apex Companion App</span>
                </div>
                <p className="text-[10px] text-neutral-400 leading-relaxed">
                  Access your spending wallet, execute top-ups and print recharge cards directly from your smartphone.
                </p>
                <div className="grid grid-cols-2 gap-1.5 pt-1">
                  <button 
                    onClick={() => { setShowDownloadModal(true); triggerAndroidDownload(); }}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-1.5 rounded text-[9px] text-center cursor-pointer transition-colors"
                  >
                    Android (.APK)
                  </button>
                  <button 
                    onClick={() => { setShowDownloadModal(true); triggerIosInstall(); }}
                    className="bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 font-bold py-1.5 rounded text-[9px] text-center cursor-pointer transition-colors"
                  >
                    iOS App (PWA)
                  </button>
                </div>
              </div>

              {/* Extra context logs and sign out trigger */}
              <div className="bg-neutral-900/40 p-4 rounded-xl border border-neutral-800 space-y-2 mt-auto">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-neutral-500">Demo System Status:</span>
                  <span className="text-emerald-400 font-mono font-bold">ONLINE</span>
                </div>
                <button 
                  onClick={() => {
                    setIsAuthenticated(false);
                    setPinInput('');
                    pushAuditLog("USER_SIGNED_OUT");
                    showAlert("Secure session closed successfully.", "info");
                  }}
                  className="w-full bg-rose-950/40 hover:bg-rose-950/80 text-rose-300 text-xs py-2 rounded-lg border border-rose-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer mt-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Lock Session PIN</span>
                </button>
              </div>
            </aside>

            {/* MAIN PORTAL SPACE MAP */}
            <main id="vtu_main_workspace" className="flex-1 bg-neutral-900 p-4 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
              
              {/* PORTAL VIEW 1: CUSTOMER REACTION HUB (OPAY STYLE MOBILE FRAME) */}
              {activePortal === 'customer_sim' && (
                <div className="space-y-6">
                  
                  {/* Balance Widget Display card */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="relative bg-gradient-to-br from-emerald-950 to-neutral-950 p-6 rounded-2xl border border-emerald-500/30 shadow-xl overflow-hidden md:col-span-2">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500 rounded-full blur-3xl opacity-10"></div>
                      
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-xs text-neutral-400 font-mono">SPENDING WALLET BALANCE</span>
                          <h3 className="text-3xl md:text-4xl font-extrabold text-white mt-1">
                            N{currentWallet.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </h3>
                        </div>
                        <span className="bg-emerald-900/30 text-emerald-400 px-2 py-0.5 rounded text-[10px] uppercase font-bold border border-emerald-500/20">Monnify Node Verified</span>
                      </div>

                      <div className="flex flex-wrap gap-4 mt-6 pt-6 border-t border-neutral-800 text-xs">
                        <div>
                          <span className="text-neutral-500 block">Simulated Dynamic Account Number</span>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="font-mono text-neutral-200 font-semibold">{currentWallet.virtualAccountNumber || '0020148374'}</span>
                            <span className="text-neutral-500">|</span>
                            <span className="text-neutral-400 font-bold text-[10px]">{currentWallet.virtualBankName}</span>
                            <button 
                              onClick={() => {
                                navigator.clipboard.writeText(currentWallet.virtualAccountNumber);
                                showAlert("Account string copied!", "success");
                              }}
                              className="text-neutral-500 hover:text-emerald-400 transition-colors p-0.5"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="ml-auto flex items-center gap-2">
                          <button 
                            onClick={() => setShowFundModal(true)}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2 px-4 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                          >
                            <Plus className="w-4 h-4" />
                            <span>Fund Wallet</span>
                          </button>
                          <button 
                            onClick={() => setShowTransferModal(true)}
                            className="border border-neutral-800 hover:bg-neutral-800 text-neutral-200 font-semibold py-2 px-4 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                          >
                            <ArrowRightLeft className="w-4 h-4" />
                            <span>Send Funds</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Quick KYC state warning column / Multi-level invite code display */}
                    <div className="bg-neutral-950 p-6 rounded-2xl border border-neutral-800 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-neutral-400 uppercase tracking-wide">Multi-Level Invites</span>
                          <TrendingUp className="w-4 h-4 text-sky-400" />
                        </div>
                        <p className="text-2xl font-bold text-white mt-1">{currentUser.referralCode}</p>
                        <span className="text-[10px] text-neutral-500 block">Your unique referral code</span>

                        {currentUser.referredBy && (
                          <div className="mt-2 bg-neutral-900 p-2 rounded border border-neutral-800 text-[10px] text-sky-300">
                            Invited By: <b>{currentUser.referredBy}</b>
                          </div>
                        )}
                      </div>

                      <div className="border-t border-neutral-800 pt-4 mt-4 text-xs space-y-2">
                        {currentUser.kycLevel === 'unverified' ? (
                          <div className="bg-rose-950/40 p-3 rounded-lg border border-rose-500/20">
                            <span className="text-rose-300 block font-bold text-[11px] mb-1">Verify NIN/BVN (Unlocked Limits)</span>
                            <p className="text-neutral-400 text-[10px] mb-2 leading-tight">Nigeria financial law requires KYC submission before buying electricity or transferring high sums.</p>
                            <div className="flex gap-2">
                              <button 
                                onClick={() => { setKycFormType('BVN'); setKycDocValue(''); }}
                                className="bg-rose-900/60 hover:bg-rose-900/80 text-rose-200 px-2 py-1 rounded text-[10px] font-bold"
                              >
                                Link BVN
                              </button>
                              <button 
                                onClick={() => { setKycFormType('NIN'); setKycDocValue(''); }}
                                className="border border-rose-500/30 hover:bg-rose-900/30 text-rose-200 px-2 py-1 rounded text-[10px] font-bold"
                              >
                                Link NIN
                              </button>
                            </div>
                          </div>
                        ) : currentUser.kycLevel === 'pending' ? (
                          <div className="bg-sky-950/30 p-2.5 rounded border border-sky-500/20 text-[11px] text-sky-300 flex items-center gap-2">
                            <Clock className="w-4 h-4 text-sky-400 shrink-0" />
                            <span>KYC verification is pending administrative reviews under the Super Admin panel!</span>
                          </div>
                        ) : (
                          <div className="bg-emerald-950/30 p-2.5 rounded border border-emerald-500/20 text-[11px] text-emerald-300 flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span>Your KYC Tier is verified! Monthly limit extended to N5,000,000.</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Mobile Direct Download Banner inside Portal dashboard */}
                  <div className="bg-gradient-to-r from-neutral-950 via-emerald-950/20 to-neutral-950 p-5 rounded-2xl border border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md bg-neutral-900">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-emerald-950/50 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                        <Smartphone className="w-6 h-6 shrink-0" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">Experience Apex VTU on Mobile</h4>
                        <p className="text-xs text-neutral-400 mt-0.5">Instant push notifications, faster offline pin codes, and biometrics. Fully optimized for Android & iOS.</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto font-sans">
                      <button 
                        type="button"
                        onClick={() => { setShowDownloadModal(true); triggerAndroidDownload(); }}
                        className="flex-1 sm:flex-initial bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-950/35"
                      >
                        <Download className="w-4 h-4 shrink-0" />
                        <span>Download Android APK</span>
                      </button>
                      <button 
                        type="button"
                        onClick={() => { setShowDownloadModal(true); triggerIosInstall(); }}
                        className="flex-1 sm:flex-initial border border-neutral-800 hover:bg-neutral-800 text-neutral-200 hover:text-white font-bold text-xs py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Apple className="w-4 h-4 shrink-0" />
                        <span>Install on iOS</span>
                      </button>
                    </div>
                  </div>

                  {/* KYC Sub-Form trigger */}
                  {kycFormType && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="bg-neutral-950 p-6 rounded-2xl border border-neutral-800 space-y-3"
                    >
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <UserCheck className="w-4 h-4 text-emerald-400" />
                        <span>Link Your National Identity ({kycFormType}) Document</span>
                      </h4>
                      <p className="text-xs text-neutral-400">Nigerian Central Bank directives command correct registration of an 11-digit BVN or NIN string values.</p>
                      <form onSubmit={handleKycSubmit} className="flex gap-3 max-w-md">
                        <input 
                          type="text" 
                          maxLength={11}
                          placeholder={`Enter 11-Digit ${kycFormType}`}
                          value={kycDocValue}
                          onChange={(e) => setKycDocValue(e.target.value.replace(/\D/g, ''))}
                          className="flex-1 bg-neutral-900 border border-neutral-800 rounded px-3 py-1.5 font-mono text-sm focus:outline-none focus:border-emerald-500"
                        />
                        <button 
                          type="submit"
                          disabled={kycDocValue.length < 11}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-1.5 rounded text-xs transition-colors cursor-pointer disabled:opacity-50"
                        >
                          Submit
                        </button>
                        <button 
                          type="button"
                          onClick={() => setKycFormType(null)}
                          className="border border-neutral-800 hover:bg-neutral-800 px-3 py-1.5 rounded text-xs text-neutral-400"
                        >
                          Cancel
                        </button>
                      </form>
                    </motion.div>
                  )}

                  {/* GRID OF UTILITY VTU SERVICES */}
                  <div>
                    <h3 className="text-lg font-bold text-white mb-4">VTU & Financial Utility Services</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
                      
                      {/* Airtime */}
                      <button 
                        onClick={() => { setVtuFormType('airtime'); setSelectedNetwork('MTN'); }}
                        className="bg-neutral-950 hover:bg-neutral-900 p-4 rounded-xl border border-neutral-800 transition-all text-center flex flex-col items-center gap-2 cursor-pointer group"
                      >
                        <div className="w-10 h-10 bg-yellow-950/40 rounded-full flex items-center justify-center text-yellow-400 group-hover:scale-110 transition-transform">
                          <Smartphone className="w-5 h-5" />
                        </div>
                        <b className="text-xs text-neutral-300 block">Buy Airtime</b>
                        <span className="text-[9px] text-neutral-500 leading-none">2.5% Discount</span>
                      </button>

                      {/* Telecom Data */}
                      <button 
                        onClick={() => { setVtuFormType('data'); setSelectedNetwork('MTN'); }}
                        className="bg-neutral-950 hover:bg-neutral-900 p-4 rounded-xl border border-neutral-800 transition-all text-center flex flex-col items-center gap-2 cursor-pointer group"
                      >
                        <div className="w-10 h-10 bg-emerald-950/40 rounded-full flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                          <Wifi className="w-5 h-5" />
                        </div>
                        <b className="text-xs text-neutral-300 block">Buy Mobile Data</b>
                        <span className="text-[9px] text-neutral-500 leading-none">SME & Corporate</span>
                      </button>

                      {/* Cable Provider */}
                      <button 
                        onClick={() => setVtuFormType('cable')}
                        className="bg-neutral-950 hover:bg-neutral-900 p-4 rounded-xl border border-neutral-800 transition-all text-center flex flex-col items-center gap-2 cursor-pointer group"
                      >
                        <div className="w-10 h-10 bg-sky-950/40 rounded-full flex items-center justify-center text-sky-400 group-hover:scale-110 transition-transform">
                          <Tv className="w-5 h-5" />
                        </div>
                        <b className="text-xs text-neutral-300 block">Cable TV Bill</b>
                        <span className="text-[9px] text-neutral-500 leading-none">DSTV & GOTV</span>
                      </button>

                      {/* Power Disco */}
                      <button 
                        onClick={() => setVtuFormType('electricity')}
                        className="bg-neutral-950 hover:bg-neutral-900 p-4 rounded-xl border border-neutral-800 transition-all text-center flex flex-col items-center gap-2 cursor-pointer group"
                      >
                        <div className="w-10 h-10 bg-amber-950/40 rounded-full flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                          <Zap className="w-5 h-5" />
                        </div>
                        <b className="text-xs text-neutral-300 block">Power Electricity</b>
                        <span className="text-[9px] text-neutral-500 leading-none">All DISCO grids</span>
                      </button>

                      {/* Education Pin dispenser */}
                      <button 
                        onClick={() => setVtuFormType('education')}
                        className="bg-neutral-950 hover:bg-neutral-900 p-4 rounded-xl border border-neutral-800 transition-all text-center flex flex-col items-center gap-2 cursor-pointer group"
                      >
                        <div className="w-10 h-10 bg-rose-950/40 rounded-full flex items-center justify-center text-rose-400 group-hover:scale-110 transition-transform">
                          <GraduationCap className="w-5 h-5" />
                        </div>
                        <b className="text-xs text-neutral-300 block">Education PIN</b>
                        <span className="text-[9px] text-neutral-500 leading-none">WAEC & NECO</span>
                      </button>

                      {/* Reprint Card generation */}
                      <button 
                        onClick={() => { setVtuFormType('print_card'); setSelectedNetwork('MTN'); }}
                        className="bg-neutral-950 hover:bg-neutral-900 p-4 rounded-xl border border-neutral-800 transition-all text-center flex flex-col items-center gap-2 cursor-pointer group"
                      >
                        <div className="w-10 h-10 bg-purple-950/40 rounded-full flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                          <Hash className="w-5 h-5" />
                        </div>
                        <b className="text-xs text-neutral-300 block">Print PIN</b>
                        <span className="text-[9px] text-neutral-500 leading-none">Recharge Codes</span>
                      </button>

                      {/* Bulk Telecom broadcasts */}
                      <button 
                        onClick={() => setVtuFormType('bulk_services')}
                        className="bg-neutral-950 hover:bg-neutral-900 p-4 rounded-xl border border-neutral-800 transition-all text-center flex flex-col items-center gap-2 cursor-pointer group bg-neutral-900"
                      >
                        <div className="w-10 h-10 bg-neutral-800 rounded-full flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform border border-emerald-500/20">
                          <Users className="w-5 h-5" />
                        </div>
                        <b className="text-xs text-emerald-400 block font-bold">Bulk Services</b>
                        <span className="text-[9px] text-neutral-500 leading-none">Bulk SMS / Data</span>
                      </button>

                    </div>
                  </div>

                  {/* ACTIVE CUSTOMER MUTATION ACTIONS FORM PANEL */}
                  <AnimatePresence mode="wait">
                    {vtuFormType && (
                      <motion.div 
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 15 }}
                        className="bg-neutral-950 p-6 rounded-2xl border border-neutral-800 relative shadow-xl"
                      >
                        <button 
                          onClick={() => setVtuFormType(null)}
                          className="absolute right-4 top-4 text-neutral-500 hover:text-neutral-300 text-sm font-semibold cursor-pointer"
                        >
                          ✕ Close Form
                        </button>

                        <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2 capitalize">
                          {vtuFormType === 'print_card' ? 'Dispense Recharge PIN Ticket' :
                           vtuFormType === 'bulk_services' ? 'Bulk Airtime & Bulk SMS Distribution Node' :
                           `Configure billing checkout: ${vtuFormType}`}
                        </h3>
                        <p className="text-xs text-neutral-400 mb-6">Process billing directly against local firestore balances using real-time API routes failover trackers.</p>

                        <form onSubmit={processVTUPurchase} className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl">
                          
                          {/* Left inputs config context */}
                          <div className="space-y-4 md:col-span-2">
                            
                            {/* Operator Selector context */}
                            {(vtuFormType === 'airtime' || vtuFormType === 'data' || vtuFormType === 'print_card') && (
                              <div>
                                <label className="text-xs text-neutral-400 block mb-1.5 font-semibold">Select Telecommunication Network</label>
                                <div className="grid grid-cols-4 gap-2">
                                  {['MTN', 'Airtel', 'Glo', '9mobile'].map(network => (
                                    <button 
                                      key={network} 
                                      type="button"
                                      onClick={() => setSelectedNetwork(network)}
                                      className={`py-2 px-1 rounded-lg text-xs font-bold text-center border capitalize transition-colors cursor-pointer ${
                                        selectedNetwork === network ? 
                                        'bg-emerald-950 border-emerald-500 text-emerald-400' : 
                                        'bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                                      }`}
                                    >
                                      {network}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Standard Billing fields mapping */}
                            {vtuFormType === 'airtime' && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                  <label className="text-xs text-neutral-400 block mb-1">Recipient Mobile String</label>
                                  <input 
                                    type="text" 
                                    placeholder="e.g. 08033214567"
                                    value={recipientNumber} 
                                    onChange={(e) => setRecipientNumber(e.target.value.replace(/\D/g, ''))}
                                    className="w-full bg-neutral-900 border border-neutral-800 rounded px-3 py-2 text-sm text-neutral-200 focus:outline-none focus:border-emerald-500"
                                    required
                                  />
                                </div>
                                <div>
                                  <label className="text-xs text-neutral-400 block mb-1">Top-Up Amount (NGN)</label>
                                  <input 
                                    type="number" 
                                    placeholder="e.g. 500"
                                    value={amountInput} 
                                    onChange={(e) => setAmountInput(e.target.value)}
                                    className="w-full bg-neutral-900 border border-neutral-800 rounded px-3 py-2 text-sm text-neutral-200 focus:outline-none focus:border-emerald-500 font-mono"
                                    required
                                  />
                                </div>
                              </div>
                            )}

                            {vtuFormType === 'data' && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                  <label className="text-xs text-neutral-400 block mb-1">Recipient Mobile String</label>
                                  <input 
                                    type="text" 
                                    placeholder="e.g. 08033214567"
                                    value={recipientNumber} 
                                    onChange={(e) => setRecipientNumber(e.target.value.replace(/\D/g, ''))}
                                    className="w-full bg-neutral-900 border border-neutral-800 rounded px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                                    required
                                  />
                                </div>
                                <div>
                                  <label className="text-xs text-neutral-400 block mb-1">Select Active SME Data Plan</label>
                                  <select 
                                    value={dataPlan}
                                    onChange={(e) => {
                                      setDataPlan(e.target.value);
                                      const parts = e.target.value.match(/N([\d,]+)/);
                                      if (parts) setAmountInput(parts[1].replace(/,/g, ''));
                                    }}
                                    className="w-full bg-neutral-900 border border-neutral-800 rounded px-2 py-2 text-sm text-neutral-200 focus:outline-none focus:border-emerald-500"
                                  >
                                    <option value="1.5GB SME - 30 days (N350)">1.5GB SME - 30 days (N350)</option>
                                    <option value="3GB Corporate - 30 days (N750)">3GB Corporate - 30 days (N750)</option>
                                    <option value="5GB Gifting - 30 days (N1,200)">5GB Gifting - 30 days (N1,200)</option>
                                    <option value="10GB Corporate SME (N2,400)">10GB Corporate SME (N2,400)</option>
                                  </select>
                                </div>
                              </div>
                            )}

                            {vtuFormType === 'cable' && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                  <label className="text-xs text-neutral-400 block mb-1">Select Cable Provider</label>
                                  <select 
                                    value={cableService} 
                                    onChange={(e) => setCableService(e.target.value)}
                                    className="w-full bg-neutral-900 border border-neutral-800 rounded px-2 py-2 text-sm text-neutral-200 focus:outline-none focus:border-emerald-500"
                                  >
                                    <option value="DSTV">DSTV Premium</option>
                                    <option value="GOTV">GOTV Nigeria</option>
                                    <option value="StarTimes">StarTimes Classic</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="text-xs text-neutral-400 block mb-1">SmartCard Meter Number</label>
                                  <input 
                                    type="text" 
                                    placeholder="Enter SmartCard/IUC Code"
                                    value={smartCardNo} 
                                    onChange={(e) => {
                                      setSmartCardNo(e.target.value.replace(/\D/g, ''));
                                      setAmountInput('6500'); // Default compact bouquet cost
                                    }}
                                    className="w-full bg-neutral-900 border border-neutral-800 rounded px-3 py-2 text-sm text-neutral-200 focus:outline-none focus:border-emerald-500 font-mono"
                                    required
                                  />
                                </div>
                              </div>
                            )}

                            {vtuFormType === 'electricity' && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                  <label className="text-xs text-neutral-400 block mb-1">Select Nigeria DISCO Provider</label>
                                  <select 
                                    value={discoProvider} 
                                    onChange={(e) => setDiscoProvider(e.target.value)}
                                    className="w-full bg-neutral-900 border border-neutral-800 rounded px-2 py-2 text-sm text-neutral-200 focus:outline-none focus:border-emerald-500"
                                  >
                                    <option value="Ikeja Electric (IKEDC)">Ikeja Electric (IKEDC)</option>
                                    <option value="Eko Electric (EKEDC)">Eko Electric (EKEDC)</option>
                                    <option value="Abuja Electric (AEDC)">Abuja Electric (AEDC)</option>
                                    <option value="Kano Electric (KEDCO)">Kano Electric (KEDCO)</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="text-xs text-neutral-400 block mb-1">Meter ID Account Number</label>
                                  <input 
                                    type="text" 
                                    placeholder="11 or 13 digits ID"
                                    value={meterNo} 
                                    onChange={(e) => setMeterNo(e.target.value.replace(/\D/g, ''))}
                                    className="w-full bg-neutral-900 border border-neutral-800 rounded px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 font-mono"
                                    required
                                  />
                                </div>
                                <div className="sm:col-span-2">
                                  <label className="text-xs text-neutral-400 block mb-1">Meter Refill Purchase Value (NGN)</label>
                                  <input 
                                    type="number" 
                                    placeholder="Input electricity purchase val, e.g. 5000"
                                    value={amountInput} 
                                    onChange={(e) => setAmountInput(e.target.value)}
                                    className="w-full bg-neutral-900 border border-neutral-800 rounded px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                                    required
                                  />
                                </div>
                              </div>
                            )}

                            {vtuFormType === 'education' && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                  <label className="text-xs text-neutral-400 block mb-1">Select Exam Body</label>
                                  <select 
                                    value={examProvider} 
                                    onChange={(e) => {
                                      setExamProvider(e.target.value);
                                      setAmountInput(e.target.value === 'JAMB' ? '4000' : '3500');
                                    }}
                                    className="w-full bg-neutral-900 border border-neutral-800 rounded px-2 py-2 text-sm focus:outline-none"
                                  >
                                    <option value="WAEC">WAEC (N3,500)</option>
                                    <option value="NECO">NECO (N3,500)</option>
                                    <option value="JAMB">JAMB (N4,000)</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="text-xs text-neutral-400 block mb-1">Number of Card PINs Requested</label>
                                  <input 
                                    type="number" 
                                    min={1} 
                                    max={5}
                                    value={noOfPins} 
                                    onChange={(e) => {
                                      const nVal = parseInt(e.target.value) || 1;
                                      setNoOfPins(nVal);
                                      const basePrice = examProvider === 'JAMB' ? 4000 : 3500;
                                      setAmountInput((basePrice * nVal).toString());
                                    }}
                                    className="w-full bg-neutral-900 border border-neutral-800 rounded px-3 py-2 text-sm focus:outline-none text-neutral-200"
                                    required
                                  />
                                </div>
                              </div>
                            )}

                            {vtuFormType === 'print_card' && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                  <label className="text-xs text-neutral-400 block mb-1">Select Nominal Print Denomination</label>
                                  <select 
                                    onChange={(e) => setAmountInput(e.target.value)}
                                    className="w-full bg-neutral-900 border border-neutral-800 rounded px-2 py-2 text-sm focus:outline-none"
                                    required
                                  >
                                    <option value="">Select Denomination</option>
                                    <option value="100">100 Value Card</option>
                                    <option value="200">200 Value Card</option>
                                    <option value="500">500 Value Card</option>
                                    <option value="1000">1000 Value Card</option>
                                  </select>
                                </div>
                                <div>
                                  <span className="text-[10px] text-yellow-400 bg-yellow-950/40 p-2 text-xs rounded border border-yellow-500/20 block">
                                    Offline recharging print PIN generates printable local tickets immediately. Keeping commission splits.
                                  </span>
                                </div>
                              </div>
                            )}

                            {vtuFormType === 'bulk_services' && (
                              <div className="space-y-3">
                                <div>
                                  <label className="text-xs text-neutral-400 block mb-1">Bulk Telecommunication type</label>
                                  <div className="flex gap-4">
                                    <label className="flex items-center gap-2 text-xs text-neutral-300">
                                      <input type="radio" checked={bulkServiceType === 'airtime'} onChange={() => setBulkServiceType('airtime')} />
                                      <span>Bulk Airtime</span>
                                    </label>
                                    <label className="flex items-center gap-2 text-xs text-neutral-300">
                                      <input type="radio" checked={bulkServiceType === 'data'} onChange={() => setBulkServiceType('data')} />
                                      <span>Bulk SME Data Packages</span>
                                    </label>
                                  </div>
                                </div>

                                <div>
                                  <label className="text-xs text-neutral-400 block mb-1">Enter Recipients Mobile String list (separated by commas)</label>
                                  <textarea 
                                    placeholder="08033221144, 08122334455, 09055667788"
                                    value={bulkNumbers}
                                    onChange={(e) => {
                                      setBulkNumbers(e.target.value);
                                      const lines = e.target.value.split(',').filter(x => x.trim().length > 6);
                                      setAmountInput((lines.length * 500).toString()); // N500 per recipient
                                    }}
                                    rows={3}
                                    className="w-full bg-neutral-900 border border-neutral-800 rounded px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 text-neutral-200"
                                    required
                                  />
                                  <span className="text-[10px] text-sky-400 mt-1 block">Pricing estimate base: N500 per parsed mobile record.</span>
                                </div>
                              </div>
                            )}

                          </div>

                          {/* Right static summaries & checkout trigger */}
                          <div className="bg-neutral-900 p-5 rounded-xl border border-neutral-800 flex flex-col justify-between">
                            <div className="space-y-4">
                              <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-500 block">DURABLE LEDGER SUMMARIES</span>
                              
                              <div className="space-y-1.5 text-xs">
                                <div className="flex justify-between items-center">
                                  <span className="text-neutral-400">Total Purchase:</span>
                                  <span className="font-bold text-neutral-200">N{(parseFloat(amountInput) || 0).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center text-[11px] text-emerald-400 border-t border-neutral-800 pt-1.5">
                                  <span>Agent Commission Back:</span>
                                  <span>
                                    +N{(
                                      (parseFloat(amountInput) || 0) * 
                                      (vtuFormType === 'airtime' ? (vtuConfig.airtimeDiscountPercent / 100) : 
                                       vtuFormType === 'data' ? (vtuConfig.dataProfitMarginPercent / 100) : 0.02)
                                    ).toFixed(2)}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center text-[10px] text-neutral-500 pt-1">
                                  <span>Active Gateway Route:</span>
                                  <span className="font-bold uppercase text-emerald-500 animate-pulse">{vtuConfig.primaryProvider}</span>
                                </div>
                              </div>
                            </div>

                            <button 
                              type="submit"
                              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 px-4 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 mt-6 shadow-lg shadow-emerald-950/40"
                            >
                              <Check className="w-4 h-4" />
                              <span>Authorize & Dispense</span>
                            </button>
                          </div>

                        </form>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* TRANSACTION LISTS LEDGER GRIDS */}
                  <div className="bg-neutral-950 p-6 rounded-2xl border border-neutral-800 space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                      <div>
                        <h3 className="text-lg font-bold text-white">Your Wallet Transactions Logs</h3>
                        <p className="text-xs text-neutral-400">Chronological list of all dynamic top-ups, transfers and deposits.</p>
                      </div>

                      {/* Ledger category filters */}
                      <div className="flex flex-wrap gap-1 bg-neutral-900 p-1 rounded-lg border border-neutral-800">
                        {['all', 'funding', 'airtime', 'data', 'cable', 'electricity', 'transfer'].map(cat => (
                          <button 
                            key={cat}
                            onClick={() => setTransactionFilter(cat)}
                            className={`px-3 py-1 text-[11px] rounded transition-colors capitalize cursor-pointer ${
                              transactionFilter === cat ? 'bg-emerald-600 text-white font-semibold' : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Table or Empty indicator */}
                    <div className="overflow-x-auto">
                      {filteredTransactions.length === 0 ? (
                        <div className="text-center py-12 text-neutral-500">
                          <Clock className="w-8 h-8 mx-auto mb-2 text-neutral-700" />
                          <p className="text-xs">No matching transactions found on this account ledger.</p>
                        </div>
                      ) : (
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="border-b border-neutral-800 text-neutral-500 font-mono">
                              <th className="py-3 px-4">TX REF</th>
                              <th className="py-3 px-4">ITEM TYPE</th>
                              <th className="py-3 px-4 text-right">GROSS AMOUNT</th>
                              <th className="py-3 px-4">BENEFICIARY RECIPIENT</th>
                              <th className="py-3 px-4">MUTATION TIME</th>
                              <th className="py-3 px-4 text-center">ACTION</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-neutral-900">
                            {filteredTransactions.map(tx => (
                              <tr key={tx.transactionId} className="hover:bg-neutral-900/40 transition-colors">
                                <td className="py-3 px-4 font-mono font-bold text-neutral-300">
                                  {tx.transactionId}
                                </td>
                                <td className="py-3 px-4">
                                  <div className="flex items-center gap-2">
                                    <span className={`w-2 h-2 rounded-full ${
                                      tx.type === 'funding' ? 'bg-emerald-400' :
                                      tx.type === 'airtime' ? 'bg-yellow-400' :
                                      tx.type === 'data' ? 'bg-indigo-400' : 'bg-pink-400'
                                    }`}></span>
                                    <span className="capitalize font-medium text-neutral-200">{tx.type.replace('_', ' ')}</span>
                                  </div>
                                </td>
                                <td className={`py-3 px-4 text-right font-bold font-mono ${
                                  tx.type === 'funding' ? 'text-emerald-400' : 'text-neutral-200'
                                }`}>
                                  {tx.type === 'funding' ? '+' : '-'}N{tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </td>
                                <td className="py-3 px-4 text-neutral-400 max-w-xs truncate">
                                  {tx.recipient}
                                </td>
                                <td className="py-3 px-4 text-neutral-500">
                                  {new Date(tx.createdAt).toLocaleString()}
                                </td>
                                <td className="py-3 px-4 text-center">
                                  <button 
                                    onClick={() => setSelectedReceipt(tx)}
                                    className="text-emerald-500 hover:text-emerald-400 hover:underline cursor-pointer"
                                  >
                                    View Receipt
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>

                </div>
              )}

              {/* PORTAL VIEW 2: AGENT MANAGEMENT PORTALS */}
              {activePortal === 'agent_portal' && (
                <div className="space-y-6">
                  
                  {currentAgentProfile ? (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        
                        {/* Commission reserve box */}
                        <div className="bg-gradient-to-br from-neutral-950 to-sky-950 p-6 rounded-2xl border border-sky-500/30">
                          <span className="text-xs text-neutral-400 block font-mono">AVAILABLE COMMISSION RESERVES</span>
                          <h3 className="text-2xl font-black text-white mt-1">N{currentAgentProfile.commissionBalance.toLocaleString()}</h3>
                          <p className="text-[10px] text-sky-400 mt-2">Earned automatically via downstream API recharge brokers.</p>
                          
                          <button 
                            onClick={handleCommissionWithdrawal}
                            disabled={currentAgentProfile.commissionBalance <= 0}
                            className="bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-bold py-2 px-4 rounded-xl text-xs transition-colors mt-4 w-full cursor-pointer flex items-center justify-center gap-1"
                          >
                            <TrendingUp className="w-3.5 h-3.5" />
                            <span>Disburse to Spend Account</span>
                          </button>
                        </div>

                        {/* Tier Rankings box */}
                        <div className="bg-neutral-950 p-6 rounded-2xl border border-neutral-800 text-center flex flex-col justify-center items-center">
                          <Award className="w-8 h-8 text-yellow-400 mb-2 animate-pulse" />
                          <span className="text-xs text-neutral-500 uppercase tracking-widest font-mono">Agent Performance Rank</span>
                          <h4 className="text-xl font-bold uppercase text-white mt-1">{currentAgentProfile.agentTier} Level</h4>
                          <span className="text-[10px] text-zinc-400 mt-0.5">Eligible 2.5% general payout split fee</span>
                        </div>

                        {/* Network volume parameters */}
                        <div className="bg-neutral-950 p-6 rounded-2xl border border-neutral-800 text-center flex flex-col justify-center items-center">
                          <Activity className="w-8 h-8 text-emerald-400 mb-2" />
                          <span className="text-xs text-neutral-500 uppercase tracking-widest font-mono">Monthly Telecom Volume</span>
                          <h4 className="text-xl font-bold text-white mt-1">N{currentAgentProfile.monthlyVolume.toLocaleString()}</h4>
                          <span className="text-[10px] text-zinc-400 mt-0.5">Required for tier upgrades: N1.5M</span>
                        </div>

                        {/* Invited Network count */}
                        <div className="bg-neutral-950 p-6 rounded-2xl border border-neutral-800 text-center flex flex-col justify-center items-center">
                          <Users className="w-8 h-8 text-sky-400 mb-2" />
                          <span className="text-xs text-neutral-500 uppercase tracking-widest font-mono">Referred Active Accounts</span>
                          <h4 className="text-xl font-bold text-white mt-1">{currentAgentProfile.refereeCountyKey || currentAgentProfile.refereeCount} Members</h4>
                          <span className="text-[10px] text-zinc-400 mt-0.5">Tier 2 Multi-level invitees tree</span>
                        </div>

                      </div>

                      {/* MULTI_LEVEL REFERRAL VISUAL MATRIX SCREEN */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-neutral-950 p-6 rounded-2xl border border-neutral-800 space-y-4">
                          <h4 className="text-sm font-bold text-white">Multi-Level Payout Split Commission Scheme</h4>
                          <p className="text-xs text-neutral-400 leading-relaxed">
                            Apex VTU runs an attribute-based multi-tier compensation ledger. Every time your direct referrals or indirect subnet (Level 2) perform a mobile topup or pay utility power bills, the firestore.rules atomically direct a split back commission to your wallet.
                          </p>

                          <div className="space-y-2 text-xs">
                            <div className="bg-neutral-900 p-3 rounded-lg flex justify-between items-center border border-neutral-800">
                              <div>
                                <span className="font-bold text-neutral-200">Level 1 - Direct inviting (Tier 1)</span>
                                <p className="text-[10px] text-neutral-500">Referees joining via your referral link</p>
                              </div>
                              <span className="font-mono text-emerald-400 font-bold">15% Split back</span>
                            </div>

                            <div className="bg-neutral-900 p-3 rounded-lg flex justify-between items-center border border-neutral-800">
                              <div>
                                <span className="font-bold text-neutral-200">Level 2 - Indirect network (Tier 2)</span>
                                <p className="text-[10px] text-neutral-500">Accounts signed by your invitees partners</p>
                              </div>
                              <span className="font-mono text-emerald-400 font-bold">5% Split back</span>
                            </div>
                          </div>
                        </div>

                        {/* Invitation stats lists */}
                        <div className="bg-neutral-950 p-6 rounded-2xl border border-neutral-800 space-y-4">
                          <h4 className="text-sm font-bold text-white">Your Network Partner Tree Accounts</h4>
                          
                          <div className="space-y-3">
                            {users.filter(u => u.referredBy === currentUser.referralCode).length === 0 ? (
                              <div className="text-center py-6 text-neutral-500 text-xs">
                                No direct referees registered yet. Share your code to build your network!
                              </div>
                            ) : (
                              users.filter(u => u.referredBy === currentUser.referralCode).map(referee => (
                                <div key={referee.userId} className="bg-neutral-900/60 p-3 rounded-xl border border-neutral-800 flex justify-between items-center text-xs">
                                  <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 bg-sky-950 text-sky-400 rounded-full flex items-center justify-center font-bold">
                                      {referee.fullName.charAt(0)}
                                    </div>
                                    <div>
                                      <p className="font-semibold text-neutral-200">{referee.fullName}</p>
                                      <span className="text-[10px] text-neutral-500 uppercase">{referee.role}</span>
                                    </div>
                                  </div>

                                  <div className="text-right">
                                    <span className="text-[10px] bg-sky-900/40 text-sky-400 px-2 py-0.5 rounded font-bold border border-sky-500/20 capitalize">
                                      {referee.kycLevel} verified
                                    </span>
                                    <span className="text-[9px] text-neutral-500 block mt-1">Joined: {new Date(referee.createdAt).toLocaleDateString()}</span>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="bg-neutral-950 p-8 rounded-2xl border border-neutral-800 text-center py-16">
                      <Award className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
                      <h3 className="text-lg font-bold text-white">Join the Telecom Agent Business Group</h3>
                      <p className="text-xs text-neutral-400 max-w-md mx-auto mt-1 leading-relaxed">
                        Earn passive payouts on high-volume SME data distributions and bill recharges. This profile does not have an active Agent profile linked. Select an Agent simulation user context in the side panel.
                      </p>
                    </div>
                  )}

                </div>
              )}

              {/* PORTAL VIEW 3: SUPER ADMINISTRATIVE CONSOLE */}
              {activePortal === 'super_admin' && (
                <div className="space-y-6">
                  
                  {/* Revenue Summary cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-neutral-950 p-5 rounded-2xl border border-neutral-800">
                      <span className="text-[10px] font-mono text-neutral-500 uppercase">Gross Platform Sales volume</span>
                      <h4 className="text-2xl font-bold text-white mt-1">N{platformStats.totalSales.toLocaleString()}</h4>
                      <div className="flex gap-1 items-center text-[10px] text-emerald-400 mt-2">
                        <TrendingUp className="w-3.5 h-3.5 animate-bounce" />
                        <span>Daily volume target reach: 85%</span>
                      </div>
                    </div>

                    <div className="bg-neutral-950 p-5 rounded-2xl border border-neutral-800">
                      <span className="text-[10px] font-mono text-neutral-500 uppercase">Discount Profit Margin Keep</span>
                      <h4 className="text-2xl font-bold text-emerald-400 mt-1">N{platformStats.totalCommissions.toLocaleString()}</h4>
                      <p className="text-[10px] text-neutral-500 mt-2">Aggregated administrator markup revenues.</p>
                    </div>

                    <div className="bg-neutral-950 p-5 rounded-2xl border border-neutral-800">
                      <span className="text-[10px] font-mono text-neutral-500 uppercase">System Active API Routes</span>
                      <h4 className="text-lg font-bold uppercase text-white mt-1.5 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        <span>{vtuConfig.primaryProvider} ACTIVE</span>
                      </h4>
                      <p className="text-[10px] text-[10px] text-neutral-500 mt-2">Automatic failover to <b>{vtuConfig.backupProvider}</b> on timeout.</p>
                    </div>

                    <div className="bg-neutral-950 p-5 rounded-2xl border border-neutral-800">
                      <span className="text-[10px] font-mono text-neutral-500 uppercase">Self-Triggered Failovers</span>
                      <h4 className="text-2xl font-bold text-yellow-400 mt-1">{platformStats.totalRechargeFailovers} Logs</h4>
                      <p className="text-[10px] text-neutral-500 mt-2">API switches executed securely today.</p>
                    </div>
                  </div>

                  {/* VTU API Configuration settings module */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    <div className="bg-neutral-950 p-6 rounded-2xl border border-neutral-800 space-y-4">
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <Sliders className="w-4 h-4 text-emerald-400" />
                        <span>Automated Failover Router API Configurations</span>
                      </h3>
                      <p className="text-xs text-neutral-400 leading-relaxed">
                        Specify fallback configurations. If the primary VTU network times out or drops code 503, our background Cloud Functions automatically redirect queries to prevent merchant downtime.
                      </p>

                      <div className="space-y-3 text-xs">
                        <div>
                          <label className="text-[10px] text-neutral-500 uppercase block mb-1">Primary VTU Vendor Routing</label>
                          <select 
                            value={vtuConfig.primaryProvider}
                            onChange={(e) => setVtuConfig(prev => ({ ...prev, primaryProvider: e.target.value as any }))}
                            className="w-full bg-neutral-900 border border-neutral-800 p-2 rounded focus:outline-none"
                          >
                            <option value="VTU_NG">VTU.ng Gateway API</option>
                            <option value="VTUGATE">VTUGATE Core API</option>
                            <option value="SME_API">SME Telecoin Broker API</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[10px] text-neutral-500 uppercase block mb-1">Secondary Backup Failover Vendor Routing</label>
                          <select 
                            value={vtuConfig.backupProvider}
                            onChange={(e) => setVtuConfig(prev => ({ ...prev, backupProvider: e.target.value as any }))}
                            className="w-full bg-neutral-900 border border-neutral-800 p-2 rounded focus:outline-none"
                          >
                            <option value="VTU_NG">VTU.ng Gateway API</option>
                            <option value="VTUGATE">VTUGATE Core API</option>
                            <option value="SME_API">SME Telecoin Broker API</option>
                          </select>
                        </div>

                        <div className="flex justify-between items-center p-2.5 bg-neutral-900 rounded border border-neutral-800">
                          <div>
                            <span className="font-bold block text-neutral-200">Automatic API Failover Switch loops</span>
                            <span className="text-[10px] text-neutral-500">Bypasses offline vendor enclaves instantly</span>
                          </div>
                          <input 
                            type="checkbox" 
                            checked={vtuConfig.autoFailoverEnabled}
                            onChange={(e) => setVtuConfig(prev => ({ ...prev, autoFailoverEnabled: e.target.checked }))}
                            className="w-4 h-4 rounded text-emerald-600 focus:ring-0 cursor-pointer"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-2">
                          <div>
                            <label className="text-[10px] text-neutral-500 block mb-1">Airtime Discount markup (%)</label>
                            <input 
                              type="number" 
                              step="0.1" 
                              value={vtuConfig.airtimeDiscountPercent}
                              onChange={(e) => setVtuConfig(prev => ({ ...prev, airtimeDiscountPercent: parseFloat(e.target.value) || 2.0 }))}
                              className="w-full bg-neutral-900 border border-neutral-800 p-2 text-center rounded text-neutral-200"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-neutral-500 block mb-1">Data SME Profit margin (%)</label>
                            <input 
                              type="number" 
                              step="0.1" 
                              value={vtuConfig.dataProfitMarginPercent}
                              onChange={(e) => setVtuConfig(prev => ({ ...prev, dataProfitMarginPercent: parseFloat(e.target.value) || 4.0 }))}
                              className="w-full bg-neutral-900 border border-neutral-800 p-2 text-center rounded text-neutral-200"
                            />
                          </div>
                        </div>

                      </div>
                    </div>

                    {/* Pending BVN/NIN Document Approval lists */}
                    <div className="bg-neutral-950 p-6 rounded-2xl border border-neutral-800 space-y-4">
                      <div>
                        <h3 className="text-sm font-bold text-white flex items-center gap-2">
                          <UserCheck className="w-4 h-4 text-emerald-400" />
                          <span>KYC BVN/NIN Document Approvals Queue</span>
                        </h3>
                        <p className="text-xs text-neutral-400">Review submitted legal credentials and upgrade consumer limits.</p>
                      </div>

                      <div className="space-y-3">
                        {users.filter(u => u.kycLevel === 'pending').length === 0 ? (
                          <div className="text-center py-12 text-neutral-600 text-xs">
                            <CheckCircle className="w-8 h-8 text-neutral-800 mx-auto mb-2" />
                            <span>Verification approvals queue is empty. Real-time compliant!</span>
                          </div>
                        ) : (
                          users.filter(u => u.kycLevel === 'pending').map(u => (
                            <div key={u.userId} className="bg-neutral-900 p-4 rounded-xl border border-neutral-800 space-y-3">
                              <div className="flex justify-between text-xs items-start">
                                <div>
                                  <b className="text-neutral-200 text-sm block">{u.fullName}</b>
                                  <span className="text-[10px] text-neutral-500 block">User ID: {u.userId} | Phone: {u.phone}</span>
                                </div>
                                <span className="bg-yellow-950 text-yellow-400 px-2.5 py-0.5 rounded text-[10px] font-bold border border-yellow-500/20">Awaiting Check</span>
                              </div>

                              <div className="bg-neutral-950 p-2.5 rounded border border-neutral-800 flex justify-between gap-1 text-[10px]">
                                <div>
                                  <span className="text-neutral-500 block">BVN Value:</span>
                                  <span className="font-mono text-zinc-300 font-bold">{u.bvn || 'Not Uploaded'}</span>
                                </div>
                                <div>
                                  <span className="text-neutral-500 block">NIN Value:</span>
                                  <span className="font-mono text-zinc-300 font-bold">{u.nin || 'Not Uploaded'}</span>
                                </div>
                              </div>

                              <div className="flex gap-2 justify-end">
                                <button 
                                  onClick={() => handleAdminApproveKyc(u.userId, 'tier3')}
                                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] px-3 py-1.5 rounded transition-colors cursor-pointer"
                                >
                                  Approve Verified Tier-3
                                </button>
                                <button 
                                  onClick={() => {
                                    setUsers(prev => prev.map(usr => {
                                      if (usr.userId === u.userId) {
                                        return { ...usr, kycLevel: 'unverified', bvn: undefined, nin: undefined };
                                      }
                                      return usr;
                                    }));
                                    pushAuditLog("ADMIN_REJECTED_KYC_UPGRADE", u.userId);
                                    showAlert("KYC request rejected. BVN details wiped.", "info");
                                  }}
                                  className="border border-rose-500/30 hover:bg-rose-950/40 text-rose-300 font-bold text-[10px] px-3 py-1.5 rounded transition-colors cursor-pointer"
                                >
                                  Reject & Back to Unverified
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                  </div>

                  {/* USER MANAGEMENT & MANUAL ADJUSTMENTS GRID */}
                  <div className="bg-neutral-950 p-6 rounded-2xl border border-neutral-800 space-y-4">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Database className="w-4 h-4 text-indigo-400" />
                      <span>Platform Registries Management Ledger</span>
                    </h3>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-neutral-800 text-neutral-500 font-mono">
                            <th className="py-2.5 px-3">REGISTERED USER</th>
                            <th className="py-2.5 px-3">ROLE ENVELOPE</th>
                            <th className="py-2.5 px-3">KYC VERIFICATION</th>
                            <th className="py-2.5 px-3 text-right">spending wallet balance</th>
                            <th className="py-2.5 px-3 text-center">ACCOUNT LOCK CONTROLS</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-900">
                          {users.map(u => {
                            const userWallet = wallets[u.userId];
                            return (
                              <tr key={u.userId} className="hover:bg-neutral-900/30">
                                <td className="py-3 px-3">
                                  <b className="text-neutral-200 block">{u.fullName}</b>
                                  <span className="text-[10px] text-neutral-500 font-mono">{u.email}</span>
                                </td>
                                <td className="py-3 px-3">
                                  <span className="bg-neutral-900 border border-neutral-800 px-2 py-0.5 rounded text-[10px] uppercase font-mono text-zinc-300">
                                    {u.role.replace('_', ' ')}
                                  </span>
                                </td>
                                <td className="py-3 px-3 capitalize">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                    u.kycLevel === 'tier3' ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/25' :
                                    u.kycLevel === 'tier2' ? 'bg-sky-950 text-sky-400 border border-sky-500/25' : 'bg-rose-950 text-rose-400 border border-rose-500/25'
                                  }`}>
                                    {u.kycLevel}
                                  </span>
                                </td>
                                <td className="py-3 px-3 text-right text-sm font-bold font-mono text-neutral-200">
                                  N{userWallet ? userWallet.balance.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '0.00'}
                                </td>
                                <td className="py-3 px-3 text-center">
                                  <div className="flex items-center justify-center gap-2">
                                    <button 
                                      onClick={() => {
                                        const value = parseFloat(prompt("Enter amount to manually credit into this user balance in NGN:", "10000") || '0');
                                        if (value && userWallet) {
                                          setWallets(prev => ({
                                            ...prev,
                                            [u.userId]: { ...prev[u.userId], balance: prev[u.userId].balance + value }
                                          }));
                                          pushAuditLog(`ADMIN_MANUALLY_CREDITED_${value}_TO_${u.userId}`);
                                          showAlert(`Manually allocated +N${value.toLocaleString()} to ${u.fullName}`, "success");
                                        }
                                      }}
                                      className="bg-neutral-900 text-[10px] hover:bg-neutral-800 text-neutral-300 border border-neutral-800 px-2 py-1 rounded transition-colors"
                                    >
                                      Adjust wallet
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* INTRUSION AUDIT TRAILS & SYSTEM ERROR LOGS */}
                  <div className="bg-neutral-950 p-6 rounded-2xl border border-neutral-800 space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-sm font-bold text-white flex items-center gap-2">
                          <Activity className="w-4 h-4 text-rose-400" />
                          <span>Cyber Intrusion Audit Trails & failed logs</span>
                        </h3>
                        <p className="text-xs text-neutral-400">Live security-enclave telemetry tracking failovers and hardware binding failures.</p>
                      </div>

                      <button 
                        onClick={() => {
                          setAuditLogs(seedAuditLogs);
                          showAlert("Telemetry records synchronized with hardware.", "info");
                        }}
                        className="text-neutral-500 hover:text-emerald-400 transition-colors"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="bg-neutral-900 p-4 rounded-xl border border-neutral-800 max-h-56 overflow-y-auto space-y-1 text-[11px] font-mono">
                      {auditLogs.map((log, i) => (
                        <div key={log.logId} className="flex justify-between py-1 border-b border-neutral-950/50">
                          <div>
                            <span className="text-neutral-500">[{new Date(log.createdAt).toLocaleTimeString()}]</span>{" "}
                            <span className={`font-bold ${
                              log.action.includes('FAIL') || log.action.includes('REJECTED') ? 'text-rose-400' :
                              log.action.includes('FAILover') ? 'text-amber-400' : 'text-emerald-400'
                            }`}>{log.action}</span>{" "}
                            <span className="text-neutral-400 font-sans">by user: {log.userId}</span>
                          </div>
                          <span className="text-neutral-500 truncate max-w-xs">{log.ipAddress}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}

              {/* PORTAL VIEW 4: SOURCE EXPORT / DEVELOPER FILES HUB */}
              {activePortal === 'code_export' && (
                <div className="space-y-6">
                  
                  <div className="bg-neutral-950 p-6 rounded-2xl border border-neutral-800 space-y-3">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <DownloadCloud className="w-5 h-5 text-emerald-400" />
                      <span>Dynamic Android & Flutter Source Code Resource Center</span>
                    </h3>
                    <p className="text-xs text-neutral-400 leading-relaxed">
                      All VTU services from this web app interface are synchronized back to clean Dart/Flutter files below. Use them to bundle standalone APK packages for Play Store deployments, configure serverless Google Cloud Function hooks, or audit production-ready Firestore rulesets!
                    </p>
                  </div>

                  {/* Switcher tabs */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
                    
                    {/* Left files column selector */}
                    <div className="space-y-2">
                      <span className="text-[10px] uppercase font-mono text-neutral-500 block font-semibold px-1">Source Code Explorer</span>
                      
                      {exportFiles.map(file => (
                        <button 
                          key={file.filename}
                          onClick={() => setSelectedExportFile(file.filename)}
                          className={`w-full p-3 rounded-xl border text-left text-xs transition-colors cursor-pointer flex justify-between gap-1 items-center ${
                            selectedExportFile === file.filename ? 'bg-emerald-950 border-emerald-500 text-emerald-400 font-bold' : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700 text-neutral-300'
                          }`}
                        >
                          <div className="truncate">
                            <span className="block font-semibold truncate text-[11px]">{file.filename}</span>
                            <span className="text-[9px] text-neutral-500 truncate block mt-0.5">{file.description}</span>
                          </div>
                          <b className="uppercase text-[8px] px-1 py-0.5 rounded bg-neutral-900 border text-neutral-400 shrink-0 select-none">
                            {file.language}
                          </b>
                        </button>
                      ))}
                    </div>

                    {/* Right responsive code content */}
                    <div className="md:col-span-3 space-y-4">
                      
                      {exportFiles.filter(f => f.filename === selectedExportFile).map(file => (
                        <div key={file.filename} className="bg-neutral-950 rounded-2xl border border-neutral-800 overflow-hidden shadow-xl flex flex-col">
                          
                          {/* File header bar */}
                          <div className="bg-neutral-900 px-5 py-3 border-b border-neutral-800 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                              <span className="font-mono text-xs font-bold text-neutral-200">{file.filename}</span>
                            </div>
                            
                            <button 
                              onClick={() => {
                                navigator.clipboard.writeText(file.code);
                                showAlert(`${file.filename} copied into clipboard!`, "success");
                              }}
                              className="bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1"
                            >
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy Code Snippet</span>
                            </button>
                          </div>

                          {/* Codeline body pre */}
                          <pre className="p-5 font-mono text-xs text-neutral-300 overflow-x-auto max-h-[500px] leading-relaxed bg-[#0a0a0a]">
                            <code>{file.code}</code>
                          </pre>
                        </div>
                      ))}

                    </div>

                  </div>

                </div>
              )}

            </main>
          </div>
        )}
      </AnimatePresence>

      {/* FOOTER METRICS AREA */}
      <footer id="vtu_copyright_footer" className="bg-neutral-950 border-t border-neutral-800 text-center py-4 text-[10px] text-neutral-500 mt-auto">
        <p>© 2026 Apex VTU Corporation. Authorized CBN fintech platform under Monnify & CBN Mobile Enclaves routing.</p>
        <span className="font-mono text-[9px] text-neutral-600 block mt-1">Built compliant with Zero-Trust firestore.rules and AES-256 local PIN enclaves.</span>
      </footer>

      {/* MODAL WINDOW 1: FUND WALLET MOCK TRIGGER */}
      <AnimatePresence>
        {showFundModal && (
          <div className="fixed inset-0 bg-neutral-950/80 backdrop-blur z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-neutral-900 max-w-sm w-full p-6 rounded-2xl border border-neutral-800 relative shadow-2xl space-y-4"
            >
              <button 
                onClick={() => setShowFundModal(false)}
                className="absolute right-4 top-4 text-neutral-400 hover:text-neutral-200"
              >
                ✕
              </button>

              <div className="text-center">
                <Coins className="w-10 h-10 text-emerald-400 mx-auto mb-2 animate-pulse" />
                <h4 className="text-lg font-bold text-white">Replenish Simulated Wallet</h4>
                <p className="text-xs text-neutral-400">Paystack Card Checkout Emulator</p>
              </div>

              <form onSubmit={handleFundingSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="text-[10px] text-neutral-500 uppercase block mb-1">Enter Funding Amount (NGN)</label>
                  <input 
                    type="number" 
                    value={fundAmount} 
                    onChange={(e) => setFundAmount(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded p-2.5 font-bold font-mono text-emerald-400 text-lg"
                    required 
                  />
                </div>

                <div>
                  <label className="text-[10px] text-neutral-500 uppercase block mb-1">Simulated Card String</label>
                  <input 
                    type="text" 
                    value={fundCardNum} 
                    onChange={(e) => setFundCardNum(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded p-2.5 font-mono"
                    required 
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-neutral-500 uppercase block mb-1">Card Expiry</label>
                    <input 
                      type="text" 
                      value={fundCardExpiry} 
                      onChange={(e) => setFundCardExpiry(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded p-2.5 font-mono text-center"
                      required 
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-neutral-500 uppercase block mb-1">CVV Security</label>
                    <input 
                      type="password" 
                      value={fundCardCVV} 
                      onChange={(e) => setFundCardCVV(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded p-2.5 font-mono text-center"
                      required 
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="w-full bg-emerald-600 hover:bg-emerald-500 font-bold py-3 px-4 rounded-xl text-white transition-all cursor-pointer flex justify-center items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Authorize N{parseFloat(fundAmount).toLocaleString() || '0'}</span>
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL WINDOW 2: SEND WALL TRANSFERS */}
      <AnimatePresence>
        {showTransferModal && (
          <div className="fixed inset-0 bg-neutral-950/80 backdrop-blur z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-neutral-900 max-w-sm w-full p-6 rounded-2xl border border-neutral-800 relative shadow-2xl space-y-4"
            >
              <button 
                onClick={() => setShowTransferModal(false)}
                className="absolute right-4 top-4 text-neutral-400 hover:text-neutral-200"
              >
                ✕
              </button>

              <div className="text-center">
                <ArrowRightLeft className="w-10 h-10 text-sky-400 mx-auto mb-2" />
                <h4 className="text-lg font-bold text-white">Secure P2P Wallet Transfer</h4>
                <p className="text-xs text-neutral-400">Transfer dynamic NGN directly between peers</p>
              </div>

              <form onSubmit={handleTransferSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="text-[10px] text-neutral-500 uppercase block mb-1">Enter Recipient Mobile / Wallet ID</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 08066778899"
                    value={transferRecipient} 
                    onChange={(e) => setTransferRecipient(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded p-2.5 text-neutral-200 font-semibold"
                    required 
                  />
                </div>

                <div>
                  <label className="text-[10px] text-neutral-500 uppercase block mb-1">Enter Amount to send (NGN)</label>
                  <input 
                    type="number" 
                    value={transferAmount} 
                    onChange={(e) => setTransferAmount(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded p-2.5 font-bold font-mono"
                    required 
                  />
                  <span className="text-[10px] text-zinc-500 block mt-1">Available balance: N{currentWallet.balance.toLocaleString()}</span>
                </div>

                <div>
                  <label className="text-[10px] text-neutral-500 uppercase block mb-1">Memo Message (Remark)</label>
                  <input 
                    type="text" 
                    placeholder="Family billing, school card topups"
                    value={transferNote} 
                    onChange={(e) => setTransferNote(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded p-2.5 text-neutral-200"
                  />
                </div>

                <button 
                  type="submit" 
                  className="w-full bg-emerald-600 hover:bg-emerald-500 font-bold py-3 px-4 rounded-xl text-white transition-all cursor-pointer flex justify-center items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Transfer securely</span>
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* RECEIPT MODAL DRAWER POP */}
      <AnimatePresence>
        {selectedReceipt && (
          <div className="fixed inset-0 bg-neutral-950/80 backdrop-blur z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-neutral-950 max-w-sm w-full p-6 rounded-2xl border border-neutral-800 relative shadow-2xl text-center space-y-4"
            >
              <button 
                onClick={() => setSelectedReceipt(null)}
                className="absolute right-4 top-4 text-neutral-500 hover:text-neutral-300"
              >
                ✕ Close
              </button>

              <div className="space-y-1">
                <div className="w-12 h-12 bg-emerald-900/30 border-2 border-emerald-500 rounded-full flex items-center justify-center text-emerald-400 mx-auto">
                  <Check className="w-6 h-6" />
                </div>
                <h4 className="text-emerald-400 font-bold text-sm tracking-wider uppercase">Transaction Successful</h4>
                <p className="text-3xl text-white font-mono font-extrabold">N{selectedReceipt.amount.toLocaleString()}</p>
                <span className="text-[10px] text-neutral-500 block">CBN Security Certified Token</span>
              </div>

              <div className="border-t border-b border-dashed border-neutral-800 py-4 text-xs space-y-2 text-left">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Transaction Reference:</span>
                  <span className="font-mono text-neutral-300 font-bold">{selectedReceipt.transactionId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Payment Category:</span>
                  <span className="capitalize text-neutral-300">{selectedReceipt.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Target Recipient:</span>
                  <span className="text-neutral-300 font-mono truncate max-w-[200px]">{selectedReceipt.recipient}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">API Gateway Routing:</span>
                  <span className="font-bold text-emerald-500 uppercase">{selectedReceipt.vtuProviderUsed || 'WEMA_MONNIFY'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Created At:</span>
                  <span className="text-neutral-400">{new Date(selectedReceipt.createdAt).toLocaleString()}</span>
                </div>
                {selectedReceipt.commission > 0 && (
                  <div className="flex justify-between text-emerald-400 border-t border-neutral-900 pt-2 text-[11px]">
                    <span>Allocated Commission:</span>
                    <span className="font-bold">+N{selectedReceipt.commission.toFixed(2)}</span>
                  </div>
                )}
              </div>

              <p className="text-[10px] text-neutral-500 italic">"{selectedReceipt.description}"</p>

              <button 
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(selectedReceipt, null, 2));
                  showAlert("JSON receipt schema copied!", "success");
                }}
                className="w-full bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all"
              >
                Copy API JSON receipt
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
 
      {/* MOBILE APP DOWNLOAD CENTER MODAL */}
      <AnimatePresence>
        {showDownloadModal && (
          <div className="fixed inset-0 bg-neutral-950/85 backdrop-blur z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-neutral-900 max-w-md w-full rounded-2xl border border-neutral-800 relative shadow-2xl overflow-hidden font-sans"
            >
              <button 
                onClick={() => {
                  setShowDownloadModal(false);
                  setAndroidDownloadProgress(null);
                  setDownloadDeviceType(null);
                }}
                className="absolute right-4 top-4 text-neutral-400 hover:text-neutral-200 z-10 transition-colors bg-neutral-950/40 p-1.5 rounded-full cursor-pointer"
              >
                ✕
              </button>

              <div className="bg-gradient-to-br from-emerald-950/50 to-neutral-900 p-6 border-b border-neutral-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                    <Smartphone className="w-5 h-5 animate-bounce" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white leading-none">Apex FinTech Apps</h4>
                    <span className="text-[10px] text-emerald-400 font-bold uppercase mt-1.5 tracking-wider block font-mono">Platform Installation Enclave</span>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-5 text-sm">
                
                {/* Platform selector tabs */}
                <div className="flex bg-neutral-950 p-1 rounded-xl border border-neutral-800">
                  <button 
                    onClick={() => {
                      setDownloadDeviceType('android');
                      setAndroidDownloadProgress(null);
                    }}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold text-center transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      downloadDeviceType === 'android' || downloadDeviceType === null ? 
                      'bg-emerald-600 text-white shadow-lg' : 
                      'text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5 shrink-0" />
                    <span>Android APK</span>
                  </button>
                  <button 
                    onClick={() => {
                      setDownloadDeviceType('ios');
                      setIosStep(1);
                    }}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold text-center transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      downloadDeviceType === 'ios' ? 
                      'bg-emerald-600 text-white shadow-lg shadow-emerald-950/20' : 
                      'text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    <Apple className="w-3.5 h-3.5 shrink-0" />
                    <span>iOS App (PWA)</span>
                  </button>
                </div>

                {/* Android Section */}
                {(downloadDeviceType === 'android' || downloadDeviceType === null) && (
                  <div className="space-y-4">
                    <p className="text-neutral-400 text-xs leading-relaxed font-sans">
                      Gain direct offline access to wallet controls and biometrics. Download the authentic lightweight Android APK bootloader package.
                    </p>

                    {androidDownloadProgress !== null ? (
                      <div className="bg-neutral-950 p-5 rounded-xl border border-neutral-800 space-y-4 text-center animate-fadeIn">
                        {androidDownloadProgress < 100 ? (
                          <div className="space-y-3">
                            <div className="flex justify-between text-xs font-mono text-zinc-400">
                              <span>Generating secure build hash...</span>
                              <span className="text-emerald-400 font-bold">{androidDownloadProgress}%</span>
                            </div>
                            <div className="w-full bg-neutral-900 h-2 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-emerald-500 transition-all duration-300" 
                                style={{ width: `${androidDownloadProgress}%` }}
                              />
                            </div>
                            <span className="text-[9px] uppercase font-mono text-neutral-600 tracking-widest block font-bold leading-none animate-pulse">Hashing certificate signatures...</span>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <div className="w-10 h-10 bg-emerald-950 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-900/10">
                              <Check className="w-5 h-5 text-emerald-400" />
                            </div>
                            <h5 className="font-bold text-white text-sm">Signature Authenticated!</h5>
                            <p className="text-xs text-neutral-400 leading-relaxed font-sans">
                              The file <span className="font-mono text-neutral-200 font-semibold bg-neutral-900 px-1 py-0.5 rounded text-[10px]">Apex_VTU_v1.0.0.apk</span> has downloaded successfully to your device.
                            </p>
                            <div className="bg-neutral-900 p-2.5 rounded border border-neutral-800 text-[10px] text-left text-neutral-500 leading-normal font-sans">
                              <b>Dynamic Help:</b> Launch the downloaded installer. Make sure to allow installations from <b>"Unknown Sources"</b> or <b>"Chrome"</b> inside your mobile device system Security page when prompted.
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <button 
                        type="button"
                        onClick={triggerAndroidDownload}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded-xl transition-all cursor-pointer flex justify-center items-center gap-2 shadow-lg shadow-emerald-950/25"
                      >
                        <Download className="w-4 h-4 shrink-0" />
                        <span>Direct Download Android APK</span>
                      </button>
                    )}

                    <div className="border-t border-neutral-800/60 pt-4 flex items-center justify-between text-[11px] text-neutral-500 font-mono">
                      <span>Package Size: ~12.4 MB</span>
                      <span>Target: Android 8.0+</span>
                    </div>
                  </div>
                )}

                {/* iOS Section */}
                {downloadDeviceType === 'ios' && (
                  <div className="space-y-4">
                    <p className="text-neutral-400 text-xs leading-relaxed font-sans">
                      Apple native security enclaves provision direct sandboxed access via Safari standard Progressive Web Apps (PWA). Follow these simple steps:
                    </p>

                    <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 space-y-4">
                      
                      {/* Step circles */}
                      <div className="flex justify-between items-center px-4 relative">
                        <span className="absolute left-6 right-6 h-0.5 bg-neutral-900 z-0"></span>
                        {[1, 2, 3].map((step) => (
                          <button 
                            key={step}
                            type="button"
                            onClick={() => setIosStep(step)}
                            className={`w-7 h-7 rounded-full font-bold text-xs flex items-center justify-center z-10 transition-all cursor-pointer ${
                              iosStep === step ? 'bg-emerald-500 text-neutral-950 font-bold' : 
                              iosStep > step ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30' : 'bg-neutral-900 text-neutral-500 border border-neutral-800'
                            }`}
                          >
                            {step}
                          </button>
                        ))}
                      </div>

                      {/* Display active step */}
                      <div className="text-xs text-center pt-2 min-h-[90px] flex flex-col justify-center font-sans">
                        {iosStep === 1 && (
                          <div className="space-y-2">
                            <span className="text-[9px] uppercase font-mono text-emerald-400 font-bold tracking-wider">Step 1: Open Share Sheet</span>
                            <p className="text-neutral-300 leading-relaxed bg-neutral-900/30 p-1.5 rounded border border-neutral-900">
                              Tap the iOS browser <b>"Share"</b> button (square container with an upward pointing arrow icon) on Safari's bottom action controller bar.
                            </p>
                          </div>
                        )}
                        {iosStep === 2 && (
                          <div className="space-y-2">
                            <span className="text-[9px] uppercase font-mono text-emerald-400 font-bold tracking-wider">Step 2: Add to Home Screen</span>
                            <p className="text-neutral-300 leading-relaxed bg-neutral-900/30 p-1.5 rounded border border-neutral-900 font-sans">
                              Scroll through the list variables panel in options and choose <b>"Add to Home Screen"</b> beside a neat plus widget logo.
                            </p>
                          </div>
                        )}
                        {iosStep === 3 && (
                          <div className="space-y-2">
                            <span className="text-[9px] uppercase font-mono text-emerald-400 font-bold tracking-wider">Step 3: Launch Companion App</span>
                            <p className="text-neutral-300 leading-relaxed bg-neutral-900/30 p-1.5 rounded border border-neutral-900 font-sans">
                              Tap <b>"Add"</b> in the top right. Launch the icon placed on your iPhone screen for a full screen standalone safe sandbox!
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Paginations */}
                      <div className="flex justify-between border-t border-neutral-900 pt-3">
                        <button 
                          type="button"
                          onClick={() => setIosStep(prev => Math.max(1, prev - 1))}
                          disabled={iosStep === 1}
                          className="text-xs text-neutral-400 hover:text-neutral-200 disabled:opacity-30 cursor-pointer"
                        >
                          ← Back
                        </button>
                        <button 
                          type="button"
                          onClick={() => setIosStep(prev => Math.min(3, prev + 1))}
                          disabled={iosStep === 3}
                          className="text-xs font-bold text-emerald-400 hover:text-emerald-300 disabled:opacity-30 cursor-pointer"
                        >
                          Next Step →
                        </button>
                      </div>

                    </div>

                    <div className="border-t border-neutral-800/60 pt-4 flex items-center justify-between text-[11px] text-neutral-500 font-mono">
                      <span>Package: Safari native core</span>
                      <span>Compatibility: iOS/iPadOS</span>
                    </div>

                  </div>
                )}

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
 
     </div>
   );
 }

// Custom icons
function KeyIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg 
      fill="none" 
      viewBox="0 0 24 24" 
      strokeWidth={2} 
      stroke="currentColor" 
      className={props.className}
      {...props}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
    </svg>
  );
}
