// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {EcoCheckIn} from "../src/EcoCheckIn.sol";

contract EcoCheckInTest is Test {
    EcoCheckIn internal eco;
    address internal user = address(0xBEEF);

    function setUp() public {
        eco = new EcoCheckIn();
    }

    function test_RevertWhen_ValueSent() public {
        vm.expectRevert(EcoCheckIn.ValueNotAllowed.selector);
        eco.checkIn{value: 1 wei}();
    }

    function test_RevertWhen_TwiceSameDay() public {
        vm.prank(user);
        eco.checkIn();
        vm.prank(user);
        vm.expectRevert(EcoCheckIn.AlreadyCheckedInToday.selector);
        eco.checkIn();
    }

    function test_NextDay_IncrementsStreak() public {
        vm.prank(user);
        eco.checkIn();
        vm.warp(block.timestamp + 1 days);
        vm.prank(user);
        eco.checkIn();
        assertEq(eco.streak(user), 2);
    }

    function test_AfterGap_ResetsStreak() public {
        vm.prank(user);
        eco.checkIn();
        vm.warp(block.timestamp + 3 days);
        vm.prank(user);
        eco.checkIn();
        assertEq(eco.streak(user), 1);
    }

    function test_FirstCheckIn_SetsStreakOne() public {
        vm.prank(user);
        eco.checkIn();
        assertEq(eco.streak(user), 1);
        assertEq(eco.lastCheckInDay(user), block.timestamp / 1 days);
    }
}
