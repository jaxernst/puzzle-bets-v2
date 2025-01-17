// Contract to hide and forward funds to addresses

/*
  Contract to distribute revenue to addresses with an allocation
  
  - Admin sets split percentages with a set() function
    - Take in an array of addresses and an array of allocations values (in Bips)

  - Admin permissions can be burned
  - A user with an allocation can change their recipient address at any time
  - Contract collects payments and distributes to all addresses at once (for simplicity)


  Approach:

  setAllocations(addresses, allocations)
  getAllocation(address)
  updateRecipientAddress() 
  burnAdmin()
  distribute()

  Datastructure options:
    - Array of structs
      - Unideal because whole thing will need to be loaded into memory for each distribution
    
    - Incrementing id with map:
      - Each allocation is given an id that auto increments for every allocated address
      - can store a map of id => allocation and id => recipient (or id => { address, recipient })
      - also store a map of address => id for easy lookup when updating your recipient address
      - For distribution: Start at the first id and increment up to lookup and send each allocation. Stop once we
        hit the limit
*/
contract FeeSplits {
  uint256 public nextId;
  mapping(address => uint256) public addrIds;
  mapping(uint256 => address) public recipients;
  mapping(uint256 => uint16) public allocationBps;

  address public admin;

  constructor() {}

  function setAdmin(address newAdmin) public {}

  function setAllocation() public {}

  function getAllocation() public {}

  function distribute() public {}
}
