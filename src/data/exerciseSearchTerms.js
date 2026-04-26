export const exerciseSearchTerms = {
  supino_reto: {
    ptName: "Supino reto",
    searchTerms: ["bench press", "barbell bench press", "chest press"]
  },
  supino_inclinado: {
    ptName: "Supino inclinado",
    searchTerms: ["incline bench press", "incline dumbbell press", "incline chest press"]
  },
  crucifixo_maquina: {
    ptName: "Crucifixo máquina",
    searchTerms: ["pec deck fly", "chest fly", "lever pec deck fly"]
  },
  flexao_braco: {
    ptName: "Flexão de braço",
    searchTerms: ["push up", "push-up"]
  },
  puxada_frente: {
    ptName: "Puxada frente",
    searchTerms: ["lat pulldown", "cable pulldown", "wide grip lat pulldown"]
  },
  remada_baixa: {
    ptName: "Remada baixa",
    searchTerms: ["seated cable row", "cable row"]
  },
  remada_unilateral: {
    ptName: "Remada unilateral",
    searchTerms: ["one arm dumbbell row", "single arm row"]
  },
  pulldown: {
    ptName: "Pulldown",
    searchTerms: ["straight arm pulldown", "cable pulldown"]
  },
  leg_press: {
    ptName: "Leg press",
    searchTerms: ["leg press", "sled leg press"]
  },
  cadeira_extensora: {
    ptName: "Cadeira extensora",
    searchTerms: ["leg extension", "lever leg extension"]
  },
  mesa_flexora: {
    ptName: "Mesa flexora",
    searchTerms: ["leg curl", "lying leg curl", "seated leg curl"]
  },
  stiff: {
    ptName: "Stiff",
    searchTerms: ["stiff leg deadlift", "romanian deadlift"]
  },
  passada: {
    ptName: "Passada",
    searchTerms: ["lunge", "walking lunge"]
  },
  desenvolvimento: {
    ptName: "Desenvolvimento",
    searchTerms: ["shoulder press", "overhead press", "dumbbell shoulder press"]
  },
  elevacao_lateral: {
    ptName: "Elevação lateral",
    searchTerms: ["lateral raise", "dumbbell lateral raise"]
  },
  crucifixo_inverso: {
    ptName: "Crucifixo inverso",
    searchTerms: ["reverse fly", "rear delt fly"]
  },
  triceps_corda: {
    ptName: "Tríceps corda",
    searchTerms: ["triceps pushdown", "rope triceps pushdown", "cable triceps pushdown"]
  },
  triceps_testa: {
    ptName: "Tríceps testa",
    searchTerms: ["skull crusher", "lying triceps extension"]
  },
  rosca_direta: {
    ptName: "Rosca direta",
    searchTerms: ["barbell curl", "biceps curl"]
  },
  rosca_alternada: {
    ptName: "Rosca alternada",
    searchTerms: ["alternate dumbbell curl", "dumbbell curl"]
  },
  prancha: {
    ptName: "Prancha",
    searchTerms: ["plank", "front plank"]
  },
  abdominal_infra: {
    ptName: "Abdominal infra",
    searchTerms: ["leg raise", "lying leg raise", "reverse crunch"]
  },
  abdominal_polia: {
    ptName: "Abdominal polia",
    searchTerms: ["cable crunch", "kneeling cable crunch"]
  },
  prancha_lateral: {
    ptName: "Prancha lateral",
    searchTerms: ["side plank"]
  }
};

export function normalizeSearchText(text) {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function getExerciseSearchTerms(exerciseId) {
  return exerciseSearchTerms[exerciseId]?.searchTerms || [];
}
