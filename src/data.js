export const houses = [
  {
    id: "parakrama",
    name: "Parakrama",
    color: "#f2c94c",
    pale: "#fff3d8",
    motto: "The spirit of courage",
  },
  {
    id: "gemunu",
    name: "Gemunu",
    color: "#22a875",
    pale: "#e3f5eb",
    motto: "The strength to lead",
  },
  {
    id: "thissa",
    name: "Thissa",
    color: "#ed5355",
    pale: "#ffece9",
    motto: "The heart to compete",
  },
  {
    id: "vijaya",
    name: "Vijaya",
    color: "#4d8ef7",
    pale: "#e7f0fd",
    motto: "The will to win",
  },
];

export const initialEvents = [
  {
    id: "e1",
    name: "100m Sprint",
    category: "Track",
    division: "Under 19 Boys",
    status: "Completed",
    time: "09:15 AM",
    results: [
      { houseId: "gemunu", athlete: "R. Perera", place: 1, points: 10 },
      { houseId: "parakrama", athlete: "S. Jayasinghe", place: 2, points: 7 },
      { houseId: "vijaya", athlete: "D. Fernando", place: 3, points: 5 },
      { houseId: "thissa", athlete: "K. Silva", place: 4, points: 3 },
    ],
  },
  {
    id: "e2",
    name: "Long Jump",
    category: "Field",
    division: "Under 17 Boys",
    status: "Completed",
    time: "09:45 AM",
    results: [
      { houseId: "parakrama", athlete: "M. Weerasinghe", place: 1, points: 10 },
      { houseId: "thissa", athlete: "N. Bandara", place: 2, points: 7 },
      { houseId: "gemunu", athlete: "A. Kumara", place: 3, points: 5 },
      { houseId: "vijaya", athlete: "T. Senanayake", place: 4, points: 3 },
    ],
  },
  {
    id: "e3",
    name: "4 × 100m Relay",
    category: "Track",
    division: "Open Boys",
    status: "Completed",
    time: "10:20 AM",
    results: [
      { houseId: "vijaya", athlete: "Vijaya Relay Team", place: 1, points: 20 },
      { houseId: "gemunu", athlete: "Gemunu Relay Team", place: 2, points: 14 },
      {
        houseId: "parakrama",
        athlete: "Parakrama Relay Team",
        place: 3,
        points: 10,
      },
      { houseId: "thissa", athlete: "Thissa Relay Team", place: 4, points: 6 },
    ],
  },
  {
    id: "e4",
    name: "High Jump",
    category: "Field",
    division: "Under 19 Boys",
    status: "Completed",
    time: "11:05 AM",
    results: [
      { houseId: "thissa", athlete: "P. Dissanayake", place: 1, points: 10 },
      { houseId: "gemunu", athlete: "H. Gunawardena", place: 2, points: 7 },
      { houseId: "vijaya", athlete: "I. Wijeratne", place: 3, points: 5 },
      { houseId: "parakrama", athlete: "L. Rathnayake", place: 4, points: 3 },
    ],
  },
  {
    id: "e5",
    name: "200m Sprint",
    category: "Track",
    division: "Under 17 Boys",
    status: "Upcoming",
    time: "01:30 PM",
    results: [],
  },
  {
    id: "e6",
    name: "Shot Put",
    category: "Field",
    division: "Under 19 Boys",
    status: "Upcoming",
    time: "02:00 PM",
    results: [],
  },
  {
    id: "e7",
    name: "800m Run",
    category: "Track",
    division: "Open Boys",
    status: "Upcoming",
    time: "02:45 PM",
    results: [],
  },
  {
    id: "e8",
    name: "Tug of War",
    category: "Team",
    division: "Open Boys",
    status: "Upcoming",
    time: "03:30 PM",
    results: [],
  },
];

export const initialAdjustments = {
  parakrama: 47,
  gemunu: 38,
  thissa: 35,
  vijaya: 39,
};

export function getStandings(events, adjustments) {
  return houses
    .map((house) => {
      const eventPoints = events.reduce(
        (sum, event) =>
          sum +
          event.results.reduce(
            (total, result) =>
              total +
              (result.houseId === house.id ? Number(result.points) || 0 : 0),
            0,
          ),
        0,
      );
      const wins = events.reduce(
        (sum, event) =>
          sum +
          event.results.filter(
            (result) =>
              result.houseId === house.id && Number(result.place) === 1,
          ).length,
        0,
      );
      return {
        ...house,
        points: eventPoints + (Number(adjustments[house.id]) || 0),
        wins,
        eventPoints,
        otherPoints: Number(adjustments[house.id]) || 0,
      };
    })
    .sort((a, b) => b.points - a.points);
}

export const getHouse = (id) =>
  houses.find((house) => house.id === id) || houses[0];
