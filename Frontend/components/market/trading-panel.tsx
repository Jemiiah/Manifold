'use client';

import { useState } from 'react';
import { Market, OutcomeType } from '@/types';
import { cn, calculateOrderSummary } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { usePrediction } from '@/hooks/use-prediction';
import { useWallet } from '@demox-labs/aleo-wallet-adapter-react';
import { DecryptPermission, WalletAdapterNetwork } from '@demox-labs/aleo-wallet-adapter-base';
import { Loader2 } from 'lucide-react';

interface TradingPanelProps {
  market: Market;
}

export function TradingPanel({ market }: TradingPanelProps) {
  const [selectedOutcome, setSelectedOutcome] = useState<OutcomeType>('yes');
  const [amount, setAmount] = useState('');
  const [txStatus, setTxStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const [txMessage, setTxMessage] = useState<string>('');

  const { connected, publicKey, connecting, connect, select, wallets } = useWallet();
  const { makePrediction, isLoading, error } = usePrediction();

  const handleConnectWallet = async () => {
    if (wallets.length > 0) {
      select(wallets[0].adapter.name);
      try {
        await connect(DecryptPermission.UponRequest, WalletAdapterNetwork.TestnetBeta);
      } catch (error) {
        console.error('Failed to connect wallet:', error);
      }
    }
  };

  const orderSummary = calculateOrderSummary(amount, selectedOutcome, market);
  const quickAmounts = [10, 25, 50, 100];

  const handleTrade = async () => {
    if (!connected || !amount) return;

    setTxStatus('pending');
    setTxMessage('Submitting prediction...');

    // Convert outcome to option number (1 for yes/option A, 2 for no/option B)
    const option = selectedOutcome === 'yes' ? 1 : 2;

    // Amount in Aleo (the hook will convert to microcredits)
    const amountInAleo = parseFloat(amount);

    if (isNaN(amountInAleo) || amountInAleo <= 0) {
      setTxStatus('error');
      setTxMessage('Please enter a valid amount');
      return;
    }

    try {
      const result = await makePrediction({
        poolId: '1', // Default pool ID for now
        option: option as 1 | 2,
        amount: amountInAleo,
      });

      if (result.status === 'success') {
        setTxStatus('success');
        setTxMessage(`Prediction submitted! TX: ${result.transactionId?.slice(0, 10)}...`);
        setAmount(''); // Reset amount after successful transaction
      } else {
        setTxStatus('error');
        setTxMessage(result.error || 'Transaction failed');
      }
    } catch (e) {
      setTxStatus('error');
      setTxMessage(e instanceof Error ? e.message : 'Transaction failed');
    }
  };

  return (
    <div className="bg-zinc-900/80 border border-zinc-800/60 rounded-2xl p-6 sticky top-6">
      <h2 className="text-lg font-semibold text-white mb-6">Place Order</h2>

      {/* Outcome Selection */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <OutcomeButton
          type="yes"
          price={market.yesPrice}
          isSelected={selectedOutcome === 'yes'}
          onClick={() => setSelectedOutcome('yes')}
        />
        <OutcomeButton
          type="no"
          price={market.noPrice}
          isSelected={selectedOutcome === 'no'}
          onClick={() => setSelectedOutcome('no')}
        />
      </div>

      {/* Amount Input */}
      <div className="mb-6">
        <label className="text-xs text-zinc-500 mb-2 block">Amount (ALEO)</label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">◎</span>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            min="0"
            step="0.01"
            className="w-full bg-zinc-800/60 border border-zinc-700/50 rounded-xl py-4 pl-8 pr-4 text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
          />
        </div>
        <div className="flex gap-2 mt-3">
          {quickAmounts.map((val) => (
            <button
              key={val}
              onClick={() => setAmount(val.toString())}
              className="flex-1 py-2 text-xs font-medium bg-zinc-800/40 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-lg transition-colors"
            >
              {val} ALEO
            </button>
          ))}
        </div>
      </div>

      {/* Order Summary */}
      <div className="bg-zinc-800/40 rounded-xl p-4 mb-6 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-zinc-500">Shares</span>
          <span className="text-zinc-300 font-medium">{orderSummary.shares}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-zinc-500">Avg Price</span>
          <span className="text-zinc-300 font-medium">{orderSummary.avgPrice}¢</span>
        </div>
        <div className="border-t border-zinc-700/50 pt-3 flex justify-between">
          <span className="text-zinc-400">Potential Return</span>
          <span className="text-emerald-400 font-semibold">${orderSummary.potentialReturn}</span>
        </div>
      </div>

      {/* Transaction Status */}
      {txStatus !== 'idle' && (
        <div
          className={cn(
            'mb-4 p-3 rounded-lg text-sm',
            txStatus === 'pending' && 'bg-blue-500/10 text-blue-400',
            txStatus === 'success' && 'bg-emerald-500/10 text-emerald-400',
            txStatus === 'error' && 'bg-red-500/10 text-red-400'
          )}
        >
          {txStatus === 'pending' && (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              {txMessage}
            </span>
          )}
          {txStatus !== 'pending' && txMessage}
        </div>
      )}

      {/* Submit Button */}
      {connected ? (
        <Button
          onClick={handleTrade}
          disabled={isLoading || !amount || parseFloat(amount) <= 0}
          className="w-full py-6 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Processing...
            </span>
          ) : (
            `Predict ${selectedOutcome === 'yes' ? 'Yes' : 'No'}`
          )}
        </Button>
      ) : (
        <Button
          onClick={handleConnectWallet}
          disabled={connecting}
          className="w-full py-6 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/20 disabled:opacity-50"
        >
          {connecting ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Connecting...
            </span>
          ) : (
            'Connect Wallet to Trade'
          )}
        </Button>
      )}

      <p className="text-xs text-zinc-500 text-center mt-4">Powered by Aleo Zero-Knowledge Proofs</p>
    </div>
  );
}

interface OutcomeButtonProps {
  type: OutcomeType;
  price: number;
  isSelected: boolean;
  onClick: () => void;
}

function OutcomeButton({ type, price, isSelected, onClick }: OutcomeButtonProps) {
  const isYes = type === 'yes';

  return (
    <button
      onClick={onClick}
      className={cn(
        'py-4 rounded-xl font-semibold transition-all duration-200',
        isSelected
          ? isYes
            ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20'
            : 'bg-zinc-600 text-white shadow-lg shadow-zinc-600/20'
          : 'bg-zinc-800/60 text-zinc-400 hover:bg-zinc-800'
      )}
    >
      <div className="text-xs opacity-70 mb-1">Buy {isYes ? 'Yes' : 'No'}</div>
      <div className="text-xl">{price}¢</div>
    </button>
  );
}
