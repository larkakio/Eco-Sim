// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @notice One check-in per UTC-ish day bucket (`block.timestamp / 1 days`). No ETH tips — `msg.value` must be zero.
contract EcoCheckIn {
    mapping(address => uint256) public lastCheckInAt;
    mapping(address => uint256) public streak;

    event CheckedIn(address indexed user, uint256 dayIndex, uint256 streakCount);

    error ValueNotAllowed();
    error AlreadyCheckedInToday();

    /// @dev Day index since unix epoch (same as `block.timestamp / 1 days` for quick reads).
    function lastCheckInDay(address user) external view returns (uint256) {
        uint256 t = lastCheckInAt[user];
        return t == 0 ? 0 : t / 1 days;
    }

    function checkIn() external payable {
        if (msg.value != 0) revert ValueNotAllowed();

        uint256 day = block.timestamp / 1 days;
        uint256 lastTs = lastCheckInAt[msg.sender];

        if (lastTs != 0 && lastTs / 1 days == day) {
            revert AlreadyCheckedInToday();
        }

        uint256 lastDay = lastTs == 0 ? type(uint256).max : lastTs / 1 days;

        uint256 newStreak;
        if (lastTs == 0) {
            newStreak = 1;
        } else if (lastDay == day - 1) {
            newStreak = streak[msg.sender] + 1;
        } else {
            newStreak = 1;
        }

        streak[msg.sender] = newStreak;
        lastCheckInAt[msg.sender] = block.timestamp;
        emit CheckedIn(msg.sender, day, newStreak);
    }
}
