# Evolução Fitness Leandro

Aplicativo web pessoal para acompanhar check-ins, treinos, cardio, medidas, fotos e evolução corporal. Os dados ficam salvos no `localStorage` do navegador.

## Rodar Localmente

```bash
npm install
npm run dev
```

Abra `http://localhost:5173/`.

## Gerar Build

```bash
npm run build
```

Os arquivos finais ficam em `dist/`.

## Testar PWA

O service worker só é registrado em produção. Para testar instalação, cache e modo standalone:

```bash
npm run build
npm run preview
```

Abra `http://localhost:4173/` no Chrome. No DevTools, use a aba `Application` para conferir:

- Manifest: `Evolução Fitness Leandro`
- Service Worker: registrado
- Cache Storage: assets principais salvos
- Display: `standalone`
- Theme color: `#020617`

## Instalar no Android

1. Publique o app em uma URL com HTTPS, ou acesse o preview por um endereço de rede disponível no celular.
2. Abra o app no Google Chrome do Android.
3. Toque no menu de três pontos.
4. Escolha `Instalar app` ou `Adicionar à tela inicial`.
5. Confirme a instalação com o nome `Evolução Fitness`.

Depois de instalado, o app abre como aplicativo, com ícone próprio, tema escuro e funcionamento básico offline.

## Área de Treinos

A tela de treinos tem seleção por dia da semana, cards de exercícios, detalhes técnicos, alternativas e histórico de carga.

## Coach IA

A tela `Coach IA` gera um relatório semanal local com a função `generateWeeklyCoachReport(data)`, sem API externa nesta fase.

O relatório mostra:

- peso inicial e atual
- evolução de cintura
- treinos concluídos
- cardios concluídos
- média de passos
- média de sono
- leitura simples de evolução de carga
- alertas positivos
- pontos de atenção
- sugestões para a próxima semana
- sugestões de treino, cardio e lembretes de nutrição

A função retorna este modelo:

- `summary`
- `positives`
- `attentionPoints`
- `nextWeekActions`
- `trainingSuggestions`
- `cardioSuggestions`
- `nutritionReminders`

As recomendações são motivadoras e conservadoras: não fazem diagnóstico médico, não recomendam medicamentos, não sugerem suplementos arriscados e não alteram treino automaticamente. O botão `Salvar relatório` guarda um retrato da semana em `coachWeeklyReports`.

## Plano Alimentar

A tela `Alimentar` organiza o plano inicial de alimentação para redução de gordura com preservação muscular.

Recursos da versão atual:

- metas de proteína, água, calorias e peso atual
- cards por horário de refeição
- opções de pratos com alimentos, tags e proteína estimada
- status por refeição: pendente, feito, pulei, fora do plano e trocado
- modal para trocar a opção da refeição
- checklist diário com proteína, aderência, refeições feitas e refeições fora do plano
- contador de água com botões rápidos de 250 ml, 500 ml e 1 L
- histórico alimentar dos últimos 7 dias
- lista de compras base

Os dados ficam salvos em `nutritionLogs`. O plano é informativo e não substitui orientação profissional individualizada.

Como registrar carga:

1. Abra `Treinos`.
2. Escolha o dia da semana.
3. Toque em `Carga` ou em `Detalhes` no exercício.
4. Preencha data, séries, repetições, carga em kg, RPE opcional e observações.
5. Salve para atualizar o histórico e o gráfico.

Como ver evolução:

- Abra o detalhe do exercício.
- Veja `Última`, `Melhor`, `Volume` e o gráfico de evolução de carga.
- O app mostra uma sugestão simples de progressão com base no histórico e no RPE.

Como usar alternativas:

1. Toque em `Ocupado?` no card ou em `Aparelho ocupado? Ver substituições` no detalhe.
2. Escolha uma alternativa equivalente.
3. A substituição fica marcada apenas para o treino do dia atual.

### Editor de Treino

