// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { Script } from "forge-std/Script.sol";
import { console } from "forge-std/console.sol";
import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";

import { IWorld } from "../src/codegen/world/IWorld.sol";
import { ProtocolFeeBasisPoints, ProtocolFeeRecipient } from "../src/codegen/index.sol";

contract PostDeploy is Script {
  function run(address worldAddress) external {
    // Specify a store so that you can use tables directly in PostDeploy
    StoreSwitch.setStoreAddress(worldAddress);

    // Load the private key from the `PRIVATE_KEY` environment variable (in .env)
    uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

    // Start broadcasting transactions from the deployer account
    vm.startBroadcast(deployerPrivateKey);

    // ------ Grant access to the deployer to update protocol fee params ------
    address creator = IWorld(worldAddress).creator();
    IWorld(worldAddress).grantAccess(ProtocolFeeRecipient._tableId, creator);
    IWorld(worldAddress).grantAccess(ProtocolFeeBasisPoints._tableId, creator);

    ProtocolFeeRecipient.set(0x9B8DB9bffcCd1F2Cc5044d67a1b9C68dD6Deff6a);
    ProtocolFeeBasisPoints.set(250);

    vm.stopBroadcast();
  }
}
