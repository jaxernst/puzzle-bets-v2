// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { IWorld } from "../src/codegen/world/IWorld.sol";
import { Puzzle, Status } from "../src/codegen/common.sol";
import { MudTest } from "@latticexyz/world/test/MudTest.t.sol";
import { GamePasswordHash, PuzzleMasterEoa, RematchCount, Balance, BuyIn, PuzzleType, Player1, Player2, GameStatus, SubmissionWindow, GameStartTime, Score, Submitted, InviteExpiration, VoteRematch, ProtocolFeeBasisPoints, ProtocolFeeRecipient } from "../src/codegen/index.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

import "forge-std/Test.sol";

contract DeadlinePuzzleSystemTest is MudTest {
  using MessageHashUtils for bytes;

  address DEFAULT_PUZZLE_MASTER = address(0x456);
  uint DEFAULT_INVITE_WINDOW_DURATION = 100;

  function test_newGame_GameVariablesAreSetOnCreation() public {
    bytes32 gameId = IWorld(worldAddress).v1__newGame{ value: 1 ether }({
      puzzleType: Puzzle.Wordle,
      submissionWindowSeconds: 1,
      inviteExpirationTimestamp: block.timestamp + DEFAULT_INVITE_WINDOW_DURATION,
      puzzleMaster: address(0x456),
      passwordHash: bytes32(uint256(999))
    });

    assertEq(Player1.get(gameId), address(this));
    assertEq(GamePasswordHash.get(gameId), bytes32(uint256(999)));
    assertEq(PuzzleMasterEoa.get(gameId), address(0x456));
    assertEq(uint(GameStatus.get(gameId)), uint(Status.Pending));
    assertEq(BuyIn.get(gameId), 1 ether);
    assertEq(Balance.get(gameId, address(this)), 1 ether);
    assertEq(SubmissionWindow.get(gameId), 1);
    assertEq(InviteExpiration.get(gameId), block.timestamp + 100);
  }

  function test_joinGame_JoinGameRequiresBuyInDeposit() public {
    address opponent = address(0x123);
    bytes32 gameId = newDefaultGame(1 ether);

    vm.startPrank(opponent);
    vm.deal(opponent, 1 ether);
    vm.expectRevert("Insufficient buy in");
    IWorld(worldAddress).v1__joinGame(gameId);
    assertEq(Balance.get(gameId, opponent), 0);

    IWorld(worldAddress).v1__joinGame{ value: 1 ether }(gameId);
    assertEq(Balance.get(gameId, opponent), 1 ether);
  }

  function test_joinGame_RequiresPasswordWhenOneIsSet() public {
    string memory password = "password";

    bytes32 gameId = IWorld(worldAddress).v1__newGame({
      puzzleType: Puzzle.Wordle,
      submissionWindowSeconds: 1,
      inviteExpirationTimestamp: block.timestamp + DEFAULT_INVITE_WINDOW_DURATION,
      puzzleMaster: address(0x456),
      passwordHash: keccak256(abi.encodePacked(password))
    });

    vm.startPrank(address(0x123));
    vm.expectRevert("Must provide a password");
    IWorld(worldAddress).v1__joinGame(gameId);

    vm.expectRevert("Incorrect password");
    IWorld(worldAddress).v1__joinGame(gameId, "wrong password");

    IWorld(worldAddress).v1__joinGame(gameId, "password");
    assertEq(address(0x123), Player2.get(gameId));
  }

  function test_joinGame_CancelledGameCannotBeJoined() public {
    bytes32 gameId = newDefaultGame(1 ether);
    IWorld(worldAddress).v1__cancelPendingGame(gameId);

    vm.prank(address(0x123));
    vm.expectRevert();
    IWorld(worldAddress).v1__joinGame{ value: 1 ether }(gameId);
  }

  function test_joinGame_GameIsStartedWhenOpponentJoins() public {
    bytes32 gameId = newDefaultGame(0 ether);

    vm.prank(address(0x999));
    IWorld(worldAddress).v1__joinGame(gameId);
    assertEq(Player2.get(gameId), address(0x999));
    assertEq(uint(GameStatus.get(gameId)), uint(Status.Active));
  }

  function test_joinGame_JoinNotAllowedAfterInviteExpires() public {
    bytes32 gameId = newDefaultGame(0);
    skip(DEFAULT_INVITE_WINDOW_DURATION + 1);

    vm.expectRevert("Invite expired");
    IWorld(worldAddress).v1__joinGame(gameId);
  }

  function test_cancelPendingGame_BuyInReturnedWhenCreatorCancelsGame() public {
    uint startingBalance = address(this).balance;
    bytes32 gameId = newDefaultGame(1 ether);

    assertEq(address(this).balance, startingBalance - 1 ether);
    IWorld(worldAddress).v1__cancelPendingGame(gameId);
    assertEq(address(this).balance, startingBalance);
  }

  function test_cancelPendingGame_GameCannotBeCancelledOnceStarted() public {
    bytes32 gameId = newDefaultGame(1 ether);

    IWorld(worldAddress).v1__joinGame{ value: 1 ether }(gameId);

    vm.expectRevert("Game is not pending");
    IWorld(worldAddress).v1__cancelPendingGame(gameId);
  }

  function test_submitSolution_RecordsPlayersScoreWithValidSignature() public {
    (address master, uint256 masterKey) = makeAddrAndKey("master");
    address opponent = address(0x123);
    address creator = address(0x999);

    vm.prank(creator);
    bytes32 gameId = IWorld(worldAddress).v1__newGame({
      puzzleType: Puzzle.Wordle,
      submissionWindowSeconds: 1,
      inviteExpirationTimestamp: block.timestamp + 100,
      puzzleMaster: master,
      passwordHash: bytes32(0)
    });

    vm.prank(opponent);
    IWorld(worldAddress).v1__joinGame(gameId);

    assertEq(Submitted.get(gameId, creator), false);
    assertEq(Score.get(gameId, creator), 0);
    assertEq(Submitted.get(gameId, opponent), false);
    assertEq(Score.get(gameId, opponent), 0);

    // Sign game solved message with puzzleMaster key for p1
    uint32 score = 24;
    bytes memory creatorSignature = signPuzzleSolved(masterKey, gameId, creator, score);

    vm.prank(creator);
    IWorld(worldAddress).v1__submitSolution(gameId, score, creatorSignature);
    assertEq(Score.get(gameId, creator), score);
    assertEq(Submitted.get(gameId, creator), true);

    // Sign game solved message with puzzleMaster key for p2
    bytes memory opponentSignature = signPuzzleSolved(masterKey, gameId, opponent, score);

    vm.prank(opponent);
    IWorld(worldAddress).v1__submitSolution(gameId, score, opponentSignature);
    assertEq(Score.get(gameId, opponent), score);
    assertEq(Submitted.get(gameId, opponent), true);
  }

  function test_submitSolution_DoesNotRequireSignatureWithZeroValueScore() public {
    address opponent = address(0x123);
    address creator = address(0x999);

    vm.prank(creator);
    bytes32 gameId = IWorld(worldAddress).v1__newGame({
      puzzleType: Puzzle.Wordle,
      submissionWindowSeconds: 1,
      inviteExpirationTimestamp: block.timestamp + 100,
      puzzleMaster: address(0x0),
      passwordHash: bytes32(0)
    });

    vm.prank(opponent);
    IWorld(worldAddress).v1__joinGame(gameId);

    bytes memory badSignature = bytes("");

    vm.prank(creator);
    IWorld(worldAddress).v1__submitSolution(gameId, 0, badSignature);
    assertEq(Submitted.get(gameId, creator), true);
    assertEq(Score.get(gameId, creator), 0);

    vm.prank(opponent);
    IWorld(worldAddress).v1__submitSolution(gameId, 0, badSignature);
    assertEq(Submitted.get(gameId, opponent), true);
    assertEq(Score.get(gameId, opponent), 0);
  }

  function test_submitSolution_RevertsWhen_PuzzleMasterSignatureIsInvalid() public {
    (address master, uint256 masterKey) = makeAddrAndKey("master");
    address opponent = address(0x123);
    address creator = address(0x999);

    vm.prank(creator);
    bytes32 gameId = IWorld(worldAddress).v1__newGame({
      puzzleType: Puzzle.Wordle,
      submissionWindowSeconds: 1,
      inviteExpirationTimestamp: block.timestamp + 100,
      puzzleMaster: master,
      passwordHash: bytes32(0)
    });

    vm.prank(opponent);
    IWorld(worldAddress).v1__joinGame(gameId);

    // Attempt to reuse p1's signature for p2 submission
    bytes memory creatorSignature = signPuzzleSolved(masterKey, gameId, creator, 1);

    vm.prank(creator);
    IWorld(worldAddress).v1__submitSolution(gameId, 1, creatorSignature);
    assertEq(Submitted.get(gameId, creator), true);
    assertEq(Score.get(gameId, creator), 1);

    vm.prank(opponent);
    vm.expectRevert("Puzzle master signature invalid");
    IWorld(worldAddress).v1__submitSolution(gameId, 1, creatorSignature);
  }

  function test_submitSolution_RevertsWhen_SubmissionWindowHasClosed() public {
    bytes32 gameId = newDefaultGame(0 ether);
    IWorld(worldAddress).v1__joinGame(gameId);

    skip(10000);

    bytes memory sig = "ahhhh";
    vm.expectRevert("Submission window closed");
    IWorld(worldAddress).v1__submitSolution(gameId, 0, sig);
  }

  function test_claim_ReturnsEachPlayersDepositIfNeitherSubmitAfterTheDeadline() public {
    address p1 = address(0x123);
    address p2 = address(0x456);
    vm.deal(p1, 2 ether);
    vm.deal(p2, 2 ether);

    vm.prank(p1);
    bytes32 gameId = newDefaultGame(1 ether);

    vm.prank(p2);
    IWorld(worldAddress).v1__joinGame{ value: 1 ether }(gameId);

    assertEq(p1.balance, 1 ether);
    assertEq(p1.balance, 1 ether);
    skip(1000);

    vm.prank(p1);
    IWorld(worldAddress).v1__claim(gameId);

    vm.prank(p2);
    IWorld(worldAddress).v1__claim(gameId);

    assertEq(p1.balance, 2 ether);
    assertEq(p2.balance, 2 ether);
  }

  function test_claim_ReturnsEachPlayersDepositIfBothSubmitBeforeTheDeadline() public {
    (address master, uint256 masterKey) = makeAddrAndKey("master");
    uint32 submissionWindow = 1000;
    address p1 = address(0x123);
    address p2 = address(0x456);
    vm.deal(p1, 12 ether);
    vm.deal(p2, 12 ether);

    vm.prank(p1);
    bytes32 gameId = IWorld(worldAddress).v1__newGame{ value: 5 ether }({
      puzzleType: Puzzle.Wordle,
      submissionWindowSeconds: submissionWindow,
      inviteExpirationTimestamp: block.timestamp + 100,
      puzzleMaster: master,
      passwordHash: bytes32(0)
    });

    // Deposit more than needed for p2 to show it will be returned
    vm.prank(p2);
    IWorld(worldAddress).v1__joinGame{ value: 6 ether }(gameId);

    assertEq(p1.balance, 7 ether);
    assertEq(p2.balance, 6 ether);

    // Both players successfully solve
    bytes memory sig1 = signPuzzleSolved(masterKey, gameId, p1, 1);
    bytes memory sig2 = signPuzzleSolved(masterKey, gameId, p2, 1);

    vm.prank(p1);
    IWorld(worldAddress).v1__submitSolution(gameId, 0, sig1);
    vm.prank(p2);
    IWorld(worldAddress).v1__submitSolution(gameId, 0, sig2);

    // Assert that we're still in the submission window
    assertTrue(block.timestamp < GameStartTime.get(gameId) + submissionWindow);

    vm.prank(p1);
    IWorld(worldAddress).v1__claim(gameId);
    assertEq(p1.balance, 12 ether);

    vm.prank(p2);
    IWorld(worldAddress).v1__claim(gameId);
    assertEq(p2.balance, 12 ether);
  }

  function test_claim_ReturnsFullPoolBalanceToWinnerWithNoProtocolFeeSet() public {
    address admin = IWorld(worldAddress).creator();
    vm.prank(admin);
    ProtocolFeeBasisPoints.set(0);

    (address master, uint256 masterKey) = makeAddrAndKey("master");
    address p1 = address(0x123);
    address p2 = address(0x456);
    vm.deal(p1, 1 ether);
    vm.deal(p2, 1 ether);

    vm.prank(p1);
    bytes32 gameId = IWorld(worldAddress).v1__newGame{ value: 1 ether }({
      puzzleType: Puzzle.Wordle,
      submissionWindowSeconds: 1,
      inviteExpirationTimestamp: block.timestamp + 100,
      puzzleMaster: master,
      passwordHash: bytes32(0)
    });

    vm.prank(p2);
    IWorld(worldAddress).v1__joinGame{ value: 1 ether }(gameId);

    // Both players successfully solve
    uint32 score = 1;
    bytes memory sig1 = signPuzzleSolved(masterKey, gameId, p1, score);

    vm.startPrank(p1);
    IWorld(worldAddress).v1__submitSolution(gameId, score, sig1);

    skip(100);

    IWorld(worldAddress).v1__claim(gameId);

    assertEq(p1.balance, 2 ether);
  }

  function test_claim_TransfersFeeToFeeRecipientWhenWinnerClaimsPool() public {
    address feeRecipient = address(0x999);
    uint feePercent = 11;
    address admin = IWorld(worldAddress).creator();
    vm.startPrank(admin);
    ProtocolFeeBasisPoints.set(uint16(feePercent * 100));
    ProtocolFeeRecipient.set(feeRecipient);
    vm.stopPrank();

    (address master, uint256 masterKey) = makeAddrAndKey("master");
    address p1 = address(0x123);
    address p2 = address(0x456);
    vm.deal(p1, 1 ether);
    vm.deal(p2, 1 ether);

    vm.prank(p1);
    bytes32 gameId = IWorld(worldAddress).v1__newGame{ value: 1 ether }({
      puzzleType: Puzzle.Wordle,
      submissionWindowSeconds: 1,
      inviteExpirationTimestamp: block.timestamp + 100,
      puzzleMaster: master,
      passwordHash: bytes32(0)
    });

    vm.prank(p2);
    IWorld(worldAddress).v1__joinGame{ value: 1 ether }(gameId);

    // Both players successfully solve
    uint32 score = 32;
    bytes memory sig1 = signPuzzleSolved(masterKey, gameId, p1, score);

    vm.startPrank(p1);
    IWorld(worldAddress).v1__submitSolution(gameId, score, sig1);

    skip(100);

    IWorld(worldAddress).v1__claim(gameId);

    uint expectedFee = (2 ether * feePercent) / 100;
    assertEq(feeRecipient.balance, expectedFee);
    assertEq(p1.balance, 2 ether - expectedFee);
  }

  function test_claim_RevertsWhen_NonWinnerAttemptsToClaim() public {
    (address master, uint256 masterKey) = makeAddrAndKey("master");
    address p1 = address(0x123);
    address p2 = address(0x456);
    vm.deal(p1, 1 ether);
    vm.deal(p2, 1 ether);

    vm.prank(p1);
    bytes32 gameId = IWorld(worldAddress).v1__newGame{ value: 1 ether }({
      puzzleType: Puzzle.Wordle,
      submissionWindowSeconds: 1,
      inviteExpirationTimestamp: block.timestamp + 100,
      puzzleMaster: master,
      passwordHash: bytes32(0)
    });

    vm.prank(p2);
    IWorld(worldAddress).v1__joinGame{ value: 1 ether }(gameId);

    // Both players successfully solve
    uint32 score = 10;
    bytes memory sig1 = signPuzzleSolved(masterKey, gameId, p1, score);

    vm.prank(p1);
    IWorld(worldAddress).v1__submitSolution(gameId, score, sig1);

    skip(100);

    vm.prank(p2);
    vm.expectRevert("Nothing to claim");
    IWorld(worldAddress).v1__claim(gameId);

    vm.prank(address(0x1));
    vm.expectRevert("Not game player");
    IWorld(worldAddress).v1__claim(gameId);
  }

  function test_voteRematch_ResetsGameStateOnceBothPlayersVote() public {
    (address master, uint256 masterKey) = makeAddrAndKey("master");
    address opponent = address(0x123);
    address creator = address(0x456);

    vm.prank(creator);
    bytes32 gameId = IWorld(worldAddress).v1__newGame({
      puzzleType: Puzzle.Wordle,
      submissionWindowSeconds: 1,
      inviteExpirationTimestamp: block.timestamp + 100,
      puzzleMaster: master,
      passwordHash: bytes32(0)
    });

    vm.prank(opponent);
    IWorld(worldAddress).v1__joinGame(gameId);

    // Both players successfully solve
    uint32 score = 1;
    bytes memory sig1 = signPuzzleSolved(masterKey, gameId, creator, score);
    bytes memory sig2 = signPuzzleSolved(masterKey, gameId, opponent, score);

    vm.prank(creator);
    IWorld(worldAddress).v1__submitSolution(gameId, score, sig1);
    vm.prank(opponent);
    IWorld(worldAddress).v1__submitSolution(gameId, score, sig2);

    assertEq(Submitted.get(gameId, creator), true);
    assertEq(Submitted.get(gameId, opponent), true);
    assertEq(Score.get(gameId, creator), score);
    assertEq(Score.get(gameId, creator), score);

    vm.prank(creator);
    IWorld(worldAddress).v1__voteRematch(gameId);
    assertEq(VoteRematch.get(gameId, creator), true);

    vm.prank(opponent);
    IWorld(worldAddress).v1__voteRematch(gameId);

    assertEq(VoteRematch.get(gameId, creator), false);
    assertEq(VoteRematch.get(gameId, opponent), false);
    assertEq(RematchCount.get(gameId), 1);
    assertEq(uint(GameStatus.get(gameId)), uint(Status.Active));
    assertEq(Score.get(gameId, creator), 0);
    assertEq(Score.get(gameId, creator), 0);
    assertEq(Submitted.get(gameId, creator), false);
    assertEq(Submitted.get(gameId, opponent), false);
    assertEq(GameStartTime.get(gameId), block.timestamp);
  }

  function test_voteRematch_RevertsWhen_OnePlayerHasAlreadyWithdrawn() public {
    address opponent = address(0x123);
    address creator = address(0x456);

    vm.prank(creator);
    bytes32 gameId = newDefaultGame(0);

    vm.prank(opponent);
    IWorld(worldAddress).v1__joinGame(gameId);

    skip(1000000);
    vm.prank(opponent);
    IWorld(worldAddress).v1__claim(gameId);

    vm.prank(creator);
    vm.expectRevert("Game is not active");
    IWorld(worldAddress).v1__voteRematch(gameId);
  }

  function newDefaultGame(uint value) private returns (bytes32) {
    return
      IWorld(worldAddress).v1__newGame{ value: value }({
        puzzleType: Puzzle.Wordle,
        submissionWindowSeconds: 1,
        inviteExpirationTimestamp: block.timestamp + DEFAULT_INVITE_WINDOW_DURATION,
        puzzleMaster: address(0x456),
        passwordHash: bytes32(0)
      });
  }

  function signPuzzleSolved(
    uint puzzleMasterPk,
    bytes32 gameId,
    address playerAddr,
    uint32 score
  ) private pure returns (bytes memory) {
    bytes memory data = abi.encodePacked(gameId, playerAddr, score);
    bytes32 messageHash = data.toEthSignedMessageHash();
    (uint8 v, bytes32 r, bytes32 s) = vm.sign(puzzleMasterPk, messageHash);
    return abi.encodePacked(r, s, v);
  }

  receive() external payable {}
}
