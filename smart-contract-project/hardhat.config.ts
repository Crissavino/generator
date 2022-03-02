import fs from 'fs';
import * as dotenv from 'dotenv';
import { HardhatUserConfig, task } from 'hardhat/config';
import { MerkleTree } from 'merkletreejs';
import keccak256 from 'keccak256';
import '@nomiclabs/hardhat-etherscan';
import '@nomiclabs/hardhat-waffle';
import '@typechain/hardhat';
import 'hardhat-gas-reporter';
import 'solidity-coverage';
import CollectionConfig from './config/CollectionConfig';
import {utils} from "ethers";

dotenv.config();

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task('accounts', 'Prints the list of accounts', async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

task('generate-root-hash', 'Generates and prints out the root hash for the current whitelist', async () => {
  // Check configuration
  if (CollectionConfig.whitelistAddresses.length < 1) {
    throw 'The whitelist is empty, please add some addresses to the configuration.';
  }

  // Build the Merkle Tree
  const leafNodes = CollectionConfig.whitelistAddresses.map(addr => keccak256(addr));
  const merkleTree = new MerkleTree(leafNodes, keccak256, { sortPairs: true });
  const rootHash = '0x' + merkleTree.getRoot().toString('hex');

  console.log('The Merkle Tree root hash for the current whitelist is: ' + rootHash);
});

task('generate-proof', 'Generates and prints out the whitelist proof for the given address (compatible with Etherscan)', async (taskArgs: {address: string}) => {
  // Check configuration
  if (CollectionConfig.whitelistAddresses.length < 1) {
    throw 'The whitelist is empty, please add some addresses to the configuration.';
  }

  // Build the Merkle Tree
  const leafNodes = CollectionConfig.whitelistAddresses.map(addr => keccak256(addr));
  const merkleTree = new MerkleTree(leafNodes, keccak256, { sortPairs: true });
  const proof = merkleTree.getHexProof(keccak256(taskArgs.address)).toString().replace(/'/g, '').replace(/ /g, '');

  console.log('The whitelist proof for the given address is: ' + proof);
})
.addPositionalParam('address', 'The public address');

task('rename-contract', 'Renames the smart contract replacing all occurrences in source files', async (taskArgs: {userUuid: string, newName: string}, hre) => {
  const CollectionConfigFromUser = require(`./config/${taskArgs.userUuid}/CollectionConfig`).default;
  const oldContractFile = `${__dirname}/contracts/${taskArgs.userUuid}/${CollectionConfigFromUser.contractName}.sol`;
  const newContractFile = `${__dirname}/contracts/${taskArgs.userUuid}/${taskArgs.newName}.sol`;

  if (!fs.existsSync(oldContractFile)) {
    throw `Contract file not found: "${oldContractFile}" (did you change the configuration manually?)`;
  }

  if (fs.existsSync(newContractFile)) {
    throw `A file with that name already exists: "${oldContractFile}"`;
  }

  // Replace names in source files
  // TODO remove this commented code once the minting app is setted
  // replaceInFile(__dirname + '/../minting-dapp-project/src/scripts/lib/NftContractType.ts', CollectionConfigFromUser.contractName, taskArgs.newName);
  // TODO remove this commented code once the minting app is setted
  replaceInFile(__dirname + `/config/${taskArgs.userUuid}/CollectionConfig.ts`, CollectionConfigFromUser.contractName, taskArgs.newName);
  replaceInFile(__dirname + `/lib/${taskArgs.userUuid}/NftContractProvider.ts`, CollectionConfigFromUser.contractName, taskArgs.newName);
  replaceInFile(oldContractFile, CollectionConfigFromUser.contractName, taskArgs.newName);

  // Rename the contract file
  fs.renameSync(oldContractFile, newContractFile);

  console.log(`Contract renamed successfully from "${CollectionConfigFromUser.contractName}" to "${taskArgs.newName}"!`);

  // Rebuilding types
  await hre.run('typechain');
})
    .addPositionalParam('userUuid', 'The user UUID')
    .addPositionalParam('newName', 'The new contract name');

task('rename-contract-old', 'Renames the smart contract replacing all occurrences in source files', async (taskArgs: {newName: string}, hre) => {
  const oldContractFile = `${__dirname}/contracts/${CollectionConfig.contractName}.sol`;
  const newContractFile = `${__dirname}/contracts/${taskArgs.newName}.sol`;

  if (!fs.existsSync(oldContractFile)) {
    throw `Contract file not found: "${oldContractFile}" (did you change the configuration manually?)`;
  }

  if (fs.existsSync(newContractFile)) {
    throw `A file with that name already exists: "${oldContractFile}"`;
  }

  // Replace names in source files
  replaceInFile(__dirname + '/../minting-dapp/src/scripts/lib/NftContractType.ts', CollectionConfig.contractName, taskArgs.newName);
  replaceInFile(__dirname + '/config/CollectionConfig.ts', CollectionConfig.contractName, taskArgs.newName);
  replaceInFile(__dirname + '/lib/NftContractProvider.ts', CollectionConfig.contractName, taskArgs.newName);
  replaceInFile(oldContractFile, CollectionConfig.contractName, taskArgs.newName);

  // Rename the contract file
  fs.renameSync(oldContractFile, newContractFile);

  console.log(`Contract renamed successfully from "${CollectionConfig.contractName}" to "${taskArgs.newName}"!`);

  // Rebuilding types
  await hre.run('typechain');
})
    .addPositionalParam('newName', 'The new name');

task('transfer-ownership', 'Transfer the ownership of the contract to a new owner', async (taskArgs: {userUuid: string, newOwner: string}, hre) => {
  // get contract
  const CollectionConfigFromUser = require(`./config/${taskArgs.userUuid}/CollectionConfig`).default;
  if (CollectionConfigFromUser.contractAddress) {
    const contract = await hre.ethers.getContractAt(CollectionConfigFromUser.contractName, CollectionConfigFromUser.contractAddress);
    const newOwner = taskArgs.newOwner;
    // transfer ownership
    await contract.transferOwnership(newOwner);
    console.log(`Contract ownership transferred to ${newOwner}`);
  }

})
    .addPositionalParam('userUuid', 'The user UUID')
    .addPositionalParam('newOwner', 'The new owner address');

task('deploy', 'Deploy the contract', async (taskArgs: {contractName: string, userUuid: string}, hre) => {
  // get contract
  // const ContractArguments = require(`./config/${taskArgs.userUuid}/ContractArguments`).default;
  const Contract = await hre.ethers.getContractFactory(taskArgs.contractName);
  // deploy the contract and await to be deployed
  const contract = await Contract.deploy(...[
    CollectionConfig.tokenName,
    CollectionConfig.tokenSymbol,
    utils.parseEther(CollectionConfig.whitelistSale.price.toString()),
    CollectionConfig.maxSupply,
    CollectionConfig.whitelistSale.maxMintAmountPerTx,
    CollectionConfig.hiddenMetadataUri,
  ]);
  // get the contract address
  await contract.deployed();

  // const contract = await Contract.deploy(...ContractArguments) as NftContractType;
  //
  console.log('Contract deployed to:', contract.address);
  console.log(`CONTRACT_ADDRESS${contract.address}CONTRACT_ADDRESS`);

})
    .addPositionalParam('contractName', 'The user UUID')
    .addPositionalParam('userUuid', 'The user UUID');

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.9',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: 'USD',
    coinmarketcap: process.env.GAS_REPORTER_COIN_MARKET_CAP_API_KEY,
  },
  etherscan: {
    apiKey: process.env.POLYGONSCAN_API_KEY,
  }
};

