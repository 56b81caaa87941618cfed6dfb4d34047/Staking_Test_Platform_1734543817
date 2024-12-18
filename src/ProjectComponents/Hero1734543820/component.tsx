
import React from 'react';
import * as ethers from 'ethers';

const nodeOpsABI = [
  {
    "name": "stake",
    "stateMutability": "nonpayable",
    "inputs": [
      {
        "name": "nodes",
        "type": "bytes32[]",
        "internalType": "bytes32[]"
      },
      {
        "name": "amount",
        "type": "uint248",
        "internalType": "uint248"
      }
    ],
    "outputs": []
  },
  {
    "name": "nominate",
    "stateMutability": "nonpayable",
    "inputs": [
      {
        "name": "nodes",
        "type": "bytes32[]",
        "internalType": "bytes32[]"
      }
    ],
    "outputs": []
  },
  {
    "name": "unstake",
    "stateMutability": "nonpayable",
    "inputs": [],
    "outputs": []
  },
  {
    "name": "cancelUnstake",
    "stateMutability": "nonpayable",
    "inputs": [],
    "outputs": []
  },
  {
    "name": "requestProcessUnstake",
    "stateMutability": "nonpayable",
    "inputs": [],
    "outputs": []
  }
];

const testTokenABI = [
  {
    "constant": false,
    "inputs": [
      {
        "name": "_spender",
        "type": "address"
      },
      {
        "name": "_value",
        "type": "uint256"
      }
    ],
    "name": "approve",
    "outputs": [
      {
        "name": "",
        "type": "bool"
      }
    ],
    "type": "function"
  }
];

