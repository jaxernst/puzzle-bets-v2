import { defineWorld } from "@latticexyz/world";

export default defineWorld({
  namespace: "v1",
  enums: {
    Status: ["Inactive", "Pending", "Active", "Complete"],
    Puzzle: ["Wordle"],
  },
  tables: {
    PuzzleType: "Puzzle",
    GameStatus: "Status",
    BuyIn: "uint256",
    SubmissionWindow: "uint32",
    InviteExpiration: "uint256",
    GameStartTime: "uint256",
    GamePasswordHash: "bytes32",
    PuzzleMasterEoa: "address",
    Player1: "address",
    Player2: "address",
    RematchCount: "uint16",

    // Amount of time a player has to start their turn after their opponent starts
    PlaybackWindow: "uint32",

    GamePlayerStartTime: {
      schema: {
        gameId: "bytes32",
        player: "address",
        value: "uint256",
      },
      key: ["gameId", "player"],
    },

    Submitted: {
      schema: {
        gameId: "bytes32",
        player: "address",
        value: "bool",
      },
      key: ["gameId", "player"],
    },

    Score: {
      schema: {
        gameId: "bytes32",
        player: "address",
        value: "uint32",
      },
      key: ["gameId", "player"],
    },

    Balance: {
      schema: {
        gameId: "bytes32",
        player: "address",
        value: "uint256",
      },
      key: ["gameId", "player"],
    },

    VoteRematch: {
      schema: {
        gameId: "bytes32",
        me: "address",
        value: "bool",
      },
      key: ["gameId", "me"],
    },

    ProtocolFeeRecipient: {
      schema: {
        vaue: "address",
      },
      key: [],
    },

    ProtocolFeeBasisPoints: {
      schema: {
        value: "uint16",
      },
      key: [],
    },
  },

  modules: [
    {
      name: "UniqueEntityModule",
      root: true,
      args: [],
    },
  ],
});
