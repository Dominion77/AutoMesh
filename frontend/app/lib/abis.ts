export const CarbonSealRegistryABI = [
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "farmer",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "farmId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "area",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "location",
        "type": "string"
      }
    ],
    "name": "FarmRegistered",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "farmId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "readingId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "source",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "verificationHash",
        "type": "string"
      }
    ],
    "name": "CarbonAdded",
    "type": "event"
  },
  
  // Functions
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_name",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "_area",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "_location",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_soilType",
        "type": "string"
      }
    ],
    "name": "registerFarm",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_farmId",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_amount",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "_source",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_verificationHash",
        "type": "string"
      }
    ],
    "name": "addCarbonReading",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_farmer",
        "type": "address"
      }
    ],
    "name": "getFarmByAddress",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "farmId",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "farmer",
            "type": "address"
          },
          {
            "internalType": "string",
            "name": "name",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "area",
            "type": "uint256"
          },
          {
            "internalType": "string",
            "name": "location",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "soilType",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "totalCarbon",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "carbonDebt",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "lastReadingTimestamp",
            "type": "uint256"
          },
          {
            "internalType": "bool",
            "name": "isActive",
            "type": "bool"
          },
          {
            "internalType": "uint256",
            "name": "createdAt",
            "type": "uint256"
          }
        ],
        "internalType": "struct CarbonSealRegistry.Farm",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_farmId",
        "type": "uint256"
      }
    ],
    "name": "getAvailableCarbon",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "MIN_CARBON_TO_MINT",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

export const CarbonSealTokenABI = [
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "farmer",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "farmId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "carbonAmount",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "methodology",
        "type": "string"
      }
    ],
    "name": "CreditMinted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "retiredBy",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "reason",
        "type": "string"
      }
    ],
    "name": "CreditRetired",
    "type": "event"
  },
  
  // Functions
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "_farmId",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_amount",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "_methodology",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_tokenURI",
        "type": "string"
      }
    ],
    "name": "mintCredit",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_tokenId",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "_reason",
        "type": "string"
      }
    ],
    "name": "retireCredit",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_tokenId",
        "type": "uint256"
      }
    ],
    "name": "getCreditDetails",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "tokenId",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "farmId",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "farmer",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "carbonAmount",
            "type": "uint256"
          },
          {
            "internalType": "string",
            "name": "methodology",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "vintage",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "mintedAt",
            "type": "uint256"
          },
          {
            "internalType": "bool",
            "name": "isRetired",
            "type": "bool"
          },
          {
            "internalType": "uint256",
            "name": "retiredAt",
            "type": "uint256"
          },
          {
            "internalType": "string",
            "name": "retirementReason",
            "type": "string"
          }
        ],
        "internalType": "struct CarbonSealToken.CarbonCredit",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "ownerOf",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_farmId",
        "type": "uint256"
      }
    ],
    "name": "getFarmCredits",
    "outputs": [
      {
        "internalType": "uint256[]",
        "name": "",
        "type": "uint256[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;