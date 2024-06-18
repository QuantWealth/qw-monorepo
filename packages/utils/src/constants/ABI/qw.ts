export const QW_MANAGER_ABI = [
  // Constructor
  "constructor()",

  // View functions
  "function REGISTRY() view returns (address)",
  "function owner() view returns (address)",

  // Non-payable functions
  "function close(address[] _targetQwChild, bytes[] _callData)",
  "function execute(address[] _targetQwChild, bytes[] _callData, address _tokenAddress, uint256 _amount)",
  "function receiveFunds(address user, address _tokenAddress, uint256 _amount)",
  "function renounceOwnership()",
  "function transferOwnership(address newOwner)",
  "function withdraw(address user, address _tokenAddress, uint256 _amount)",

  // Events
  "event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)",

  // Errors
  "error CallFailed()",
  "error ContractNotWhitelisted()",
  "error InvalidInputLength()",
  "error OwnableInvalidOwner(address owner)",
  "error OwnableUnauthorizedAccount(address account)"
];
