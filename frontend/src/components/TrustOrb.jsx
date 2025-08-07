import React, { useState, useEffect } from 'react';
import './TrustOrb.css';

/**
 * Determines the color theme for the orb based on the risk score.
 */
const getOrbColors = (risk) => {
  if (risk === null || risk === undefined) {
    return { '--orb-color-1': '#cccccc', '--orb-color-2': '#777777' };
  }
  if (risk <= 3) {
    return { '--orb-color-1': '#87CEEB', '--orb-color-2': '#0000FF' };
  }
  if (risk >= 4 && risk <= 7) {
    return { '--orb-color-1': '#00ff99', '--orb-color-2': '#007bff' };
  }
  return { '--orb-color-1': '#FFA500', '--orb-color-2': '#FF4500' };
};


/**
 * The TrustOrb component.
 */
const TrustOrb = ({ onOrbClick, isTier2Visible, rules, whitelistStatus, onUpdateRule, updatingStatus }) => {
  const [newRisk, setNewRisk] = useState(5);
  const orbStyle = getOrbColors(rules?.riskTolerance);

  useEffect(() => {
    if (rules) {
      setNewRisk(rules.riskTolerance);
    }
  }, [rules]);

  return (
    <div className="orb-container" style={orbStyle}>
      <button className="orb-button" onClick={onOrbClick}>
        <div className="orb"></div>
      </button>
      <p className="orb-label">System Nominal</p>

      {/* This is the main container for the Tier 2 panel */}
      {isTier2Visible && (
        <div className="tier2-container">

          {/* Section 1: The rules and update controls (your existing code) */}
          {rules && (
            <div className="rules-section">
              <h3 className="tier2-title">Codex Rules (On-Chain)</h3>
              <div className="rules-grid">
                <div className="rule-item">
                  <span className="rule-label">Risk Tolerance</span>
                  <span className="rule-value">{rules.riskTolerance} / 10</span>
                </div>
                <div className="rule-item">
                  <span className="rule-label">Max Allocation / Protocol</span>
                  <span className="rule-value">{rules.maxAllocationPerProtocol}%</span>
                </div>
              </div>
              <div className="update-section">
                <label htmlFor="risk-slider">Adjust Risk Tolerance</label>
                <div className="slider-container">
                    <input
                        type="range"
                        id="risk-slider"
                        min="1"
                        max="10"
                        value={newRisk}
                        onChange={(e) => setNewRisk(Number(e.target.value))}
                    />
                    <span>{newRisk}</span>
                </div>
                <button
                  className="update-button"
                  onClick={() => onUpdateRule(newRisk)}
                  disabled={updatingStatus === 'loading' || newRisk === rules.riskTolerance}
                >
                  {updatingStatus === 'loading' ? 'Updating...' : 'Update Rule On-Chain'}
                </button>
                {updatingStatus === 'error' && <p className="error-message">Update failed. Please try again.</p>}
              </div>
            </div>
          )}

          {/* --- THIS IS THE NEW THING --- */}
          {/* Section 2: The Guardian Whitelist display */}
          <div className="whitelist-section">
            <h3 className="tier2-title">Guardian Whitelist</h3>
            <div className="rule-item">
              <span className="rule-label">Uniswap V3 Router</span>
              <span className={`status-badge ${whitelistStatus ? 'status-active' : 'status-inactive'}`}>
                {whitelistStatus === null ? 'Loading...' : whitelistStatus ? 'Approved' : 'Not Approved'}
              </span>
            </div>
          </div>
          {/* --- END OF NEW THING --- */}

        </div>
      )}
    </div>
  );
};

export default TrustOrb;