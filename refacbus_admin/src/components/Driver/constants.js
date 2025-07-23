// constants.js

export const days = ["월", "화", "수", "목", "금"];

export const timeSlots = [
  "08:00", "09:00", "10:00", "11:00", "12:00",
  "16:00", "17:00", "18:00", "19:00",
];

export const getDayIndex = (day) => {
  return days.indexOf(day);
};