const StakingAndNominationComponent: React.FC = () => {
  const [amount, setAmount] = React.useState('');
  const [nodes, setNodes] = React.useState('');
  const [nominateNodes, setNominateNodes] = React.useState('');
  const [approvalStatus, setApprovalStatus] = React.useState('Not approved');
  const [stakingStatus, setStakingStatus] = React.useState('Not staked');
  const [nominateStatus, setNominateStatus] = React.useState('Not nominated');
  const [unstakeStatus, setUnstakeStatus] = React.useState('Not unstaked');
  const [cancelUnstakeStatus, setCancelUnstakeStatus] = React.useState('Not cancelled');
  const [requestProcessUnstakeStatus, setRequestProcessUnstakeStatus] = React.useState('Not requested');
  const [provider, setProvider] = React.useState<ethers.providers.Web3Provider | null>(null);
  const [signer, setSigner] = React.useState<ethers.Signer | null>(null);

  const nodeOpsAddress = '0x0744d79f3e8f0a3652d886c9c49cb476a05de248';
  const testTokenAddress = '0x2c87f28573824f65f75c8a0437f444605214ae41';
  const chainId = 137;

  React.useEffect(() => {
    const initProvider = async () => {
      if (window.ethereum) {
        const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
        setProvider(web3Provider);
        setSigner(web3Provider.getSigner());
      }
    };
    initProvider();
  }, []);

  const connectWallet = async () => {
    if (provider) {
      try {
        await provider.send("eth_requestAccounts", []);
        const network = await provider.getNetwork();
        if (network.chainId !== chainId) {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: ethers.utils.hexValue(chainId) }],
          });
        }
      } catch (error) {
        console.error("Failed to connect wallet:", error);
      }
    }
  };

  const approveTokens = async () => {
    if (!signer) {
      await connectWallet();
      return;
    }
    try {
      const testTokenContract = new ethers.Contract(testTokenAddress, testTokenABI, signer);
      const tx = await testTokenContract.approve(nodeOpsAddress, ethers.utils.parseEther(amount));
      await tx.wait();
      setApprovalStatus('Approved');
    } catch (error) {
      console.error("Failed to approve tokens:", error);
      setApprovalStatus('Approval failed');
    }
  };

  const stake = async () => {
    if (!signer) {
      await connectWallet();
      return;
    }
    try {
      const nodeOpsContract = new ethers.Contract(nodeOpsAddress, nodeOpsABI, signer);
      const nodeArray = nodes.split(',').map(node => ethers.utils.formatBytes32String(node.trim()));
      const tx = await nodeOpsContract.stake(nodeArray, ethers.utils.parseUnits(amount, 18));
      await tx.wait();
      setStakingStatus('Staked successfully');
    } catch (error) {
      console.error("Failed to stake:", error);
      setStakingStatus('Staking failed');
    }
  };

  const nominate = async () => {
    if (!signer) {
      await connectWallet();
      return;
    }
    try {
      const nodeOpsContract = new ethers.Contract(nodeOpsAddress, nodeOpsABI, signer);
      const nodeArray = nominateNodes.split(',').map(node => ethers.utils.formatBytes32String(node.trim()));
      const tx = await nodeOpsContract.nominate(nodeArray);
      await tx.wait();
      setNominateStatus('Nominated successfully');
    } catch (error) {
      console.error("Failed to nominate:", error);
      setNominateStatus('Nomination failed');
    }
  };

  const unstake = async () => {
    if (!signer) {
      await connectWallet();
      return;
    }
    try {
      const nodeOpsContract = new ethers.Contract(nodeOpsAddress, nodeOpsABI, signer);
      const tx = await nodeOpsContract.unstake();
      await tx.wait();
      setUnstakeStatus('Unstake requested successfully');
    } catch (error) {
      console.error("Failed to request unstake:", error);
      setUnstakeStatus('Unstake request failed');
    }
  };

  const cancelUnstake = async () => {
    if (!signer) {
      await connectWallet();
      return;
    }
    try {
      const nodeOpsContract = new ethers.Contract(nodeOpsAddress, nodeOpsABI, signer);
      const tx = await nodeOpsContract.cancelUnstake();
      await tx.wait();
      setCancelUnstakeStatus('Unstake cancelled successfully');
    } catch (error) {
      console.error("Failed to cancel unstake:", error);
      setCancelUnstakeStatus('Cancel unstake failed');
    }
  };

  const requestProcessUnstake = async () => {
    if (!signer) {
      await connectWallet();
      return;
    }
    try {
      const nodeOpsContract = new ethers.Contract(nodeOpsAddress, nodeOpsABI, signer);
      const tx = await nodeOpsContract.requestProcessUnstake();
      await tx.wait();
      setRequestProcessUnstakeStatus('Process unstake requested successfully');
    } catch (error) {
      console.error("Failed to request process unstake:", error);
      setRequestProcessUnstakeStatus('Request process unstake failed');
    }
  };

  return (
    <div className="bg-black py-16 text-white w-full h-full">
      <div className="container mx-auto px-4 flex flex-col items-center h-full">
        <h1 className="text-4xl font-bold mb-8">Stake, Nominate, and Manage Your TestTokens</h1>
        <div className="w-full max-w-md">
          <input
            type="text"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount to stake"
            className="w-full p-2 mb-4 text-black rounded-lg"
          />
          <input
            type="text"
            value={nodes}
            onChange={(e) => setNodes(e.target.value)}
            placeholder="Node addresses for staking (comma-separated)"
            className="w-full p-2 mb-4 text-black rounded-lg"
          />
          <button
            onClick={approveTokens}
            className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg mb-4"
          >
            Approve TestTokens
          </button>
          <button
            onClick={stake}
            className="w-full bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg mb-4"
          >
            Stake
          </button>
          <input
            type="text"
            value={nominateNodes}
            onChange={(e) => setNominateNodes(e.target.value)}
            placeholder="Node addresses for nomination (comma-separated)"
            className="w-full p-2 mb-4 text-black rounded-lg"
          />
          <button
            onClick={nominate}
            className="w-full bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg mb-4"
          >
            Nominate
          </button>
          <button
            onClick={unstake}
            className="w-full bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg mb-4"
          >
            Request Unstake
          </button>
          <button
            onClick={cancelUnstake}
            className="w-full bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded-lg mb-4"
          >
            Cancel Unstake
          </button>
          <button
            onClick={requestProcessUnstake}
            className="w-full bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg mb-4"
          >
            Request Process Unstake
          </button>
          <p className="text-center mb-2">Approval Status: {approvalStatus}</p>
          <p className="text-center mb-2">Staking Status: {stakingStatus}</p>
          <p className="text-center mb-2">Nomination Status: {nominateStatus}</p>
          <p className="text-center mb-2">Unstake Status: {unstakeStatus}</p>
          <p className="text-center mb-2">Cancel Unstake Status: {cancelUnstakeStatus}</p>
          <p className="text-center">Request Process Unstake Status: {requestProcessUnstakeStatus}</p>
        </div>
      </div>
    </div>
  );
};

export { StakingAndNominationComponent as component };