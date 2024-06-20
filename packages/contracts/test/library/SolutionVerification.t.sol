// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import "forge-std/Test.sol";
import "../../src/library/SolutionVerification.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

contract SolutionVerificationLibTest is Test {
  using MessageHashUtils for bytes;

  function prepareTestSignature(
    bytes32 gameId,
    address playerAddr,
    uint32 solutionIndex
  ) public pure returns (bytes32) {
    bytes memory data = abi.encodePacked(gameId, playerAddr, solutionIndex);
    return data.toEthSignedMessageHash();
  }

  function test_verifies_message_signed_by_puzzle_master() public {
    (address master, uint256 key) = makeAddrAndKey("master");

    bytes32 gameId = bytes32(uint256(1));
    address playerAddr = address(0x94B3219d193e9e214d019699fFEa55c1D6098f3E);
    uint32 solutionIndex = uint32(1);

    bytes32 messageHash = prepareTestSignature(gameId, playerAddr, solutionIndex);

    (uint8 v, bytes32 r, bytes32 s) = vm.sign(key, messageHash);

    // Sanity check: Ensure raw ecrecover works with params
    address recoveredAddress = ecrecover(messageHash, v, r, s);
    assertEq(recoveredAddress, master);
    assertEq(
      SolutionVerificationLib.getMessageHash(gameId, playerAddr, solutionIndex),
      keccak256(abi.encodePacked(gameId, playerAddr, solutionIndex))
    );

    bool verified = SolutionVerificationLib.verifyPuzzleMasterSignature(
      gameId,
      playerAddr,
      solutionIndex,
      master,
      abi.encodePacked(r, s, v)
    );

    assert(verified);
  }
}
