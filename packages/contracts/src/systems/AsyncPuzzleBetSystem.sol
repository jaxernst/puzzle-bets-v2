// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { System } from "@latticexyz/world/src/System.sol";
import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { RESOURCE_NAMESPACE } from "@latticexyz/world/src/worldResourceTypes.sol";
import { WorldResourceIdLib } from "@latticexyz/world/src/WorldResourceId.sol";
import { ResourceIdLib } from "@latticexyz/store/src/ResourceId.sol";
import { SolutionVerificationLib } from "../library/SolutionVerification.sol";
import { PuzzleMasterEoa, RematchCount, Balance, BuyIn, PuzzleType, Player1, Player2, GameStatus, SubmissionWindow, GamePlayerStartTime, Score, Submitted, InviteExpiration, VoteRematch, ProtocolFeeBasisPoints, ProtocolFeeRecipient, GamePasswordHash, PlaybackWindow } from "../codegen/index.sol";
import { Status, Puzzle } from "../codegen/common.sol";
import { IWorld } from "../codegen/world/IWorld.sol";
import { getUniqueEntity } from "@latticexyz/world-modules/src/modules/uniqueentity/getUniqueEntity.sol";
import { console } from "forge-std/console.sol";

/**
 * The System facillitates games between two players. Games are played in a asyncronous fashion, where each player
 * will have a set amount of time to solve the puzzle, but players can start their 'turns' separately.
 *
 * Solution verification: When creating a game, a 'puzzle master' address can be provided. The puzzle master is an
 * address that can attest to the validity of a solution, and players must submit a signed message from the master
 * in order to verify their solution.
 *
 * Public vs Private games:
 * - Games can be made private by including a inviteKeyHash when creating the game
 * - The creator sets a 'password' offchain, and posts only the hash to the 'newGame' function
 * - The joining player submits the raw password when joining, which is hashed and verified against the creators hash
 *    - This is technically susceptible to frontrunning, but this should not present a concern for the joining user, as
 *      a frontrunner can not extract value without playing the game and getting an attestation from the puzzle master
 */
