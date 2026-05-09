// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script} from "forge-std/Script.sol";
import {EcoCheckIn} from "../src/EcoCheckIn.sol";

contract EcoCheckInScript is Script {
    function run() public {
        vm.startBroadcast();
        new EcoCheckIn();
        vm.stopBroadcast();
    }
}