A tela `Editor` permite ajustar o plano sem mexer no código:

1. Toque em `Novo dia` para criar um treino.
2. Edite dia, nome, foco e observações.
3. Use `Adicionar` para escolher exercícios da biblioteca.
4. Ajuste séries, repetições, descanso e observações.
5. Use as setas para alterar a ordem.
6. Toque em `Salvar tudo`.

Quando existe um plano salvo no navegador, ele substitui o plano padrão. O botão `Restaurar plano padrão` remove a personalização e volta para a divisão original.

### Sugestões da Semana

A tela `Sugestões` usa regras locais simples, sem IA externa e sem aplicar nada automaticamente.

- RPE até 7 com repetições dentro da meta: sugere subir 2% a 5%.
- RPE 9 ou maior: sugere manter ou reduzir um pouco.
- Sem histórico: sugere começar leve e priorizar técnica.
- Três sessões sem evolução clara: sugere revisar técnica, descanso ou alternativa.

Cada sugestão mostra `Aplicar sugestão`, `Ignorar` e `Editar manualmente`. Esses botões registram sua decisão no `localStorage`; o app não muda cargas ou treinos sozinho.

Como adicionar animações futuramente:

- Os exercícios ficam em `src/data/exercises.js`.
- Cada exercício já tem `animationType` e `animationUrl`.
- Quando houver um GIF, imagem ou vídeo, preencha `animationUrl` e ajuste `animationType` para `gif`, `video` ou outro tipo suportado no componente `ExerciseAnimationPlaceholder`.

Arquivos principais:

- Dados dos exercícios: `src/data/exercises.js`
- Plano semanal: `src/data/workoutPlan.js`
- Página: `src/pages/WorkoutsPage.jsx`
- Componentes: `src/components/workout/`
- Hook de histórico: `src/hooks/useExerciseHistory.js`
- Utilitários de progressão: `src/utils/workoutUtils.js`

Chaves usadas no `localStorage`:

- `exerciseLoadHistory`: histórico de cargas por exercício
- `workoutSubstitutions`: substituições escolhidas para o dia atual
- `exerciseDbMappings`: mapeamento entre exercício local e ExerciseDB
- `selectedWorkoutDay`: último dia de treino selecionado
- `customWorkoutPlan`: plano editável salvo pelo usuário
- `weeklyProgressionSuggestions`: sugestões e decisões registradas por data
- `coachWeeklyReports`: relatórios semanais salvos pelo Coach IA
- `nutritionLogs`: refeições, água e aderência alimentar por data
- `efl:workouts`: exercícios concluídos

### ExerciseDB Opcional

O app pode buscar GIFs/animações na ExerciseDB para substituir o placeholder visual dos exercícios.

Crie um arquivo `.env.local` na raiz do projeto:

```bash
VITE_EXERCISEDB_API_KEY=sua_chave_rapidapi
```

Opcionalmente, se sua conta/API usar outro host ou base URL:

```bash
VITE_EXERCISEDB_API_HOST=exercisedb.p.rapidapi.com
VITE_EXERCISEDB_API_BASE_URL=https://exercisedb.p.rapidapi.com
```

Depois reinicie o servidor:

```bash
npm run dev
```

Na tela `Treinos`, use a seção `Administração de GIFs` para buscar exercícios na ExerciseDB e mapear cada exercício local ao exercício externo. Se a API falhar ou a chave não estiver configurada, o app mantém o placeholder.

## PWA

Arquivos principais:

- Manifesto: `public/manifest.json`
- Service worker: `public/sw.js`
- Ícone SVG: `public/icon.svg`
- Ícones PNG: `public/icons/icon-192.png` e `public/icons/icon-512.png`
- Registro do service worker: `src/registerServiceWorker.js`

O PWA usa cache básico para abrir o app mesmo sem internet e manter assets principais salvos. Os dados do usuário continuam no `localStorage`.
