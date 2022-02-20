const fs = require("fs");

const {
  baseUri,
  description,
  namePrefix,
  network,
  solanaMetadata,
} = require(`PUBLIC_USER_FOLDER/config.js`);

// read json data
let rawData = fs.readFileSync(`PUBLIC_USER_FOLDER/build/json/_metadata.json`);
let data = JSON.parse(rawData);

data.forEach((item) => {
  if (network === 'sol') {
    item.name = `${namePrefix} #${item.edition}`;
    item.description = description;
    item.creators = solanaMetadata.creators;
  } else {
    item.name = `${namePrefix} #${item.edition}`;
    item.description = description;
    item.image = `${baseUri}/${item.edition}.png`;
  }
  fs.writeFileSync(
    `PUBLIC_USER_FOLDER/build/json/${item.edition}.json`,
    JSON.stringify(item, null, 2)
  );
});

fs.writeFileSync(
  `PUBLIC_USER_FOLDER/build/json/_metadata.json`,
  JSON.stringify(data, null, 2)
);

if (network === 'sol') {
  console.log(`Updated description for images to ===> ${description}`);
  console.log(`Updated name prefix for images to ===> ${namePrefix}`);
  console.log(
    `Updated creators for images to ===> ${JSON.stringify(
      solanaMetadata.creators
    )}`
  );
} else {
  console.log(`Updated baseUri for images to ===> ${baseUri}`);
  console.log(`Updated description for images to ===> ${description}`);
  console.log(`Updated name prefix for images to ===> ${namePrefix}`);
}
