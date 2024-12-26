// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

interface IPuzzleMaster {
    /**
     * Verifies if a player's solution for a specific game is valid
     * @param gameId The unique identifier of the game
     * @param player The address of the player submitting the solution
     * @param score The claimed score for the solution
     * @param proof The verification proof data (could be a signature, ZK proof, etc)
     * @return valid Whether the solution is valid
     */
    function verifySolution(
        bytes32 gameId,
        address player,
        uint32 score,
        bytes calldata proof
    ) external view returns (bool valid);

    /**
     * Returns metadata about what type of puzzle this master handles
     * @return puzzleType The type of puzzle this master can verify
     * @return proofType The type of proof required (e.g. "signature", "zk", "tee")
     */
    function getPuzzleMasterInfo()
        external
        view
        returns (string memory puzzleType, string memory proofType);
}
