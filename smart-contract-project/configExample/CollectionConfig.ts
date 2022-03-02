import CollectionConfigInterface from '../../lib/USER_UUID/CollectionConfigInterface';
import whitelistAddresses from './whitelist.json';

const CollectionConfig: CollectionConfigInterface = {
  // The contract name can be updated using the following command:
  // yarn rename-contract NEW_CONTRACT_NAME
  // Please DO NOT change it manually!
  contractName: 'YourNftToken',
  tokenName: 'TOKEN_NAME',
  tokenSymbol: 'TOKEN_SYMBOL', // nftCollections.symbol
  hiddenMetadataUri: 'ipfs://__CID__/hidden.json',
  maxSupply: MAX_SUPPLY, // projects.numberToGenerate
  whitelistSale: {
    price: WHITE_LIST_PRICE,
    maxMintAmountPerTx: WHITE_LIST_MAX_MINT,
  },
  preSale: {
    price: PRE_SALE_PRICE,
    maxMintAmountPerTx: PRE_SALE_MAX_MINT,
  },
  publicSale: {
    price: PUBLIC_PRICE,
    maxMintAmountPerTx: PUBLIC_MAX_MINT,
  },
  contractAddress: 'CONTRACT_ADDRESS', // update contract address
  openSeaSlug: 'TOKEN_NAME_SLUG', //token name sluglify
  whitelistAddresses: whitelistAddresses,
};

export default CollectionConfig;
