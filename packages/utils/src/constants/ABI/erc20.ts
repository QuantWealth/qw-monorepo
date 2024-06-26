export const ERC20_ABI = [
    // Read-Only Functions
    "function name() public view returns (string)",
    "function balanceOf(address owner) view returns (uint256)",
    "function decimals() view returns (uint8)",
    "function totalSupply() public view returns (uint256)",
    "function symbol() view returns (string)",
    "function allowance(address _owner, address _spender) public view returns (uint256 remaining)",
  
    // Authenticated Functions
    "function transfer(address to, uint amount) returns (bool)",
    "function mint(address account, uint256 amount)",
    "function approve(address _spender, uint256 _value) public returns (bool success)",
    "function transferFrom(address _from, address _to, uint256 _value) public returns (bool success)",
  ];
  