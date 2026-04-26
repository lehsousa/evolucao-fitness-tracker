export const workouts = [
  {
    day: 'Segunda',
    title: 'Peito + tríceps + abdômen',
    focus: 'Força e controle no empurrar',
    exercises: ['Supino reto', 'Supino inclinado', 'Crucifixo', 'Tríceps corda', 'Tríceps testa', 'Prancha', 'Elevação de pernas'],
  },
  {
    day: 'Terça',
    title: 'Costas + bíceps',
    focus: 'Postura, puxada e braço',
    exercises: ['Puxada alta', 'Remada baixa', 'Remada unilateral', 'Pullover', 'Rosca direta', 'Rosca martelo'],
  },
  {
    day: 'Quarta',
    title: 'Pernas + cardio leve',
    focus: 'Base, mobilidade e resistência',
    exercises: ['Agachamento', 'Leg press', 'Cadeira extensora', 'Mesa flexora', 'Panturrilha', 'Caminhada leve'],
  },
  {
    day: 'Quinta',
    title: 'Ombros + abdômen',
    focus: 'Estabilidade e cintura forte',
    exercises: ['Desenvolvimento', 'Elevação lateral', 'Elevação frontal', 'Face pull', 'Abdominal infra', 'Prancha lateral'],
  },
  {
    day: 'Sexta',
    title: 'Full body + pontos fracos',
    focus: 'Volume inteligente da semana',
    exercises: ['Terra romeno', 'Supino máquina', 'Remada curvada', 'Afundo', 'Bíceps alternado', 'Tríceps banco', 'Abdômen curto'],
  },
];

export const cardioOptions = [
  { name: 'Caminhada em casa', duration: '30-40 min', intensity: 'Constante' },
  { name: 'Escada controlada', duration: '15-25 min', intensity: 'Moderada' },
  { name: 'Bike ergométrica', duration: '30-45 min', intensity: 'Leve a moderada' },
  { name: 'Circuito baixo impacto', duration: '20-30 min', intensity: 'Sem saltos' },
];

export const defaultReminders = [
  { id: 'checkin', time: '07:30', label: 'Check-in', text: 'Pesar e medir cintura' },
  { id: 'food', time: '12:30', label: 'Alimentação', text: 'Proteína + salada' },
  { id: 'workout', time: '18:30', label: 'Treino', text: 'Hora do treino' },
  { id: 'cardio', time: '20:30', label: 'Cardio', text: 'Hora do cardio' },
];

export const dailyChecklist = ['Peso registrado', 'Cintura medida', 'Treino marcado', 'Cardio feito', 'Água registrada'];

export const goals = {
  initialWeight: 100,
  mainWeightGoal: 92,
  intermediateWeightGoal: 96,
  dailyProtein: 140,
  weeklyCardio: 4,
  waterRange: '2,5 a 3 litros',
};
