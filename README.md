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

### Sugestões de Treino pelo Coach

Na tela `Coach IA`, o card `Sugestões de treino` roda regras locais com `analyzeWorkoutForSuggestions(data)`.

O fluxo é:

1. Coach analisa plano, cargas, RPE, substituições, check-ins, cardio e sono.
2. Sugestões ficam salvas como `pending` em `coachWorkoutSuggestions`.
3. A tela `Admin Plano` mostra pendentes, aplicadas, rejeitadas e histórico.
4. O usuário aprova, edita ou rejeita.
5. Ao aprovar, `applyWorkoutSuggestion(suggestion, currentPlan)` altera apenas o item necessário em `customWorkoutPlan`.
6. Toda alteração aplicada é registrada em `workoutChangeHistory`.

O plano padrão em `src/data/workoutPlan.js` nunca é alterado. A restauração do plano padrão continua disponível no Editor/Admin.

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
- `coachReports`: histórico de relatórios Gemini gerados manualmente
- `coachWorkoutSuggestions`: sugestões locais de alteração do treino geradas pelo Coach
- `workoutChangeHistory`: histórico de alterações aprovadas no plano
- `nutritionLogs`: refeições, água e aderência alimentar por data
- `efl:workouts`: exercícios concluídos

### Integração com ExerciseDB

O app pode buscar GIFs/animações reais de exercícios na ExerciseDB para substituir os placeholders padrão.

Como configurar:
1. Crie uma conta gratuita no RapidAPI.
2. Assine o plano básico/teste da API ExerciseDB.
3. Na raiz do projeto, crie um arquivo chamado `.env`.
4. Adicione as chaves no formato:

```bash
VITE_EXERCISEDB_API_KEY=minha_chave_real
VITE_EXERCISEDB_API_HOST=exercisedb.p.rapidapi.com
```

> **Aviso de Segurança**: No desenvolvimento front-end com Vite, qualquer variável prefixada com `VITE_` é exposta no código final. Como este projeto é de uso pessoal/MVP, não há problema em injetá-la localmente. Se você for publicar comercialmente, recomenda-se criar um backend ou proxy seguro para não expor a chave de API.

Depois de salvar o `.env`, reinicie o servidor:

```bash
npm run dev
```

## Integração com Gemini API (Coach IA Gratuita)

O projeto também possui uma integração opcional e sob demanda com a IA do Google (Gemini 2.5 Flash) na tela do **Coach**. A análise local continua disponível; a IA recebe apenas um mini-resumo compactado numérico da sua semana (nunca fotos, exames, histórico bruto ou dados pessoais sensíveis) e devolve uma resposta curta e conservadora para a próxima semana.

Para ativar essa funcionalidade:
1. Acesse o [Google AI Studio](https://aistudio.google.com/).
2. Crie um projeto e gere uma **API Key** (gratuita).
3. No arquivo `.env` raiz do seu projeto local, adicione:
```env
VITE_GEMINI_API_KEY=sua_chave_aqui
```
4. Ao abrir o App na aba Coach, o botão roxo de IA será habilitado. A geração é sempre manual e cada resposta é adicionada ao histórico `coachReports`. Se ocorrer falha de rede, erro de API ou falta de chave, o app mostra erro amigável e mantém a análise local como segurança.

## Health Connect

A integração real com Health Connect funciona apenas no app Android via Capacitor. No navegador/PWA, o app mantém a importação assistida manual.

O fluxo esperado é:

```text
Galaxy Fit3 -> Samsung Health -> Health Connect -> Evolução Fitness
Balança Multilaser/Fitdays -> Fitdays -> Health Connect -> Evolução Fitness
```

Dados suportados inicialmente:

- Peso
- Gordura corporal
- Metabolismo basal
- Passos
- Sono
- Frequência cardíaca média
- Calorias ativas e totais

Dados como massa muscular, gordura visceral e água corporal dependem da fonte e podem continuar manuais quando não forem publicados no Health Connect.

Para testar no celular:

1. Sincronize a Galaxy Fit3 com Samsung Health.
2. Sincronize a balança com Fitdays.
3. Ative o compartilhamento dos dados com Health Connect.
4. Abra o app Evolução Fitness no Android.
5. Vá em `Integrações`.
6. Toque em `Verificar disponibilidade`.
7. Toque em `Solicitar permissões`.
8. Use `Importar dados de hoje` ou vá em `Check-in` e toque em `Importar dados de saúde`.
9. Revise os dados importados antes de salvar.

Configuração nativa adicionada:

- Plugin Capacitor local: `HealthConnectPlugin`
- Serviço JS: `src/services/health/healthConnectNativeService.js`
- Dependência Android: `androidx.health.connect:connect-client:1.1.0-alpha12`
- `minSdkVersion`: 26, exigido pelo SDK atual do Health Connect
- Os dados importados ficam no `localStorage` junto ao check-in. Nada é enviado para backend ou para Gemini automaticamente.

## Transformação para Aplicativo Android (Capacitor)

Este projeto está integrado ao **Capacitor**, permitindo empacotar o site React (Vite) dentro de um aplicativo Android real, sem precisar alterar a base de código do Front-end ou corromper seu banco de dados local.

### Identidade Visual Android

O nome nativo exibido no celular está configurado como `Evolução Fitness` em:

- `capacitor.config.json`
- `android/app/src/main/res/values/strings.xml`

Os assets temporários do app ficam em `resources/`:

- `resources/icon.png`
- `resources/icon-foreground.png`
- `resources/splash.png`

Para regenerar ícones e splash com o `@capacitor/assets`, rode:

```bash
npm run cap:assets
```

Depois sincronize o Android:

```bash
npx cap sync android
```

O splash screen usa fundo escuro `#020617` e o ícone central do app. Se trocar a identidade visual no futuro, substitua os arquivos em `resources/` e rode os comandos acima.

### Como Gerar e Sincronizar o App

Sempre que você alterar o código (React/Tailwind) e quiser ver as mudanças no aplicativo Android, rode:

```bash
npm run cap:sync
```
*Esse comando fará o build (`npm run build`) automaticamente e copiará os arquivos minificados para a pasta `android/`.*

### Como Abrir no Android Studio

Para compilar o aplicativo para o seu celular ou gerar o APK, abra o projeto Android Studio rodando:

```bash
npm run cap:open
```

No Android Studio, você poderá:
1. Conectar seu celular Android via cabo USB (com Modo Desenvolvedor e Depuração USB ativos).
2. Selecionar o seu celular no topo.
3. Clicar no botão **Play** (Run 'app') para instalar direto nele.
4. Ou ir em **Build > Build Bundle / APK > Build APK(s)** para gerar o arquivo `.apk` final.

### Como Executar Direto no Dispositivo (CLI)

Se seu celular já estiver conectado no PC e configurado para Depuração USB, você pode rodar o app no celular sem abrir o Android Studio executando:

```bash
npm run cap:run:android
```

## PWA

Arquivos principais:

- Manifesto: `public/manifest.json`
- Service worker: `public/sw.js`
- Ícone SVG: `public/icon.svg`
- Ícones PNG: `public/icons/icon-192.png` e `public/icons/icon-512.png`
- Registro do service worker: `src/registerServiceWorker.js`

O PWA usa cache básico para abrir o app mesmo sem internet e manter assets principais salvos. Os dados do usuário continuam no `localStorage`.
