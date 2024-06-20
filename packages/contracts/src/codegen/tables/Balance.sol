// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

/* Autogenerated file. Do not edit manually. */

// Import store internals
import { IStore } from "@latticexyz/store/src/IStore.sol";
import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";
import { StoreCore } from "@latticexyz/store/src/StoreCore.sol";
import { Bytes } from "@latticexyz/store/src/Bytes.sol";
import { Memory } from "@latticexyz/store/src/Memory.sol";
import { SliceLib } from "@latticexyz/store/src/Slice.sol";
import { EncodeArray } from "@latticexyz/store/src/tightcoder/EncodeArray.sol";
import { FieldLayout } from "@latticexyz/store/src/FieldLayout.sol";
import { Schema } from "@latticexyz/store/src/Schema.sol";
import { EncodedLengths, EncodedLengthsLib } from "@latticexyz/store/src/EncodedLengths.sol";
import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";

library Balance {
  // Hex below is the result of `WorldResourceIdLib.encode({ namespace: "v1", name: "Balance", typeId: RESOURCE_TABLE });`
  ResourceId constant _tableId = ResourceId.wrap(0x7462763100000000000000000000000042616c616e6365000000000000000000);

  FieldLayout constant _fieldLayout =
    FieldLayout.wrap(0x0020010020000000000000000000000000000000000000000000000000000000);

  // Hex-encoded key schema of (bytes32, address)
  Schema constant _keySchema = Schema.wrap(0x003402005f610000000000000000000000000000000000000000000000000000);
  // Hex-encoded value schema of (uint256)
  Schema constant _valueSchema = Schema.wrap(0x002001001f000000000000000000000000000000000000000000000000000000);

  /**
   * @notice Get the table's key field names.
   * @return keyNames An array of strings with the names of key fields.
   */
  function getKeyNames() internal pure returns (string[] memory keyNames) {
    keyNames = new string[](2);
    keyNames[0] = "gameId";
    keyNames[1] = "player";
  }

  /**
   * @notice Get the table's value field names.
   * @return fieldNames An array of strings with the names of value fields.
   */
  function getFieldNames() internal pure returns (string[] memory fieldNames) {
    fieldNames = new string[](1);
    fieldNames[0] = "value";
  }

  /**
   * @notice Register the table with its config.
   */
  function register() internal {
    StoreSwitch.registerTable(_tableId, _fieldLayout, _keySchema, _valueSchema, getKeyNames(), getFieldNames());
  }

  /**
   * @notice Register the table with its config.
   */
  function _register() internal {
    StoreCore.registerTable(_tableId, _fieldLayout, _keySchema, _valueSchema, getKeyNames(), getFieldNames());
  }

  /**
   * @notice Get value.
   */
  function getValue(bytes32 gameId, address player) internal view returns (uint256 value) {
    bytes32[] memory _keyTuple = new bytes32[](2);
    _keyTuple[0] = gameId;
    _keyTuple[1] = bytes32(uint256(uint160(player)));

    bytes32 _blob = StoreSwitch.getStaticField(_tableId, _keyTuple, 0, _fieldLayout);
    return (uint256(bytes32(_blob)));
  }

  /**
   * @notice Get value.
   */
  function _getValue(bytes32 gameId, address player) internal view returns (uint256 value) {
    bytes32[] memory _keyTuple = new bytes32[](2);
    _keyTuple[0] = gameId;
    _keyTuple[1] = bytes32(uint256(uint160(player)));

    bytes32 _blob = StoreCore.getStaticField(_tableId, _keyTuple, 0, _fieldLayout);
    return (uint256(bytes32(_blob)));
  }

  /**
   * @notice Get value.
   */
  function get(bytes32 gameId, address player) internal view returns (uint256 value) {
    bytes32[] memory _keyTuple = new bytes32[](2);
    _keyTuple[0] = gameId;
    _keyTuple[1] = bytes32(uint256(uint160(player)));

    bytes32 _blob = StoreSwitch.getStaticField(_tableId, _keyTuple, 0, _fieldLayout);
    return (uint256(bytes32(_blob)));
  }

  /**
   * @notice Get value.
   */
  function _get(bytes32 gameId, address player) internal view returns (uint256 value) {
    bytes32[] memory _keyTuple = new bytes32[](2);
    _keyTuple[0] = gameId;
    _keyTuple[1] = bytes32(uint256(uint160(player)));

    bytes32 _blob = StoreCore.getStaticField(_tableId, _keyTuple, 0, _fieldLayout);
    return (uint256(bytes32(_blob)));
  }

  /**
   * @notice Set value.
   */
  function setValue(bytes32 gameId, address player, uint256 value) internal {
    bytes32[] memory _keyTuple = new bytes32[](2);
    _keyTuple[0] = gameId;
    _keyTuple[1] = bytes32(uint256(uint160(player)));

    StoreSwitch.setStaticField(_tableId, _keyTuple, 0, abi.encodePacked((value)), _fieldLayout);
  }

  /**
   * @notice Set value.
   */
  function _setValue(bytes32 gameId, address player, uint256 value) internal {
    bytes32[] memory _keyTuple = new bytes32[](2);
    _keyTuple[0] = gameId;
    _keyTuple[1] = bytes32(uint256(uint160(player)));

    StoreCore.setStaticField(_tableId, _keyTuple, 0, abi.encodePacked((value)), _fieldLayout);
  }

  /**
   * @notice Set value.
   */
  function set(bytes32 gameId, address player, uint256 value) internal {
    bytes32[] memory _keyTuple = new bytes32[](2);
    _keyTuple[0] = gameId;
    _keyTuple[1] = bytes32(uint256(uint160(player)));

    StoreSwitch.setStaticField(_tableId, _keyTuple, 0, abi.encodePacked((value)), _fieldLayout);
  }

  /**
   * @notice Set value.
   */
  function _set(bytes32 gameId, address player, uint256 value) internal {
    bytes32[] memory _keyTuple = new bytes32[](2);
    _keyTuple[0] = gameId;
    _keyTuple[1] = bytes32(uint256(uint160(player)));

    StoreCore.setStaticField(_tableId, _keyTuple, 0, abi.encodePacked((value)), _fieldLayout);
  }

  /**
   * @notice Delete all data for given keys.
   */
  function deleteRecord(bytes32 gameId, address player) internal {
    bytes32[] memory _keyTuple = new bytes32[](2);
    _keyTuple[0] = gameId;
    _keyTuple[1] = bytes32(uint256(uint160(player)));

    StoreSwitch.deleteRecord(_tableId, _keyTuple);
  }

  /**
   * @notice Delete all data for given keys.
   */
  function _deleteRecord(bytes32 gameId, address player) internal {
    bytes32[] memory _keyTuple = new bytes32[](2);
    _keyTuple[0] = gameId;
    _keyTuple[1] = bytes32(uint256(uint160(player)));

    StoreCore.deleteRecord(_tableId, _keyTuple, _fieldLayout);
  }

  /**
   * @notice Tightly pack static (fixed length) data using this table's schema.
   * @return The static data, encoded into a sequence of bytes.
   */
  function encodeStatic(uint256 value) internal pure returns (bytes memory) {
    return abi.encodePacked(value);
  }

  /**
   * @notice Encode all of a record's fields.
   * @return The static (fixed length) data, encoded into a sequence of bytes.
   * @return The lengths of the dynamic fields (packed into a single bytes32 value).
   * @return The dynamic (variable length) data, encoded into a sequence of bytes.
   */
  function encode(uint256 value) internal pure returns (bytes memory, EncodedLengths, bytes memory) {
    bytes memory _staticData = encodeStatic(value);

    EncodedLengths _encodedLengths;
    bytes memory _dynamicData;

    return (_staticData, _encodedLengths, _dynamicData);
  }

  /**
   * @notice Encode keys as a bytes32 array using this table's field layout.
   */
  function encodeKeyTuple(bytes32 gameId, address player) internal pure returns (bytes32[] memory) {
    bytes32[] memory _keyTuple = new bytes32[](2);
    _keyTuple[0] = gameId;
    _keyTuple[1] = bytes32(uint256(uint160(player)));

    return _keyTuple;
  }
}
