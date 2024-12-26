// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import "../interfaces/IPuzzleMaster.sol";

contract SignedWordlePuzzleMaster is IPuzzleMaster {
    using ECDSA for bytes32;
    using MessageHashUtils for bytes;

    address public immutable verifier;

    constructor(address _verifier) {
        verifier = _verifier;
    }

    function verifySolution(
        bytes32 gameId,
        address player,
        uint32 score,
        bytes calldata proof
    ) external view override returns (bool) {
        bytes memory data = abi.encodePacked(gameId, player, score);
        address recoveredSigner = data.toEthSignedMessageHash().recover(proof);
        return recoveredSigner == verifier;
    }

    function getPuzzleMasterInfo()
        external
        pure
        override
        returns (string memory puzzleType, string memory proofType)
    {
        return ("wordle", "signature");
    }
}
