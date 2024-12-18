
import React from 'react';
import * as ethers from 'ethers';

const NodeOpsABI = [
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
  }
];

const TestTokenABI = [
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

const StakingComponent: React.FC = () => {
  const [amount, setAmount] = React.useState('');
  const [nodes, setNodes] = React.useState('');
  const [status, setStatus] = React.useState('');
  const [error, setError] = React.useState('');

  const nodeOpsAddress = '0x0744d79f3e8f0a3652d886c9c49cb476a05de248';
  const testTokenAddress = '0x2c87f28573824f65f75c8a0437f444605214ae41';
  const requiredChainId = 137;

  const connectWallet = async () => {
    try {
      await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
      checkAndSwitchChain();
    } catch (err) {
      setError('Failed to connect wallet. Please try again.');
    }
  };

  const checkAndSwitchChain = async () => {
    const provider = new ethers.providers.Web3Provider((window as any).ethereum);
    const network = await provider.getNetwork();
    if (network.chainId !== requiredChainId) {
      try {
        await (window as any).ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: ethers.utils.hexValue(requiredChainId) }],
        });
      } catch (err) {
        setError(`Please switch to the Polygon network (Chain ID: ${requiredChainId})`);
      }
    }
  };

  const approveToken = async () => {
    try {
      await connectWallet();
      const provider = new ethers.providers.Web3Provider((window as any).ethereum);
      const signer = provider.getSigner();
      const testToken = new ethers.Contract(testTokenAddress, TestTokenABI, signer);
      const tx = await testToken.approve(nodeOpsAddress, ethers.constants.MaxUint256);
      setStatus('Approving TestToken...');
      await tx.wait();
      setStatus('TestToken approved successfully');
    } catch (err) {
      setError('Failed to approve TestToken. Please try again.');
    }
  };

  const stake = async () => {
    try {
      await connectWallet();
      const provider = new ethers.providers.Web3Provider((window as any).ethereum);
      const signer = provider.getSigner();
      const nodeOps = new ethers.Contract(nodeOpsAddress, NodeOpsABI, signer);
      
      const nodeArray = nodes.split(',').map(node => ethers.utils.formatBytes32String(node.trim()));
      const amountInWei = ethers.utils.parseEther(amount);
      
      const tx = await nodeOps.stake(nodeArray, amountInWei);
      setStatus('Staking in progress...');
      await tx.wait();
      setStatus('Staking successful');
    } catch (err) {
      setError('Failed to stake. Please make sure you have approved TestToken and have sufficient balance.');
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen p-5">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-4">Stake Tokens</h1>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="amount">
            Amount to Stake
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="amount"
            type="text"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="nodes">
            Nodes (comma-separated)
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="nodes"
            type="text"
            placeholder="Enter nodes"
            value={nodes}
            onChange={(e) => setNodes(e.target.value)}
          />
        </div>
        <div className="flex flex-col space-y-4">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            onClick={approveToken}
          >
            Approve TestToken
          </button>
          <button
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            onClick={stake}
          >
            Stake
          </button>
        </div>
        {status && <p className="mt-4 text-green-600">{status}</p>}
        {error && <p className="mt-4 text-red-600">{error}</p>}
      </div>
    </div>
  );
};

export { StakingComponent as component };