// Setup Rinkeby network
if (process.env.NETWORK_RINKEBY_URL !== undefined) {
  config.networks!.rinkeby = {
    url: process.env.NETWORK_RINKEBY_URL,
    accounts: [process.env.NETWORK_RINKEBY_PRIVATE_KEY!],
  };
}

// Setup Ethereum network
if (process.env.NETWORK_MAINNET_URL !== undefined) {
  config.networks!.mainnet = {
    url: process.env.NETWORK_MAINNET_URL,
    accounts: [process.env.NETWORK_MAINNET_PRIVATE_KEY!],
  };
}

// Setup Polygon main network
if (process.env.NETWORK_POLYGON_MAINNET_URL !== undefined) {
  config.networks!.polygonMainnet = {
    url: process.env.NETWORK_POLYGON_MAINNET_URL,
    accounts: [process.env.NETWORK_POLYGON_MAINNET_PRIVATE_KEY!],
  };
}

// Setup Polygon test network
if (process.env.NETWORK_POLYGON_MUMBAI_URL !== undefined) {
  config.networks!.polygonTest = {
    chainId: 80001,
    url: process.env.NETWORK_POLYGON_MUMBAI_URL,
    accounts: [process.env.NETWORK_POLYGON_MUMBAI_PRIVATE_KEY!],
  };
}

export default config;

/**
 * Replaces all occurrences of a string in the given file. 
 */
function replaceInFile(file: string, search: string, replace: string): void
{
  const fileContent = fs.readFileSync(file, 'utf8').replace(new RegExp(search, 'g'), replace);

  fs.writeFileSync(file, fileContent, 'utf8');
}
