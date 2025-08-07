import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { AETHELRED_CODEX_CONTRACT_ADDRESS, AETHELRED_CODEX_ABI } from './constants';
import TrustOrb from './components/TrustOrb';
import './index.css';
import StrategyCard from './components/StrategyCard';
import VaultCard from './components/VaultCard';
import { AETHELRED_VAULT_CONTRACT_ADDRESS, AETHELRED_VAULT_ABI } from './constants';


// Address for the Uniswap Router we whitelisted
const UNISWAP_ADDRESS = "0x3bFA4769FB09eefC5a80d6E87c3B9C650f7Ae48E";

function App() {
  const [account, setAccount] = useState(null);
  const [codexContract, setCodexContract] = useState(null);
  const [hasMinted, setHasMinted] = useState(false);
  const [codexRules, setCodexRules] = useState(null);
  const [isTier2Visible, setIsTier2Visible] = useState(false);
  const [mintingStatus, setMintingStatus] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState('');
  const [strategyProposal, setStrategyProposal] = useState(null);
  const [vaultContract, setVaultContract] = useState(null);
  const [vaultBalance, setVaultBalance] = useState(null);
  const [provider, setProvider] = useState(null); // 1. Add provider state
  const [operator, setOperator] = useState(null);
  const [isOperatorSet, setIsOperatorSet] = useState(false);

  // --- NEW STATE ---
  const [whitelistStatus, setWhitelistStatus] = useState(null);

  const fetchVaultData = useCallback(async (contract, userAccount) => {
    try {
      // Fetch balance
      const balance = await contract.getBalance();
      setVaultBalance(ethers.formatEther(balance));

      // Fetch operator
      const currentOperator = await contract.operator();
      setOperator(currentOperator);
      // Check if the connected account is the operator
      setIsOperatorSet(currentOperator.toLowerCase() === userAccount.toLowerCase());
    } catch (error) {
      console.error("Could not fetch vault data", error);
    }
  }, []);

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        // 1. Get accounts and set the main account
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const userAccount = accounts[0];
        setAccount(userAccount);

        // 2. Initialize provider and signer
        const ethersProvider = new ethers.BrowserProvider(window.ethereum);
        setProvider(ethersProvider); // <-- Add this line
        const signer = await ethersProvider.getSigner();
        
        // 3. Initialize contracts
        const codex = new ethers.Contract(AETHELRED_CODEX_CONTRACT_ADDRESS, AETHELRED_CODEX_ABI, signer);
        const vault = new ethers.Contract(AETHELRED_VAULT_CONTRACT_ADDRESS, AETHELRED_VAULT_ABI, signer);

        // 4. Set contract state
        setCodexContract(codex);
        setVaultContract(vault);

        // 5. --- IMPORTANT ---
        // Now that everything is initialized, perform the initial data fetch.
        await checkForExistingCodex(codex, userAccount);
        await fetchVaultBalance(vault);

      } catch (error) {
        console.error("Error connecting to MetaMask", error);
      }
    } else {
      alert("Please install MetaMask to use this application.");
    }
  };

  const handleSetOperator = async () => {
    if (!vaultContract) return;
    try {
      console.log("Setting connected account as operator...");
      const tx = await vaultContract.setOperator(account);
      await tx.wait();
      console.log("Operator set successfully!");
      // Re-fetch vault data to update the UI
      await fetchVaultData(vaultContract, account);
    } catch (error) {
      console.error("Failed to set operator", error);
    }
  };

  // This function now just fetches subsequent data when rules change
  const handleUpdateRule = async (newRisk) => {
      if (!codexContract) return;
      try {
          setUpdatingStatus('loading');
          const tx = await codexContract.updateRiskTolerance(1, newRisk);
          await tx.wait();
          setUpdatingStatus('success');
          // Re-fetch rules after update
          await fetchCodexRules(codexContract);
      } catch (error) {
          console.error("Error updating rule:", error);
          setUpdatingStatus('error');
      } finally {
          setTimeout(() => setUpdatingStatus(''), 2000);
      }
  };

  // We no longer need the big useEffect hook that was causing race conditions.
  // All initial fetches now happen synchronously inside connectWallet.

  const fetchCodexRules = useCallback(async (contract) => {
    console.log("Fetching Codex rules...");
    try {
      // Assuming user's first token is always #1 for this prototype
      const userTokenId = 1; 
      const rules = await contract.rules(userTokenId);
      setCodexRules({
        riskTolerance: Number(rules.riskTolerance),
        maxAllocationPerProtocol: Number(rules.maxAllocationPerProtocol)
      });
      console.log("Rules fetched:", rules);
    } catch (error) {
      console.error("Could not fetch codex rules:", error);
    }
  }, []);

  // --- NEW FUNCTION to fetch whitelist status ---
  const fetchWhitelistStatus = useCallback(async (contract) => {
    console.log("Fetching whitelist status...");
    try {
      const status = await contract.isWhitelisted(UNISWAP_ADDRESS);
      setWhitelistStatus(status);
      console.log("Whitelist status for Uniswap:", status);
    } catch (error) {
      console.error("Could not fetch whitelist status:", error);
    }
  }, []);

  const checkForExistingCodex = useCallback(async (contract, userAccount) => {
    try {
        const balance = await contract.balanceOf(userAccount);
        if (balance > 0) {
            setHasMinted(true);
            fetchCodexRules(contract); // Fetch rules if they have minted
            fetchWhitelistStatus(contract);
        } else {
            setHasMinted(false);
        }
    } catch(error) {
        console.error("Error checking for existing codex", error);
    }
  }, [fetchCodexRules, fetchWhitelistStatus]);

  const fetchVaultBalance = useCallback(async (contract) => {
    try {
      const balance = await contract.getBalance();
      setVaultBalance(ethers.formatEther(balance));
    } catch (error) {
      console.error("Could not fetch vault balance", error);
    }
  }, []);

  // Add this function inside your App component
  const handleDeposit = async (amount) => {
    if (!vaultContract || !amount) {
      alert("Vault not initialized or amount is invalid.");
      return;
    }
    if (!provider) {
      alert("Provider not initialized. Please connect your wallet.");
      return;
    }
    try {
      console.log(`Sending deposit transaction for ${amount} ETH...`);
      // We need to convert the amount from Ether (string) to Wei (BigInt)
      const amountInWei = ethers.parseEther(amount);

      // Get the signer to send the transaction
      const signer = await provider.getSigner(); // 3. Use provider from state
      
      // This is a direct transaction TO the vault contract, with a value attached.
      const tx = await signer.sendTransaction({
        to: AETHELRED_VAULT_CONTRACT_ADDRESS,
        value: amountInWei
      });

      console.log("Waiting for deposit confirmation...");
      await tx.wait();

      console.log("Deposit successful!");
      // IMPORTANT: Fetch the balance again to update the UI with the new balance.
      fetchVaultBalance(vaultContract);

    } catch (error) {
      console.error("Error depositing funds:", error);
      alert(`Deposit failed: ${error.message}`);
    }
  };

  // Add this function inside your App component
  const handleExecuteStrategy = async () => {
    if (!vaultContract || !strategyProposal || !isOperatorSet) return;
    try {
      const amount = ethers.parseEther("0.005");
      const protocolAddress = "0x3bFA4769FB09eefC5a80d6E87c3B9C650f7Ae48E";
      const tx = await vaultContract.executeStrategy(protocolAddress, amount);
      await tx.wait();
      console.log("Execution successful!");
    } catch (error) {
      console.error("Execution failed:", error);
    }
  };

  useEffect(() => {
    if (codexContract && account) {
      checkForExistingCodex(codexContract, account);
    }
    if (vaultContract) {
    fetchVaultBalance(vaultContract);
}
  }, [codexContract, account, checkForExistingCodex, vaultContract, fetchVaultBalance]);

    // This useEffect simulates the Alpha Agent's thinking process.
  useEffect(() => {
    // The agent only proposes a strategy if it has all the facts.
    if (codexRules && whitelistStatus) {
      // --- ALPHA AGENT'S SIMPLE LOGIC ---
      // If risk is moderate or higher AND Uniswap is approved...
      if (codexRules.riskTolerance >= 4 && whitelistStatus) {
        setStrategyProposal({
          description: "Allocate 10% of portfolio to the Uniswap V3 ETH/USDC liquidity pool.",
          apy: 12, // A simulated, estimated APY
          risk: "Medium"
        });
      } else {
        // If conditions are not met, the agent proposes no action.
        setStrategyProposal({
          description: "Market conditions do not align with your risk profile. No action proposed.",
          apy: 0,
          risk: "N/A"
        });
      }
    }
  }, [codexRules, whitelistStatus]); // This effect re-runs when the rules change

  const handleMintCodex = async () => {
    if (!codexContract) return;
    try {
      setMintingStatus('loading');
      const tx = await codexContract.mintCodex();
      await tx.wait();
      setMintingStatus('success');
      setHasMinted(true);
      fetchCodexRules(codexContract);
      fetchWhitelistStatus(codexContract); 
    } catch (error) {
      console.error("Error minting Codex:", error);
      setMintingStatus('error');
    }
  };
  
  const toggleTier2View = () => setIsTier2Visible(!isTier2Visible);

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Aethelred Protocol</h1>
        {account && (
          <div className="account-display">
            Connected: {`${account.substring(0, 6)}...${account.substring(account.length - 4)}`}
          </div>
        )}
      </header>
      <main className="main-content">
        {account ? (
          hasMinted ? (
            <>
            <TrustOrb 
              onOrbClick={toggleTier2View} 
              isTier2Visible={isTier2Visible}
              rules={codexRules}
              whitelistStatus={whitelistStatus} 
              onUpdateRule={handleUpdateRule}
              updatingStatus={updatingStatus}
            />
            <StrategyCard proposal={strategyProposal} onExecute={handleExecuteStrategy} isReady={isOperatorSet} />
            <VaultCard vaultAddress={AETHELRED_VAULT_CONTRACT_ADDRESS} vaultBalance={vaultBalance} onDeposit={handleDeposit} operator={operator} onSetOperator={handleSetOperator} />
            </>
          ) : ( 
            <div>
              <h2>Mint Your Codex</h2>
              <p>Begin your journey with the Aethelred Protocol by minting your unique, non-transferable Codex.</p>
              <button onClick={handleMintCodex} className="mint-button" disabled={mintingStatus === 'loading'}>
                {mintingStatus === 'loading' ? 'Minting...' : 'Mint Your Personal Codex'}
              </button>
              {mintingStatus === 'success' && <p className="success-message">Congratulations! Your Codex has been minted.</p>}
              {mintingStatus === 'error' && <p className="error-message">An error occurred during minting. Please try again.</p>}
            </div>
          )
        ) : ( 
          <button onClick={connectWallet} className="connect-button-center">
            Connect Wallet
          </button> 
        )}
      </main>
    </div>
  );
}

export default App;