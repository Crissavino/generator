const { MODE } = require(`BLEND_MODE`);

const network = "NETWORK_TO_USE";

// General metadata for Ethereum
const namePrefix = "NFT_COLLECTION_NAME";
const description = "NFT_COLLECTION_DESCRIPTION";
const baseUri = "NFT_COLLECTION_IPFS_BASE_URI";

const solanaMetadata = {
  symbol: "NFT_COLLECTION_SYMBOL",
  seller_fee_basis_points: NFT_COLLECTION_ROYALTIES_FOR_SECOND_SALES, // Define how much % you want from secondary market sales 1000 = 10%
  external_url: "NFT_COLLECTION_EXTERNAL_URL",
  creators: NFT_COLLECTION_CREATORS,
};

// If you have selected Solana then the collection starts from 0 automatically
const layerConfigurations = [
  {
    growEditionSizeTo: GROW_EDITION_SIZE_TO,
    layersOrder: LAYERS_ORDER
  },
];
const shuffleLayerConfigurations = false;

const debugLogs = false;

const format = {
  width: 512,
  height: 512,
  smoothing: false,
};

const gif = {
  // export: false,
  export: true,
  repeat: 0,
  quality: 100,
  delay: 500,
};

const text = {
  only: false,
  color: "#ffffff",
  size: 20,
  xGap: 40,
  yGap: 40,
  align: "left",
  baseline: "top",
  weight: "regular",
  family: "Courier",
  spacer: " => ",
};

const pixelFormat = {
  ratio: 10 / 128,
};

const background = {
  generate: true,
  brightness: "80%",
  static: false,
  default: "#000000",
};

const extraMetadata = {};

const rarityDelimiter = "#";

const uniqueDnaTorrance = 10000;

const preview = {
  thumbPerRow: 5,
  thumbWidth: 50,
  imageRatio: format.height / format.width,
  imageName: "preview.png",
};

const preview_gif = {
  numberOfImages: 5,
  order: "ASC", // ASC, DESC, MIXED
  repeat: 0,
  quality: 100,
  delay: 500,
  imageName: "preview.gif",
};

module.exports = {
  format,
  baseUri,
  description,
  background,
  uniqueDnaTorrance,
  layerConfigurations,
  rarityDelimiter,
  preview,
  shuffleLayerConfigurations,
  debugLogs,
  extraMetadata,
  pixelFormat,
  text,
  namePrefix,
  network,
  solanaMetadata,
  gif,
  preview_gif,
};
