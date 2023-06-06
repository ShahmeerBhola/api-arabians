const express = require("express");
const Web3 = require("web3");
const axios = require("axios");

const app = express();
const port = 5000;

// Ethereum provider URL
const providerUrl =
  "https://mainnet.infura.io/v3/6da4e973f4ce4bfa905fca9323610818"; // Replace with your Infura project ID
const web3 = new Web3(new Web3.providers.HttpProvider(providerUrl));

// Replace `MyContract` with the actual name of your ERC721 contract
const contractAbi = require("../abi.json");
const contractAddress = "0x3Fc19E076043D2466429BcA55AFafafb4Fc22464"; // Replace with your contract address

const myContract = new web3.eth.Contract(contractAbi, contractAddress);

// Base URL of the NFT metadata
const metadataBaseUrl =
  "https://hollywoodpunks.mypinata.cloud/ipfs/QmRgK13azyKTXbaaW5yhFxqtpEUPZje9zPTxEhVBqAAKSg/";


// API endpoint to check if an NFT is minted and return metadata if true
app.get("/nft/:nftId", async (req, res) => {
  const nftId = req.params.nftId;

  // Validate the input
  if (!Number.isInteger(parseInt(nftId))) {
    return res.status(400).json({ success: false, error: "Invalid NFT ID" });
  }

  try {
    // Call the contract's `ownerOf` function to get the owner of the NFT
    const owner = await myContract.methods.ownerOf(nftId).call();

    // If the owner is the zero address, it means the NFT is not minted
    const isMinted = owner !== "0x0000000000000000000000000000000000000000";

    // Return the result as JSON
    if (isMinted) {
      // Construct the metadata URL with the last digit of the NFT ID
      const metadataUrl = metadataBaseUrl + nftId.toString();

      // Fetch the metadata from the constructed URL
      const metadata = await axios.get(metadataUrl);
      // Return the metadata in the API response
      res.json(metadata.data);
    } else {
      res.json({ success: true, isMinted });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json("NFT ID is not minted yet");
  }
});

// Handle undefined routes
app.use((req, res) => {
  res.status(404).json({ success: false, error: "Route not found" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ success: false, error: "Internal server error" });
});

// Start the server
app.listen(port, () => {
  console.log(`API server is running on port ${port}`);
});
