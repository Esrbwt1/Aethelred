import React from 'react';
import './StrategyCard.css';

const StrategyCard = ({ proposal, onExecute, isReady }) => {
  // If there's no proposal, the component renders nothing.
  if (!proposal) {
    return null;
  }

  return (
    <div className="strategy-card">
      <h3 className="strategy-title">Alpha Agent Proposal</h3>
      <p className="strategy-description">{proposal.description}</p>
      <div className="strategy-details">
        <div>
          <span className="detail-label">Est. APY</span>
          <span className="detail-value">{proposal.apy}%</span>
        </div>
        <div>
          <span className="detail-label">Risk Level</span>
          <span className="detail-value">{proposal.risk}</span>
        </div>
      </div>
      <button 
        className="execute-button" 
        onClick={onExecute}
        disabled={!proposal || proposal.risk === 'N/A' || !isReady} // Enable the button if there's a valid proposal
        >
            Execute
        </button>
    </div>
  );
};

export default StrategyCard;