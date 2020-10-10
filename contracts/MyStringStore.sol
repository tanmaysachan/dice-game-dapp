pragma solidity ^0.5.0;

contract MyStringStore {
  mapping (uint => uint) dieLeft;

  uint public currentTurn;
  uint public roundStarter;

  bool gameStarted;
  uint turnsSoFar;

  bool public fetchable;

  uint pool;

  mapping(uint => address payable) addressMap;
  mapping(address => uint) reverseAddressMap;

  uint public face;
  uint public bet;

  uint public roundWinner;
  uint public roundLoser;

  mapping(address => uint) hashedRolls1;
  mapping(address => uint) hashedRolls2;
  mapping(address => uint) hashedRolls3;
  mapping(address => uint) hashedRolls4;
  mapping(address => uint) hashedRolls5;

  mapping(uint => uint) counts;

  constructor () public {
    fetchable = false;
    gameStarted = false;
    resetRound(1);
  }

  function registerPlayer(uint player) public {
    require(gameStarted == false, "Game has already begun, cannot register now");
    addressMap[player] = msg.sender;
    reverseAddressMap[msg.sender] = player;
  }

  function validatePlayer(uint player) pure private returns (uint) {
    if (player == 0) return 4;
    if (player == 5) return 1;
    if (player > 5 || player < 0) return 100000000;
  }

  function resetRound(uint firstplayer) private {
    face = (uint(keccak256(abi.encodePacked(now)))%6) + 1;
    bet = 0;
    currentTurn = firstplayer;
    roundStarter = firstplayer;
    turnsSoFar = 0;

    roundWinner = 0;
    roundLoser = 0;

    counts[1] = 0;
    counts[2] = 0;
    counts[3] = 0;
    counts[4] = 0;
    counts[5] = 0;

    pool = 0;
  }
  
  function getDiceCount(uint player) public view returns (uint) {
    return dieLeft[player];
  }
  
  function raise(uint incomingbet) public payable {
    require(msg.sender == addressMap[currentTurn], "Not your turn");
    require(dieLeft[currentTurn] > 0, "Dice over for you, game over");
    require(incomingbet >= bet, "illegal bid");
    require(msg.value >= 5, "Minimum pay is 5 wei");
    bet = incomingbet;
  }

  function callPrev() public {
    require(msg.sender == addressMap[currentTurn], "Not your turn");
    require(dieLeft[currentTurn] > 0, "Dice over for you, game over");
    require(currentTurn != roundStarter, "Person who started the round cannot call the bet of the previous player");

    getRoundWinner();

  }

  function getRandom(address addr, uint nonce, uint key) view private returns (uint) {
    return (uint(keccak256(abi.encodePacked(now, addr, nonce*key)))%6) + 1;
  }

  function roll(uint nonce) public {
    require(msg.sender == addressMap[currentTurn], "Not your turn");
    require(dieLeft[currentTurn] > 0, "Dice over for you, game over");

    if (dieLeft[currentTurn] > 0) {
      uint rnd = getRandom(msg.sender, nonce, 1);
      hashedRolls1[msg.sender] = rnd;
      counts[rnd] += 1;
    } else {
      hashedRolls1[msg.sender] = 0;
    }
    if (dieLeft[currentTurn] > 1) {
      uint rnd = getRandom(msg.sender, nonce, 2);
      hashedRolls2[msg.sender] = rnd;
      counts[rnd] += 1;
    } else {
      hashedRolls2[msg.sender] = 0;
    }
    if (dieLeft[currentTurn] > 2) {
      uint rnd = getRandom(msg.sender, nonce, 3);
      hashedRolls3[msg.sender] = rnd;
      counts[rnd] += 1;
    } else {
      hashedRolls3[msg.sender] = 0;
    }
    if (dieLeft[currentTurn] > 3) {
      uint rnd = getRandom(msg.sender, nonce, 4);
      hashedRolls4[msg.sender] = rnd;
      counts[rnd] += 1;
    } else {
      hashedRolls4[msg.sender] = 0;
    }
    if (dieLeft[currentTurn] > 4) {
      uint rnd = getRandom(msg.sender, nonce, 5);
      hashedRolls5[msg.sender] = rnd;
      counts[rnd] += 1;
    } else {
      hashedRolls5[msg.sender] = 0;
    }

    turnsSoFar += 1;

    currentTurn %= 4;
    currentTurn += 1;

    gameStarted = true;
    fetchable = false;
  }

  function transferPool(uint player) private {
    addressMap[player].transfer(pool);
  }

  function revealDie() public view returns (uint[5] memory) {
    require(fetchable, "Can\'t view dice right now");
    return([hashedRolls1[msg.sender], hashedRolls2[msg.sender],
        hashedRolls3[msg.sender], hashedRolls4[msg.sender], hashedRolls5[msg.sender]]);
  }

  function getRoundWinner() private {
    if (counts[face] >= bet) {
      uint player = currentTurn - 1;
      if (currentTurn == 0) currentTurn = 4;

      transferPool(player);
      roundWinner = player;
      roundLoser = currentTurn;
      resetRound(player);
    } else {
      uint player = currentTurn - 1;
      if (currentTurn == 0) currentTurn = 4;

      transferPool(currentTurn);
      roundWinner = currentTurn;
      roundLoser = player;
      resetRound(currentTurn);
    }
    fetchable = true;
  }
}
