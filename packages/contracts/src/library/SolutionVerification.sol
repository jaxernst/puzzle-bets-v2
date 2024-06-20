// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import "forge-std/console.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

library SolutionVerificationLib {
  using ECDSA for bytes32;
  using MessageHashUtils for bytes;

  function verifyPuzzleMasterSignature(
    bytes32 gameId,
    address player,
    uint32 score,
    address puzzleMaster,
    bytes memory puzzleMasterSignature
  ) public pure returns (bool) {
    address recoveredAddress = _recoverSigner(abi.encodePacked(gameId, player, score), puzzleMasterSignature);
    return recoveredAddress == puzzleMaster;
  }

  function getMessageHash(bytes32 gameId, address player, uint32 solutionIndex) public pure returns (bytes32) {
    return keccak256(abi.encodePacked(gameId, player, solutionIndex));
  }

  function _recoverSigner(bytes memory data, bytes memory signature) internal pure returns (address) {
    return data.toEthSignedMessageHash().recover(signature);
  }
}
