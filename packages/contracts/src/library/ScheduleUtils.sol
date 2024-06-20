// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

function _alarmScheduleParamsValid(
  uint8[] calldata alarmDays,
  uint32 alarmTime,
  int8 timezoneOffsetHrs
) pure returns (bool) {
  return _validateDaysArr(alarmDays) && alarmTime < 1 days && -12 < timezoneOffsetHrs && timezoneOffsetHrs < 12;
}

function _inSubmissionWindow(uint32 submissionWindow, uint32 alarmTime, int8 timezoneOffset) view returns (bool) {
  if (_deadlinePassedToday(uint32(block.timestamp), alarmTime, timezoneOffset)) {
    return false;
  }

  return
    (_nextAlarmTimeInterval(uint32(block.timestamp), alarmTime, timezoneOffset) - block.timestamp) < submissionWindow;
}

/**
 * Determine how many total alarm deadlines have been missed for this schedule.
 * This is done by calculating the number of whole weeks that have passed since
 * activation, then calculating how many additional (remainder) alarms days to add,
 * and comparing that with the total entry count.
 *
 * @notice missedDeadlines can still be called after expiration, but will stop counting after the expiration timestamp
 */
function _missedAlarms(
  uint32 alarmTime,
  uint8[] memory alarmDays,
  int8 timezoneOffset,
  uint32 numAlarmConfirmations,
  uint fromTimestamp,
  uint toTimestamp
) pure returns (uint) {
  if (fromTimestamp < toTimestamp) return 0;

  uint latestTimestamp = toTimestamp;
  uint lastDeadlineInterval = _lastAlarmTimeInterval(latestTimestamp, alarmTime, timezoneOffset);
  uint firstDeadlineInterval = _nextAlarmTimeInterval(fromTimestamp, alarmTime, timezoneOffset);

  uint daysPassed = (lastDeadlineInterval - firstDeadlineInterval) / 1 days;
  uint weeksPassed = daysPassed / 7;
  uint remainderDays = daysPassed % 7;

  // Get expected entries for full weeks passed
  uint expectedEntriesForFullWeeks = weeksPassed * alarmDays.length;

  // Figure out additional expected entries for remainder days based on which
  // of those remainder days are alarm days
  uint8 alarmsInRemainderDays = 0;
  uint8 remainderStartDay = _dayOfWeek(
    _offsetTimestamp(lastDeadlineInterval - (remainderDays * 1 days), timezoneOffset)
  );
  uint8 remainderEndDay = _dayOfWeek(_offsetTimestamp(lastDeadlineInterval, timezoneOffset));
  for (uint j = 0; j < alarmDays.length; j++) {
    uint8 checkDay = alarmDays[j];
    if (
      (checkDay >= remainderStartDay && checkDay <= remainderEndDay) ||
      (remainderStartDay > remainderEndDay && (checkDay >= remainderStartDay || checkDay <= remainderEndDay))
    ) {
      alarmsInRemainderDays++;
    }
  }

  uint totalExpectedEntries = expectedEntriesForFullWeeks + alarmsInRemainderDays;
  return totalExpectedEntries - numAlarmConfirmations;
}

function _timeToNextDeadline(uint32 alarmTime, uint8[] memory alarmDays, int8 timezoneOffset) view returns (uint) {
  return _nextDeadlineTimestamp(alarmTime, alarmDays, timezoneOffset) - block.timestamp;
}

function _nextDeadlineTimestamp(uint32 alarmTime, uint8[] memory alarmDays, int8 timezoneOffset) view returns (uint) {
  uint referenceTimestamp = _lastAlarmTimeInterval(block.timestamp, alarmTime, timezoneOffset);
  uint8 curDay = _dayOfWeek(_offsetTimestamp(referenceTimestamp, timezoneOffset));
  uint8 nextDay = _nextAlarmDay(alarmDays, curDay);

  uint8 daysAway;
  if (nextDay > curDay) {
    daysAway = nextDay - curDay;
  } else {
    daysAway = 7 - curDay + _nextAlarmDay(alarmDays, 0);
  }

  return referenceTimestamp + uint(daysAway) * 1 days;
}

function _nextAlarmDay(uint8[] memory alarmDays, uint8 currentDay) pure returns (uint8) {
  /**
   * Iterate over the alarmDays and take the first day that that's greater than today
   * If there are none, return the earliest alarmDay (lowest index)
   */
  for (uint i; i < alarmDays.length; i++) {
    if (alarmDays[i] > currentDay) {
      return alarmDays[i];
    }
  }

  return alarmDays[0];
}

function _nextAlarmTimeInterval(uint timestamp, uint32 alarmTime, int8 timezoneOffset) pure returns (uint) {
  uint lastMidnight = _lastMidnightTimestamp(timestamp, timezoneOffset);
  if (_deadlinePassedToday(timestamp, alarmTime, timezoneOffset)) {
    return lastMidnight + 1 days + alarmTime;
  } else {
    return lastMidnight + alarmTime;
  }
}

function _lastAlarmTimeInterval(uint timestamp, uint32 alarmTime, int8 timezoneOffset) pure returns (uint) {
  uint lastMidnight = _lastMidnightTimestamp(timestamp, timezoneOffset);
  if (_deadlinePassedToday(timestamp, alarmTime, timezoneOffset)) {
    return lastMidnight + alarmTime;
  } else {
    return lastMidnight - 1 days + alarmTime;
  }
}

function _deadlinePassedToday(uint timestamp, uint32 alarmTime, int8 timezoneOffset) pure returns (bool) {
  uint _now = _offsetTimestamp(timestamp, timezoneOffset);
  return (_now % 1 days) > alarmTime;
}

// 1 = Sunday, 7 = Saturday
function _dayOfWeek(uint timestamp) pure returns (uint8 dayOfWeek) {
  uint _days = timestamp / 1 days;
  dayOfWeek = uint8(((_days + 4) % 7) + 1);
}

/**
 * @notice 'midnight' is timezone specific so we must offset the timestamp before taking the modulus.
 * this is like pretending UTC started in the user's timezone instead of GMT.
 */
function _lastMidnightTimestamp(uint timestamp, int8 timezoneOffset) pure returns (uint) {
  uint localTimestamp = _offsetTimestamp(timestamp, timezoneOffset);
  uint lastMidnightLocal = localTimestamp - (localTimestamp % 1 days);
  return _offsetTimestamp(lastMidnightLocal, -timezoneOffset);
}

function _offsetTimestamp(uint timestamp, int8 offset) pure returns (uint) {
  return uint(int(timestamp) + offset * int(3600));
}

function _validateDaysArr(uint8[] calldata daysActive) pure returns (bool) {
  if (daysActive.length > 7 || daysActive.length == 0) {
    return false;
  }
  uint8 lastDay;
  for (uint i; i < daysActive.length; i++) {
    uint8 day = daysActive[i];
    if (day == 0 || day > 7 || lastDay > day) {
      return false;
    }
    lastDay = day;
  }
  return true;
}