contract AsyncPuzzleBetSystem is System {
  modifier playerOnly(bytes32 gameId) {
    address sender = _msgSender();
    require(sender == Player1.get(gameId) || sender == Player2.get(gameId), "Not game player");
    _;
  }

  function newGame(
    Puzzle puzzleType,
    uint32 submissionWindowSeconds,
    uint32 playbackWindowSeconds,
    uint inviteExpirationTimestamp,
    address puzzleMaster,
    bytes32 passwordHash
  ) public payable returns (bytes32) {
    address creator = _msgSender();
    uint betAmount = _msgValue();

    bytes32 gameId = getUniqueEntity();

    PuzzleType.set(gameId, puzzleType);
    GameStatus.set(gameId, Status.Pending);
    SubmissionWindow.set(gameId, submissionWindowSeconds);
    PlaybackWindow.set(gameId, playbackWindowSeconds);
    InviteExpiration.set(gameId, inviteExpirationTimestamp);

    Player1.set(gameId, creator);

    if (passwordHash != bytes32(0)) {
      GamePasswordHash.set(gameId, passwordHash);
    }

    Balance.set(gameId, creator, betAmount);
    BuyIn.set(gameId, betAmount);
    PuzzleMasterEoa.set(gameId, puzzleMaster);

    return gameId;
  }

  function joinGame(bytes32 gameId) public payable {
    // Require that this game has no password hash set when called without a password
    bytes32 passwordHash = GamePasswordHash.get(gameId);
    require(passwordHash == bytes32(0), "Must provide a password");
    _joinGame(gameId);
  }

  function joinGame(bytes32 gameId, string memory password) public payable {
    // Assume passwordHash is set and check the password when provided
    bytes32 checkHash = keccak256(abi.encodePacked(password));
    require(checkHash == GamePasswordHash.get(gameId), "Incorrect password");
    _joinGame(gameId);
  }

  function _joinGame(bytes32 gameId) private {
    Status status = GameStatus.get(gameId);
    uint betAmount = BuyIn.get(gameId);

    require(status == Status.Pending, "Game is not pending");
    require(InviteExpiration.get(gameId) > block.timestamp, "Invite expired");
    require(_msgValue() >= betAmount, "Insufficient buy in");

    Player2.set(gameId, _msgSender());
    Balance.set(gameId, _msgSender(), _msgValue());
    GameStatus.set(gameId, Status.Active);

    startTurn(gameId);
  }

  function startTurn(bytes32 gameId) public playerOnly(gameId) {
    Status status = GameStatus.get(gameId);
    require(status == Status.Active, "Game must be active");

    address sender = _msgSender();
    uint playerStartTime = GamePlayerStartTime.get(gameId, sender);
    require(playerStartTime == 0, "Player already started");
    require(_playbackWindowOpen(gameId, sender), "Playback window closed");

    GamePlayerStartTime.set(gameId, sender, block.timestamp);
  }

  /**
   * Cancel a game request and withdraw funds
   * @notice Can only be called by the creator of the game while the game is
   * still in a pending state (second player has not joined)
   */
  function cancelPendingGame(bytes32 gameId) public {
    require(_msgSender() == Player1.get(gameId), "Only creator can cancel");
    require(GameStatus.get(gameId) == Status.Pending, "Game is not pending");
    GameStatus.set(gameId, Status.Inactive);
    _returnPlayerDeposit(gameId);
  }

  /**
   * Submit a score and verify the puzzle master's signature attests to the score.
   */
  function submitSolution(bytes32 gameId, uint32 score, bytes memory puzzleMasterSignature) public playerOnly(gameId) {
    address sender = _msgSender();
    Status status = GameStatus.get(gameId);
    require(status == Status.Active, "Game is not active");

    uint startTime = GamePlayerStartTime.get(gameId, sender);
    require(startTime != 0, "Player not started");

    uint32 submissionWindow = SubmissionWindow.get(gameId);
    require(block.timestamp <= startTime + submissionWindow, "Submission window closed");

    Submitted.set(gameId, sender, true);

    // No signature check necessary for a 0 score (essentially a forfeit)
    if (score == 0) {
      return;
    }

    bool isValid = SolutionVerificationLib.verifyPuzzleMasterSignature({
      gameId: gameId,
      player: sender,
      score: score,
      puzzleMaster: PuzzleMasterEoa.get(gameId),
      puzzleMasterSignature: puzzleMasterSignature
    });

    require(isValid, "Puzzle master signature invalid");

    Score.set(gameId, sender, score);
  }

  /**
   * Check outcome of the game and distribute funds to players.
   * @notice Players can claim funds after the deadline has passed, but may claim before
   * the deadline if both players have submitted
   */
  function claim(bytes32 gameId) public playerOnly(gameId) {
    address p1 = Player1.get(gameId);
    address p2 = Player2.get(gameId);

    if (p1 == _msgSender()) {
      _claim(gameId, p1, p2);
    } else {
      _claim(gameId, p2, p1);
    }
  }

  function _claim(bytes32 gameId, address me, address them) private {
    uint myStartTime = GamePlayerStartTime.get(gameId, me);
    uint theirStartTime = GamePlayerStartTime.get(gameId, them);

    if (myStartTime == 0) revert("Cannot claim before starting");

    // If I have started but my opponent hasn't, check if the playback window has closed.
    if (theirStartTime == 0) {
      bool playbackWindowPassed = block.timestamp > myStartTime + PlaybackWindow.get(gameId);
      if (playbackWindowPassed) {
        // If the playback window is closed, they missed their turn and I win
        _payWinner(gameId, me, them);
        GameStatus.set(gameId, Status.Complete);
        return;
      } else {
        revert("Waiting for opponent to start their turn");
      }
    }

    uint32 submissionWindow = SubmissionWindow.get(gameId);
    bool mySubmissionWindowClosed = (myStartTime + submissionWindow) < block.timestamp;
    bool theirSubmissionWindowClosed = (theirStartTime + submissionWindow) < block.timestamp;

    bool iStartedLater = myStartTime > theirStartTime;
    bool latestSubmissionWindowClosed = iStartedLater ? mySubmissionWindowClosed : theirSubmissionWindowClosed;

    bool iHaveSubmitted = Submitted.get(gameId, me);
    bool bothSubmitted = iHaveSubmitted && Submitted.get(gameId, them);

    bool canClaim = bothSubmitted ||
      latestSubmissionWindowClosed ||
      (iStartedLater && theirSubmissionWindowClosed && iHaveSubmitted);

    require(canClaim, "Cannot claim");

    uint32 myScore = Score.get(gameId, me);
    uint32 theirScore = Score.get(gameId, them);

    if (theirScore > myScore) {
      revert("Nothing to claim");
    }

    // Distribute funds to winner
    if (myScore > theirScore) {
      _payWinner(gameId, me, them);
      GameStatus.set(gameId, Status.Complete);
      return;
    }

    // Tie condition, each player can claim their deposit back
    _returnPlayerDeposit(gameId);
    // Mark game complete after either player withdraws
    GameStatus.set(gameId, Status.Complete);
  }

  function voteRematch(bytes32 gameId) public playerOnly(gameId) {
    // Can't restart if either player has withdrawn (status is set to 'complete' once a claim occurs)
    Status status = GameStatus.get(gameId);
    require(status == Status.Active, "Game is not active");

    VoteRematch.set(gameId, _msgSender(), true);

    address p1 = Player1.get(gameId);
    address p2 = Player2.get(gameId);

    if (VoteRematch.get(gameId, p1) && VoteRematch.get(gameId, p2)) {
      Score.set(gameId, p1, 0);
      Score.set(gameId, p2, 0);
      Submitted.set(gameId, p1, false);
      Submitted.set(gameId, p2, false);
      VoteRematch.set(gameId, p1, false);
      VoteRematch.set(gameId, p2, false);
      GamePlayerStartTime.set(gameId, p1, 0);
      GamePlayerStartTime.set(gameId, p2, 0);
      RematchCount.set(gameId, RematchCount.get(gameId) + 1);

      startTurn(gameId);
    }
  }

  function _payWinner(bytes32 gameId, address winner, address loser) private {
    uint depositWinner = Balance.get(gameId, winner);
    uint depositLoser = Balance.get(gameId, loser);
    Balance.set(gameId, winner, 0);
    Balance.set(gameId, loser, 0);

    uint totalAmount = depositWinner + depositLoser;
    uint16 protocolFeeBps = ProtocolFeeBasisPoints.get();
    address feeRecipient = ProtocolFeeRecipient.get();

    if (totalAmount == 0) return;

    if (protocolFeeBps > 0 && feeRecipient != address(0)) {
      uint fee = (totalAmount * ProtocolFeeBasisPoints.get()) / 10000;
      _transfer(feeRecipient, fee);
      _transfer(winner, totalAmount - fee);
    } else {
      _transfer(winner, totalAmount);
    }
  }

  function _playbackWindowOpen(bytes32 gameId, address me) private view returns (bool) {
    address p1 = Player1.get(gameId);
    address p2 = Player2.get(gameId);

    uint opponentStartTime;
    if (p1 == me) {
      opponentStartTime = GamePlayerStartTime.get(gameId, p2);
    } else {
      opponentStartTime = GamePlayerStartTime.get(gameId, p1);
    }

    // Playback window defaults to 'open' when opponent has started their turn yet
    if (opponentStartTime == 0) return true;

    return (opponentStartTime + PlaybackWindow.get(gameId)) > block.timestamp;
  }

  function _returnPlayerDeposit(bytes32 gameId) private {
    address me = _msgSender();
    uint deposit = Balance.get(gameId, me);
    Balance.set(gameId, me, 0);
    _transfer(me, deposit);
  }

  function _transfer(address to, uint amount) private {
    IWorld(_world()).transferBalanceToAddress(ResourceIdLib.encode(RESOURCE_NAMESPACE, "v1"), to, amount);
  }
}
