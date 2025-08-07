import React, { useState } from 'react';
import './VaultCard.css';

const VaultCard = ({ vaultAddress, vaultBalance, onDeposit, operator, onSetOperator }) => {
  const [depositAmount, setDepositAmount] = useState("0.01");
  const formattedBalance = vaultBalance ? parseFloat(vaultBalance).toFixed(4) : "0.0000";
  const isOperatorSet = operator && operator !== "0x0000000000000000000000000000000000000000";

  const handleDepositClick = () => {
    // We call the onDeposit function passed down from the parent App.jsx
    onDeposit(depositAmount);
  };

  return (
    <div className="vault-card">
      <h3 className="vault-title">Treasury Vault</h3>
      <div className="vault-address">
        <span className="detail-label">Contract Address</span>
        <a href={`https://sepolia.etherscan.io/address/${vaultAddress}`} target="_blank" rel="noopener noreferrer">
          {`${vaultAddress?.substring(0, 6)}...${vaultAddress?.substring(vaultAddress.length - 4)}`}
        </a>
      </div>
      <div className="vault-balance">
        <span className="detail-label">Current Balance</span>
        <span className="balance-value">{formattedBalance} ETH</span>
      </div>
      <div className="operator-status">
        <span className="detail-label">Authorized Operator</span>
        <span className="operator-address">
          {isOperatorSet ? `${operator.substring(0, 6)}...${operator.substring(operator.length - 4)}` : "None Set"}
        </span>
      </div>
      {!isOperatorSet && (
        <button className="vault-button operator-button" onClick={onSetOperator}>
          Set Me as Operator
        </button>
      )}
      <div className="vault-actions">
        <div className="action-item">
          <input 
            type="number" 
            className="amount-input"
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
            step="0.01"
            min="0"
          />
          <button className="vault-button deposit" onClick={handleDepositClick}>
            Deposit
          </button>
        </div>
        <div className="action-item">
          <button className="vault-button withdraw" disabled>Withdraw</button>
        </div>
      </div>
    </div>
  );
};

export default VaultCard;