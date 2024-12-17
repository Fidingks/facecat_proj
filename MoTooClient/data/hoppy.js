const { Web3 } = require('web3');
const web3 = new Web3('https://holesky.infura.io/v3/b027a8da4e2a46f5aaa43ceebc3ec2dd');

// 代币合约地址（例如USDT的合约地址）
const tokenAddress = '0x6E79B51959CF968d87826592f46f819F92466615'; 

// ERC-20 代币 ABI（简化版，只包含我们需要的方法）
const tokenABI = [
  // 查询代币名称
  {
    "constant": true,
    "inputs": [],
    "name": "name",
    "outputs": [{"name": "", "type": "string"}],
    "type": "function"
  },
  // 查询代币符号
  {
    "constant": true,
    "inputs": [],
    "name": "symbol",
    "outputs": [{"name": "", "type": "string"}],
    "type": "function"
  },
  // 查询代币小数位
  {
    "constant": true,
    "inputs": [],
    "name": "decimals",
    "outputs": [{"name": "", "type": "uint8"}],
    "type": "function"
  }
];

// 代币合约对象
const tokenContract = new web3.eth.Contract(tokenABI, tokenAddress);

// 获取代币信息
async function getTokenInfo() {
  try {
    const name = await tokenContract.methods.name().call();
    const symbol = await tokenContract.methods.symbol().call();
    const decimals = await tokenContract.methods.decimals().call();
    
    console.log(`Token Name: ${name}`);
    console.log(`Token Symbol: ${symbol}`);
    console.log(`Decimals: ${decimals}`);
  } catch (error) {
    console.error('Error fetching token info:', error);
  }
}

getTokenInfo();
