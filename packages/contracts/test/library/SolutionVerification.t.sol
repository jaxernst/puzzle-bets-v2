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
    uint32 solution,
    uint16 nonce
  ) public pure returns (bytes32) {
    bytes memory data = abi.encodePacked(gameId, playerAddr, solution, nonce);
    return data.toEthSignedMessageHash();
  }

  struct TestParams {
    bytes32 gameId;
    address playerAddr;
    uint32 solution;
    uint16 nonce;
    address master;
    uint256 key;
  }

  function test_verifies_message_signed_by_puzzle_master() public {
    TestParams memory params;
    (params.master, params.key) = makeAddrAndKey("master");

    params.gameId = bytes32(uint256(1));
    params.playerAddr = address(0x94B3219d193e9e214d019699fFEa55c1D6098f3E);
    params.solution = uint32(1);
    params.nonce = 0;

    // First run with nonce 0
    bytes32 messageHash = prepareTestSignature(params.gameId, params.playerAddr, params.solution, params.nonce);
    (uint8 v, bytes32 r, bytes32 s) = vm.sign(params.key, messageHash);

    // Sanity check: Ensure raw ecrecover works with params
    address recoveredAddress = ecrecover(messageHash, v, r, s);
    assertEq(recoveredAddress, params.master);
    assertEq(
      SolutionVerificationLib.getMessageHash(params.gameId, params.playerAddr, params.solution, params.nonce),
      keccak256(abi.encodePacked(params.gameId, params.playerAddr, params.solution, params.nonce))
    );

    bool verified = SolutionVerificationLib.verifyPuzzleMasterSignature(
      params.gameId,
      params.playerAddr,
      params.solution,
      params.nonce,
      params.master,
      abi.encodePacked(r, s, v)
    );
    assert(verified);

    // Second run with incremented nonce
    params.nonce = 1;
    params.solution = 6727472;
    messageHash = prepareTestSignature(params.gameId, params.playerAddr, params.solution, params.nonce);
    (v, r, s) = vm.sign(params.key, messageHash);

    // Verify with incremented nonce
    verified = SolutionVerificationLib.verifyPuzzleMasterSignature(
      params.gameId,
      params.playerAddr,
      params.solution,
      params.nonce,
      params.master,
      abi.encodePacked(r, s, v)
    );
    assert(verified);
  }
}
