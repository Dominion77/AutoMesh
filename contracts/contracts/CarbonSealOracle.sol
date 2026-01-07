pragma solidity ^0.8.20;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title CarbonSealOracle
 * @dev Oracle for external data verification (Chainlink or custom)
 */
contract CarbonSealOracle is AccessControl {
    AggregatorV3Interface internal carbonPriceFeed;
    
    mapping(string => bool) public verifiedDataSources;
    mapping(bytes32 => bool) public verifiedProofs;
    
    event DataVerified(
        bytes32 indexed proofHash,
        address indexed verifier,
        uint256 timestamp
    );
    
    event PriceUpdated(
        int256 price,
        uint256 timestamp
    );
    
    constructor(address _carbonPriceFeed) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        
        if (_carbonPriceFeed != address(0)) {
            carbonPriceFeed = AggregatorV3Interface(_carbonPriceFeed);
        }
        
        verifiedDataSources["sentinel-2"] = true;
        verifiedDataSources["planet-labs"] = true;
        verifiedDataSources["soil-sensor-v1"] = true;
    }
    
    /**
     * @dev Verify satellite data hash
     */
    function verifySatelliteData(
        bytes32 _dataHash,
        string memory _source
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(verifiedDataSources[_source], "CarbonSealOracle: Unverified source");
        verifiedProofs[_dataHash] = true;
        
        emit DataVerified(_dataHash, msg.sender, block.timestamp);
    }
    
    /**
     * @dev Get current carbon price from Chainlink
     */
    function getCarbonPrice() external view returns (int256) {
        if (address(carbonPriceFeed) == address(0)) {
            return 50 * 10**8; 
        }
        
        (
            /* uint80 roundID */,
            int256 price,
            /* uint startedAt */,
            /* uint timeStamp */,
            /* uint80 answeredInRound */
        ) = carbonPriceFeed.latestRoundData();
        
        return price;
    }
    
    /**
     * @dev Check if proof is verified
     */
    function isProofVerified(bytes32 _proofHash) external view returns (bool) {
        return verifiedProofs[_proofHash];
    }
    
    /**
     * @dev Add new data source
     */
    function addDataSource(
        string memory _source,
        bool _trusted
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        verifiedDataSources[_source] = _trusted;
    }
}