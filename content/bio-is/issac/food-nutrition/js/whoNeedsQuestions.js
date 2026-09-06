export const GROUPS = {
  child: {
    id: "child",
    label: "Child",
    aliases: ["child", "a child", "children"],
  },
  pregnant: {
    id: "pregnant",
    label: "Pregnant women",
    aliases: [
      "pregnant women",
      "pregnant woman",
      "pregnant",
      "child/foetus",
      "child/fetus",
      "child / foetus",
      "child / fetus",
      "foetus",
      "fetus",
    ],
  },
  elderly: {
    id: "elderly",
    label: "Elderly",
    aliases: ["elderly", "elder", "old people", "the elderly"],
  },
  office: {
    id: "office",
    label: "Office worker",
    aliases: ["office worker", "office workers", "office"],
  },
  physical: {
    id: "physical",
    label: "Physical workers",
    aliases: ["physical workers", "physical worker", "physical"],
  },
  indoor: {
    id: "indoor",
    label: "Indoor people",
    aliases: ["indoor people", "indoor", "indoor person"],
  },
  male: {
    id: "male",
    label: "Male",
    aliases: ["male", "males", "man", "men"],
  },
  female: {
    id: "female",
    label: "Female (puberty)",
    aliases: [
      "female (puberty)",
      "female puberty",
      "female",
      "females",
      "woman",
      "women",
      "girl",
      "girls",
    ],
  },
};

export const GROUP_IDS = Object.keys(GROUPS);

export const QUESTIONS = [
  {
    id: "q1",
    stem: "Who needs more energy because of greater heat loss (greater surface area to volume ratio)?",
    answerId: "child",
    why: "Children lose more heat (greater SA:V), so they need more energy.",
  },
  {
    id: "q2",
    stem: "Who needs more protein for rapid growth, e.g. muscle?",
    answerId: "child",
    answerIds: ["child", "pregnant"],
    why: "A child (and the child/foetus) needs more protein for growth and tissue formation.",
  },
  {
    id: "q3",
    stem: "Who needs more protein for muscle and tissue formation of the child/foetus?",
    answerId: "pregnant",
    answerIds: ["pregnant", "child"],
    why: "The child/foetus (pregnant women) needs protein for muscle and tissue formation.",
  },
  {
    id: "q4",
    stem: "Who needs more calcium / vitamin D to grow bones and teeth?",
    answerId: "pregnant",
    answerIds: ["pregnant", "child"],
    why: "The child/foetus (pregnant women) needs calcium and vitamin D to grow bones and teeth.",
  },
  {
    id: "q5",
    stem: "Who needs more iron for blood (haemoglobin) of the foetus?",
    answerId: "pregnant",
    answerIds: ["pregnant", "child"],
    why: "The child/foetus (pregnant women) needs iron for blood (haemoglobin).",
  },
  {
    id: "q6",
    stem: "Who needs more dietary fibre to prevent constipation in pregnancy?",
    answerId: "pregnant",
    why: "Pregnant women need more dietary fibre to prevent constipation.",
  },
  {
    id: "q7",
    stem: "Who needs more calcium / vitamin D to prevent osteoporosis?",
    answerId: "elderly",
    why: "The elderly need more calcium and vitamin D to prevent osteoporosis.",
  },
  {
    id: "q8",
    stem: "Who needs less energy because they are less active?",
    answerId: "elderly",
    answerIds: ["elderly", "office"],
    why: "The elderly (less active) and office workers (sedentary) need less energy.",
  },
  {
    id: "q9",
    stem: "Who needs less energy due to a sedentary (久坐) lifestyle?",
    answerId: "office",
    why: "Office workers have a sedentary lifestyle, so they need less energy.",
  },
  {
    id: "q10",
    stem: "Who needs more dietary fibre and water to prevent constipation at a desk job?",
    answerId: "office",
    why: "Office workers need more dietary fibre and water to prevent constipation.",
  },
  {
    id: "q11",
    stem: "Who needs more energy to support muscle movement at work?",
    answerId: "physical",
    why: "Physical workers need more energy to support muscle movement.",
  },
  {
    id: "q12",
    stem: "Who needs more vitamin D because of not enough sunlight?",
    answerId: "indoor",
    why: "Indoor people get less sunlight, so they need more vitamin D.",
  },
  {
    id: "q13",
    stem: "Who needs more energy and protein because they are more muscular / have less subcutaneous fat (more heat loss)?",
    answerId: "male",
    why: "Males are more muscular and have less subcutaneous fat (more heat loss), so they need more energy and protein.",
  },
  {
    id: "q14",
    stem: "Who needs more iron due to menstruation blood loss?",
    answerId: "female",
    why: "Females at puberty need more iron because of menstruation blood loss.",
  },
  {
    id: "q15",
    stem: "Who needs more calcium / vitamin D and less energy (osteoporosis risk + less active)?",
    answerId: "elderly",
    why: "The elderly need more calcium/vitamin D to prevent osteoporosis, and less energy because they are less active.",
  },
];

export const TOTAL = QUESTIONS.length;

export function shuffle(list) {
  const a = list.slice();
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function normalizeAnswer(raw) {
  return String(raw || "")
    .trim()
    .toLowerCase()
    .replace(/[()]/g, " ")
    .replace(/[/_,.-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function matchesGroup(raw, groupId) {
  const needle = normalizeAnswer(raw);
  if (!needle) return false;
  const group = GROUPS[groupId];
  if (!group) return false;
  return group.aliases.some((alias) => normalizeAnswer(alias) === needle);
}

export function answerIdsOf(q) {
  if (Array.isArray(q.answerIds) && q.answerIds.length) return q.answerIds;
  return q.answerId ? [q.answerId] : [];
}

export function matchesQuestion(raw, q) {
  return answerIdsOf(q).some((id) => matchesGroup(raw, id));
}

export function answerLabels(q) {
  return answerIdsOf(q)
    .map((id) => GROUPS[id]?.label)
    .filter(Boolean);
}

export function hintOptionsFor(answerId) {
  const others = shuffle(GROUP_IDS.filter((id) => id !== answerId)).slice(0, 3);
  return shuffle([answerId, ...others]);
}
