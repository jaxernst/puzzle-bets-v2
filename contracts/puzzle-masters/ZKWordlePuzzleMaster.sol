// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import "../interfaces/IPuzzleMaster.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ZKWordlePuzzleMaster is IPuzzleMaster, Ownable {
    // Verifier contract for the ZK proof
    IZKVerifier public verifier;

    // Mapping of gameId to answer commitment
    mapping(bytes32 => bytes32) public gameAnswers;

    constructor(address _verifier) {
        verifier = IZKVerifier(_verifier);
    }

    /**
     * Called by the puzzle creator to set the answer for a game
     * @param gameId The game identifier
     * @param answerCommitment Hash of (answer, salt)
     */
    function setGameAnswer(
        bytes32 gameId,
        bytes32 answerCommitment
    ) external onlyOwner {
        require(gameAnswers[gameId] == bytes32(0), "Answer already set");
        gameAnswers[gameId] = answerCommitment;
    }

    function verifySolution(
        bytes32 gameId,
        address player,
        uint32 score,
        bytes calldata proof
    ) external view override returns (bool) {
        bytes32 answerCommitment = gameAnswers[gameId];
        require(answerCommitment != bytes32(0), "No answer set for game");

        return
            verifier.verifyProof(
                proof,
                [
                    uint256(gameId),
                    uint256(uint160(player)),
                    uint256(score),
                    uint256(answerCommitment)
                ]
            );
    }

    function getPuzzleMasterInfo()
        external
        pure
        override
        returns (string memory puzzleType, string memory proofType)
    {
        return ("wordle", "zk");
    }
}
