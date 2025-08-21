import crypto from 'crypto';
import db from '../config/database';
import { generateWalletId } from '../../src/lib/utils';

export interface Wallet {
  id: string;
  userId: string;
  walletId: string;
  balance: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface WalletTransaction {
  id: string;
  walletId: string;
  userId: string;
  type: 'deposit' | 'withdrawal' | 'admin_credit' | 'admin_debit' | 'transfer_in' | 'transfer_out';
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  description: string;
  referenceId?: string;
  processedBy?: string;
  adminNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WalletRequest {
  id: string;
  walletId: string;
  userId: string;
  type: 'deposit' | 'withdrawal';
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  userNotes?: string;
  adminNotes?: string;
  paymentMethod?: string;
  paymentDetails?: string;
  processedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateWalletRequestData {
  type: 'deposit' | 'withdrawal';
  amount: number;
  userNotes?: string;
  paymentMethod?: string;
  paymentDetails?: string;
}

class WalletService {
  async createWallet(userId: string): Promise<Wallet> {
    let walletId: string;
    let isUnique = false;
    
    // Generate unique wallet ID
    while (!isUnique) {
      walletId = generateWalletId();
      const existing = await db('wallets').where('wallet_id', walletId).first();
      if (!existing) {
        isUnique = true;
      }
    }

    await db('wallets').insert({
      user_id: userId,
      wallet_id: walletId!,
      balance: 0.00,
      is_active: true
    });

    return this.getWalletByUserId(userId);
  }

  async getWalletByUserId(userId: string): Promise<Wallet> {
    const wallet = await db('wallets')
      .select(
        'id',
        'user_id as userId',
        'wallet_id as walletId',
        'balance',
        'is_active as isActive',
        'created_at as createdAt',
        'updated_at as updatedAt'
      )
      .where({ user_id: userId, is_active: true })
      .first();

    if (!wallet) {
      throw new Error('Wallet not found');
    }

    // Convert balance from string to number
    wallet.balance = parseFloat(wallet.balance);

    return wallet;
  }

  async getWalletByWalletId(walletId: string): Promise<Wallet> {
    const wallet = await db('wallets')
      .select(
        'id',
        'user_id as userId',
        'wallet_id as walletId',
        'balance',
        'is_active as isActive',
        'created_at as createdAt',
        'updated_at as updatedAt'
      )
      .where({ wallet_id: walletId, is_active: true })
      .first();

    if (!wallet) {
      throw new Error('Wallet not found');
    }

    // Convert balance from string to number
    wallet.balance = parseFloat(wallet.balance);

    return wallet;
  }

  async createWalletRequest(userId: string, requestData: CreateWalletRequestData): Promise<WalletRequest> {
    const wallet = await this.getWalletByUserId(userId);
    
    // Validate withdrawal amount
    if (requestData.type === 'withdrawal' && requestData.amount > wallet.balance) {
      throw new Error('Insufficient balance for withdrawal');
    }

    // Check daily limits (example: max 3 requests per day)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const dailyRequests = await db('wallet_requests')
      .where('user_id', userId)
      .where('created_at', '>=', today)
      .count('* as count')
      .first();

    if (Number(dailyRequests?.count) >= 3) {
      throw new Error('Daily request limit exceeded');
    }

    const [insertedId] = await db('wallet_requests').insert({
      wallet_id: wallet.id,
      user_id: userId,
      type: requestData.type,
      amount: requestData.amount,
      status: 'pending',
      user_notes: requestData.userNotes,
      payment_method: requestData.paymentMethod,
      payment_details: requestData.paymentDetails
    });

    return this.getWalletRequestById(insertedId.toString());
  }

  async getWalletRequestById(id: string): Promise<WalletRequest> {
    const request = await db('wallet_requests')
      .select(
        'id',
        'wallet_id as walletId',
        'user_id as userId',
        'type',
        'amount',
        'status',
        'user_notes as userNotes',
        'admin_notes as adminNotes',
        'payment_method as paymentMethod',
        'payment_details as paymentDetails',
        'processed_by as processedBy',
        'created_at as createdAt',
        'updated_at as updatedAt'
      )
      .where({ id })
      .first();

    if (!request) {
      throw new Error('Wallet request not found');
    }

    // Convert amount from string to number
    request.amount = parseFloat(request.amount);

    return request;
  }

  async getUserWalletRequests(userId: string, page: number = 1, limit: number = 20): Promise<{ requests: WalletRequest[], total: number }> {
    const offset = (page - 1) * limit;

    const [requests, totalResult] = await Promise.all([
      db('wallet_requests')
        .select(
          'id',
          'wallet_id as walletId',
          'user_id as userId',
          'type',
          'amount',
          'status',
          'user_notes as userNotes',
          'admin_notes as adminNotes',
          'payment_method as paymentMethod',
          'payment_details as paymentDetails',
          'processed_by as processedBy',
          'created_at as createdAt',
          'updated_at as updatedAt'
        )
        .where('user_id', userId)
        .orderBy('created_at', 'desc')
        .limit(limit)
        .offset(offset),
      db('wallet_requests').where('user_id', userId).count('* as count').first()
    ]);

    // Convert amounts from string to number
    const convertedRequests = requests.map(request => ({
      ...request,
      amount: parseFloat(request.amount)
    }));

    return {
      requests: convertedRequests,
      total: Number(totalResult?.count) || 0
    };
  }

  async getWalletTransactions(userId: string, page: number = 1, limit: number = 20): Promise<{ transactions: WalletTransaction[], total: number }> {
    const offset = (page - 1) * limit;

    const [transactions, totalResult] = await Promise.all([
      db('wallet_transactions')
        .select(
          'id',
          'wallet_id as walletId',
          'user_id as userId',
          'type',
          'amount',
          'balance_before as balanceBefore',
          'balance_after as balanceAfter',
          'status',
          'description',
          'reference_id as referenceId',
          'processed_by as processedBy',
          'admin_notes as adminNotes',
          'created_at as createdAt',
          'updated_at as updatedAt'
        )
        .where('user_id', userId)
        .orderBy('created_at', 'desc')
        .limit(limit)
        .offset(offset),
      db('wallet_transactions').where('user_id', userId).count('* as count').first()
    ]);

    // Convert amounts from string to number
    const convertedTransactions = transactions.map(transaction => ({
      ...transaction,
      amount: parseFloat(transaction.amount),
      balanceBefore: parseFloat(transaction.balanceBefore),
      balanceAfter: parseFloat(transaction.balanceAfter)
    }));

    return {
      transactions: convertedTransactions,
      total: Number(totalResult?.count) || 0
    };
  }

  async processWalletRequest(requestId: string, adminId: string, action: 'approve' | 'reject', adminNotes?: string): Promise<WalletRequest> {
    const request = await this.getWalletRequestById(requestId);
    
    if (request.status !== 'pending') {
      throw new Error('Request is not in pending status');
    }

    const trx = await db.transaction();
    
    try {
      // Update request status
      await trx('wallet_requests')
        .where('id', requestId)
        .update({
          status: action === 'approve' ? 'approved' : 'rejected',
          processed_by: adminId,
          admin_notes: adminNotes,
          updated_at: db.fn.now()
        });

      if (action === 'approve') {
        const wallet = await this.getWalletByUserId(request.userId);
        const balanceBefore = wallet.balance;
        let balanceAfter: number;
        let transactionType: string;
        
        if (request.type === 'deposit') {
          balanceAfter = balanceBefore + request.amount;
          transactionType = 'deposit';
        } else {
          balanceAfter = balanceBefore - request.amount;
          transactionType = 'withdrawal';
        }

        // Update wallet balance
        await trx('wallets')
          .where('id', wallet.id)
          .update({
            balance: balanceAfter,
            updated_at: db.fn.now()
          });

        // Create transaction record
        await trx('wallet_transactions').insert({
          wallet_id: wallet.id,
          user_id: request.userId,
          type: transactionType,
          amount: request.amount,
          balance_before: balanceBefore,
          balance_after: balanceAfter,
          status: 'completed',
          description: `${request.type} request approved`,
          reference_id: requestId,
          processed_by: adminId,
          admin_notes: adminNotes
        });
      }

      await trx.commit();
      return this.getWalletRequestById(requestId);
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  async manualAdjustBalance(userId: string, amount: number, adminId: string, description: string): Promise<WalletTransaction> {
    const wallet = await this.getWalletByUserId(userId);
    const balanceBefore = wallet.balance;
    const balanceAfter = balanceBefore + amount;
    
    if (balanceAfter < 0) {
      throw new Error('Adjustment would result in negative balance');
    }

    const trx = await db.transaction();
    
    try {
      // Update wallet balance
      await trx('wallets')
        .where('id', wallet.id)
        .update({
          balance: balanceAfter,
          updated_at: db.fn.now()
        });

      // Create transaction record
      const [transactionId] = await trx('wallet_transactions').insert({
        wallet_id: wallet.id,
        user_id: userId,
        type: amount > 0 ? 'admin_credit' : 'admin_debit',
        amount: Math.abs(amount),
        balance_before: balanceBefore,
        balance_after: balanceAfter,
        status: 'completed',
        description,
        processed_by: adminId
      });

      await trx.commit();
      
      const transaction = await db('wallet_transactions')
        .select(
          'id',
          'wallet_id as walletId',
          'user_id as userId',
          'type',
          'amount',
          'balance_before as balanceBefore',
          'balance_after as balanceAfter',
          'status',
          'description',
          'reference_id as referenceId',
          'processed_by as processedBy',
          'admin_notes as adminNotes',
          'created_at as createdAt',
          'updated_at as updatedAt'
        )
        .where('id', transactionId)
        .first();

      // Convert amounts from string to number
      transaction.amount = parseFloat(transaction.amount);
      transaction.balanceBefore = parseFloat(transaction.balanceBefore);
      transaction.balanceAfter = parseFloat(transaction.balanceAfter);

      return transaction;
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  // Admin methods
  async getAllWalletRequests(page: number = 1, limit: number = 20, status?: string): Promise<{ requests: any[], total: number }> {
    const offset = (page - 1) * limit;
    let query = db('wallet_requests as wr')
      .join('users as u', 'wr.user_id', 'u.id')
      .join('wallets as w', 'wr.wallet_id', 'w.id')
      .select(
        'wr.id',
        'wr.wallet_id as walletId',
        'wr.user_id as userId',
        'u.username',
        'u.email',
        'w.wallet_id as walletNumber',
        'wr.type',
        'wr.amount',
        'wr.status',
        'wr.user_notes as userNotes',
        'wr.admin_notes as adminNotes',
        'wr.payment_method as paymentMethod',
        'wr.payment_details as paymentDetails',
        'wr.processed_by as processedBy',
        'wr.created_at as createdAt',
        'wr.updated_at as updatedAt'
      );

    if (status) {
      query = query.where('wr.status', status);
    }

    const [requests, totalResult] = await Promise.all([
      query.orderBy('wr.created_at', 'desc').limit(limit).offset(offset),
      status 
        ? db('wallet_requests').where('status', status).count('* as count').first()
        : db('wallet_requests').count('* as count').first()
    ]);

    // Convert amounts from string to number
    const convertedRequests = requests.map(request => ({
      ...request,
      amount: parseFloat(request.amount)
    }));

    return {
      requests: convertedRequests,
      total: Number(totalResult?.count) || 0
    };
  }

  async getAllWallets(page: number = 1, limit: number = 20): Promise<{ wallets: any[], total: number }> {
    const offset = (page - 1) * limit;

    const [wallets, totalResult] = await Promise.all([
      db('wallets as w')
        .join('users as u', 'w.user_id', 'u.id')
        .select(
          'w.id',
          'w.user_id as userId',
          'w.wallet_id as walletId',
          'w.balance',
          'w.is_active as isActive',
          'u.username',
          'u.email',
          'u.first_name as firstName',
          'u.last_name as lastName',
          'w.created_at as createdAt',
          'w.updated_at as updatedAt'
        )
        .where('w.is_active', true)
        .orderBy('w.created_at', 'desc')
        .limit(limit)
        .offset(offset),
      db('wallets').where('is_active', true).count('* as count').first()
    ]);

    // Convert balance from string to number
    const convertedWallets = wallets.map(wallet => ({
      ...wallet,
      balance: parseFloat(wallet.balance)
    }));

    return {
      wallets: convertedWallets,
      total: Number(totalResult?.count) || 0
    };
  }
}

export default new WalletService();