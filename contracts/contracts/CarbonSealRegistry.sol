pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

/**
 * @title CarbonSealRegistry
 * @dev Main registry for farms and carbon tracking
 */
contract CarbonSealRegistry is AccessControl {
    using EnumerableSet for EnumerableSet.AddressSet;
    
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");
    bytes32 public constant ORACLE_ROLE = keccak256("ORACLE_ROLE");
    
    uint256 public constant MIN_CARBON_TO_MINT = 1000 * 10**18; 
    uint256 public constant PRECISION = 10**18;
    
    struct Farm {
        uint256 farmId;
        address farmer;
        string name;
        uint256 area; 
        string location; 
        string soilType;
        uint256 totalCarbon; 
        uint256 carbonDebt; 
        uint256 lastReadingTimestamp;
        bool isActive;
        uint256 createdAt;
    }
    
    
    struct CarbonReading {
        uint256 readingId;
        uint256 farmId;
        uint256 amount;
        string source; 
        string verificationHash;
        uint256 timestamp;
        address verifiedBy;
    }
    
    
    uint256 public farmCounter;
    uint256 public readingCounter;
    
    mapping(uint256 => Farm) public farms;
    mapping(address => uint256) public addressToFarmId;
    mapping(uint256 => CarbonReading[]) public farmReadings;
    mapping(uint256 => uint256[]) public farmCredits; 
    
    
    EnumerableSet.AddressSet private activeFarmers;
    
    event FarmRegistered(
        address indexed farmer,
        uint256 indexed farmId,
        string name,
        uint256 area,
        string location
    );
    
    event CarbonAdded(
        uint256 indexed farmId,
        uint256 indexed readingId,
        uint256 amount,
        string source,
        string verificationHash
    );
    
    event CarbonDebtUpdated(
        uint256 indexed farmId,
        uint256 newDebt,
        uint256 availableCarbon
    );
    
    modifier onlyFarmer(uint256 _farmId) {
        require(
            farms[_farmId].farmer == msg.sender || hasRole(DEFAULT_ADMIN_ROLE, msg.sender),
            "CarbonSeal: Not farm owner"
        );
        _;
    }
    
    modifier onlyActiveFarm(uint256 _farmId) {
        require(farms[_farmId].isActive, "CarbonSeal: Farm not active");
        _;
    }
    
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(VERIFIER_ROLE, msg.sender);
        _grantRole(ORACLE_ROLE, msg.sender);
        
        farmCounter = 0;
        readingCounter = 0;
    }
    
    /**
     * @dev Register a new farm
     */
    function registerFarm(
        string memory _name,
        uint256 _area,
        string memory _location,
        string memory _soilType
    ) external returns (uint256) {
        require(addressToFarmId[msg.sender] == 0, "CarbonSeal: Already registered");
        require(_area > 0, "CarbonSeal: Area must be positive");
        require(bytes(_name).length > 0, "CarbonSeal: Name required");
        
        farmCounter++;
        
        Farm memory newFarm = Farm({
            farmId: farmCounter,
            farmer: msg.sender,
            name: _name,
            area: _area,
            location: _location,
            soilType: _soilType,
            totalCarbon: 0,
            carbonDebt: 0,
            lastReadingTimestamp: block.timestamp,
            isActive: true,
            createdAt: block.timestamp
        });
        
        farms[farmCounter] = newFarm;
        addressToFarmId[msg.sender] = farmCounter;
        activeFarmers.add(msg.sender);
        
        emit FarmRegistered(msg.sender, farmCounter, _name, _area, _location);
        return farmCounter;
    }
    
    /**
     * @dev Add carbon reading to a farm (can be called by farmer, oracle, or verifier)
     */
    function addCarbonReading(
        uint256 _farmId,
        uint256 _amount,
        string memory _source,
        string memory _verificationHash
    ) external onlyActiveFarm(_farmId) returns (uint256) {
        require(
            msg.sender == farms[_farmId].farmer ||
            hasRole(ORACLE_ROLE, msg.sender) ||
            hasRole(VERIFIER_ROLE, msg.sender),
            "CarbonSeal: Not authorized"
        );
        require(_amount > 0, "CarbonSeal: Amount must be positive");
        
        readingCounter++;
        
        CarbonReading memory reading = CarbonReading({
            readingId: readingCounter,
            farmId: _farmId,
            amount: _amount,
            source: _source,
            verificationHash: _verificationHash,
            timestamp: block.timestamp,
            verifiedBy: msg.sender
        });
        
        farmReadings[_farmId].push(reading);
        
        farms[_farmId].totalCarbon += _amount;
        farms[_farmId].lastReadingTimestamp = block.timestamp;
        
        emit CarbonAdded(_farmId, readingCounter, _amount, _source, _verificationHash);
        return readingCounter;
    }
    
    /**
     * @dev Add batch readings (efficient for multiple readings)
     */
    function addCarbonReadingsBatch(
        uint256 _farmId,
        uint256[] memory _amounts,
        string[] memory _sources,
        string[] memory _verificationHashes
    ) external onlyActiveFarm(_farmId) returns (uint256[] memory) {
        require(
            msg.sender == farms[_farmId].farmer ||
            hasRole(ORACLE_ROLE, msg.sender),
            "CarbonSeal: Not authorized"
        );
        require(
            _amounts.length == _sources.length && 
            _amounts.length == _verificationHashes.length,
            "CarbonSeal: Array length mismatch"
        );
        
        uint256[] memory readingIds = new uint256[](_amounts.length);
        uint256 totalAdded = 0;
        
        for (uint256 i = 0; i < _amounts.length; i++) {
            require(_amounts[i] > 0, "CarbonSeal: Amount must be positive");
            
            readingCounter++;
            
            CarbonReading memory reading = CarbonReading({
                readingId: readingCounter,
                farmId: _farmId,
                amount: _amounts[i],
                source: _sources[i],
                verificationHash: _verificationHashes[i],
                timestamp: block.timestamp,
                verifiedBy: msg.sender
            });
            
            farmReadings[_farmId].push(reading);
            readingIds[i] = readingCounter;
            totalAdded += _amounts[i];
        }
        
        farms[_farmId].totalCarbon += totalAdded;
        farms[_farmId].lastReadingTimestamp = block.timestamp;
        
        return readingIds;
    }
    
    /**
     * @dev Get available carbon for minting (total - debt)
     */
    function getAvailableCarbon(uint256 _farmId) 
        public 
        view 
        returns (uint256) 
    {
        Farm memory farm = farms[_farmId];
        if (farm.totalCarbon > farm.carbonDebt) {
            return farm.totalCarbon - farm.carbonDebt;
        }
        return 0;
    }
    
    /**
     * @dev Update carbon debt when credits are minted (called by CarbonSealToken)
     */
    function updateCarbonDebt(
        uint256 _farmId, 
        uint256 _amount
    ) external returns (bool) {
        require(
            msg.sender == address(tokenContract),
            "CarbonSeal: Only token contract"
        );
        require(_amount > 0, "CarbonSeal: Amount must be positive");
        
        uint256 available = getAvailableCarbon(_farmId);
        require(available >= _amount, "CarbonSeal: Insufficient carbon");
        
        farms[_farmId].carbonDebt += _amount;
        
        emit CarbonDebtUpdated(_farmId, farms[_farmId].carbonDebt, available - _amount);
        return true;
    }
    
    /**
     * @dev Get farm statistics
     */
    function getFarmStats(uint256 _farmId) 
        external 
        view 
        returns (
            uint256 totalCarbon,
            uint256 carbonDebt,
            uint256 availableCarbon,
            uint256 readingCount,
            uint256 creditCount,
            uint256 lastUpdate
        ) 
    {
        Farm memory farm = farms[_farmId];
        return (
            farm.totalCarbon,
            farm.carbonDebt,
            getAvailableCarbon(_farmId),
            farmReadings[_farmId].length,
            farmCredits[_farmId].length,
            farm.lastReadingTimestamp
        );
    }
    
    /**
     * @dev Get recent readings for a farm
     */
    function getRecentReadings(uint256 _farmId, uint256 _count) 
        external 
        view 
        returns (CarbonReading[] memory) 
    {
        uint256 total = farmReadings[_farmId].length;
        uint256 count = _count > total ? total : _count;
        
        CarbonReading[] memory recent = new CarbonReading[](count);
        for (uint256 i = 0; i < count; i++) {
            recent[i] = farmReadings[_farmId][total - 1 - i];
        }
        return recent;
    }
    
    /**
     * @dev Add a credit to farm's credit list (called by CarbonSealToken)
     */
    function addCreditToFarm(uint256 _farmId, uint256 _tokenId) external {
        require(
            msg.sender == address(tokenContract),
            "CarbonSeal: Only token contract"
        );
        farmCredits[_farmId].push(_tokenId);
    }
    
    function getFarmByAddress(address _farmer) external view returns (Farm memory) {
        uint256 farmId = addressToFarmId[_farmer];
        require(farmId > 0, "CarbonSeal: No farm found");
        return farms[farmId];
    }
    
    function getTotalFarms() external view returns (uint256) {
        return farmCounter;
    }
    
    function getActiveFarmers() external view returns (address[] memory) {
        return activeFarmers.values();
    }
    
    function setTokenContract(address _tokenContract) external onlyRole(DEFAULT_ADMIN_ROLE) {
        tokenContract = ICarbonSealToken(_tokenContract);
    }
    
    function deactivateFarm(uint256 _farmId) external onlyRole(DEFAULT_ADMIN_ROLE) {
        farms[_farmId].isActive = false;
        activeFarmers.remove(farms[_farmId].farmer);
    }
    
    function activateFarm(uint256 _farmId) external onlyRole(DEFAULT_ADMIN_ROLE) {
        farms[_farmId].isActive = true;
        activeFarmers.add(farms[_farmId].farmer);
    }
    
    ICarbonSealToken public tokenContract;
}

interface ICarbonSealToken {
    function mintCredit(
        address _to,
        uint256 _farmId,
        uint256 _amount,
        string memory _methodology,
        string memory _tokenURI
    ) external returns (uint256);
}