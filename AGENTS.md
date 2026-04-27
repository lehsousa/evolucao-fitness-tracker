# Evolução Fitness Leandro - Registro para Agentes

Este arquivo resume o estado atual do projeto para qualquer agente ou pessoa que retome o trabalho.

## Estado atual

- App React + Vite + Tailwind funcionando como PWA e empacotado via Capacitor Android.
- App Android já roda no celular via Android Studio/Capacitor.
- Nome nativo Android configurado como `Evolução Fitness`.
- Ícone e splash Android foram substituídos por assets temporários profissionais com fundo escuro e marca verde/ciano.
- Coach IA usa Gemini sob demanda quando `VITE_GEMINI_API_KEY` está presente.
- ExerciseDB usa RapidAPI quando `VITE_EXERCISEDB_API_KEY` está presente.
- Health Connect possui bridge nativa Android via plugin Capacitor local; web/PWA continua com importação assistida.
- Dados do app continuam locais, via `localStorage`; não há backend.

## Variáveis de ambiente

As chaves ficam no `.env`, que está ignorado pelo Git.

- `VITE_EXERCISEDB_API_KEY`
- `VITE_EXERCISEDB_API_HOST`
- `VITE_GEMINI_API_KEY`

Não commitar `.env`, `.env.local` ou arquivos gerados em `dist/`.

## Comandos principais

```bash
npm run dev
npm run build
npm run preview
npm run cap:assets
npm run cap:sync
npm run cap:open
npm run cap:run:android
```

Para validar Android via Gradle nesta máquina, use o JBR do Android Studio:

```powershell
$env:JAVA_HOME='C:\Program Files\Android\Android Studio\jbr'
$env:Path="$env:JAVA_HOME\bin;$env:Path"
cd android
.\gradlew.bat assembleDebug
```

Motivo: o `java` padrão do Windows aponta para Java 8 32-bit, mas o Android Gradle Plugin atual exige Java 11+.

## Identidade Android

Arquivos principais:

- `capacitor.config.json`
- `android/app/src/main/res/values/strings.xml`
- `android/app/src/main/res/values/styles.xml`
- `android/app/src/main/res/values/colors.xml`
- `resources/icon.png`
- `resources/icon-foreground.png`
- `resources/splash.png`

Depois de trocar assets em `resources/`, rode:

```bash
npm run cap:assets
npx cap sync android
```

## Coach IA

Arquivos principais:

- `src/pages/CoachAI.jsx`
- `src/services/ai/geminiCoachService.js`
- `src/utils/coachUtils.js`

Correção recente:

- A resposta do Gemini estava chegando truncada e sendo salva em `localStorage`.
- O serviço agora pede JSON curto com `responseMimeType: 'application/json'`.
- A tela detecta relatório antigo incompleto e exibe aviso.
- O botão muda para `Gerar novamente` quando já existe relatório salvo.
- A chave usada para relatórios Gemini é `coachReports`.

Novo fluxo de sugestões de treino:

- `src/utils/workoutSuggestionEngine.js` gera sugestões locais com `analyzeWorkoutForSuggestions(data)`.
- `src/utils/applyWorkoutSuggestion.js` aplica sugestões aprovadas no `customWorkoutPlan`.
- `src/components/admin/AdminPlanPage.jsx` lista pendentes, aplicadas, rejeitadas e histórico.
- `src/components/admin/WorkoutSuggestionCard.jsx` renderiza os cards de aprovação.
- `src/components/admin/WorkoutChangeHistory.jsx` mostra o histórico.
- `coachWorkoutSuggestions` guarda as sugestões.
- `workoutChangeHistory` guarda alterações aplicadas.
- Nenhuma sugestão altera treino sem confirmação do usuário.
- `workoutPlan.js` continua sendo o plano padrão fixo.

Se o usuário ainda vir análise cortada, a causa provável é relatório antigo já salvo no armazenamento local do app. Gerar novamente deve substituir.

## LocalStorage

Principais chaves atuais:

- `efl:checkins`
- `efl:workouts`
- `efl:cardios`
- `efl:photos`
- `efl:checklist`
- `efl:notifications`
- `exerciseLoadHistory`
- `workoutSubstitutions`
- `exerciseDbMappings`
- `selectedWorkoutDay`
- `customWorkoutPlan`
- `weeklyProgressionSuggestions`
- `coachWeeklyReports`
- `coachReports`
- `coachWorkoutSuggestions`
- `workoutChangeHistory`
- `nutritionLogs`
- `pendingHealthImport`

## Health Connect

Arquivos principais:

- `android/app/src/main/java/br/com/leandro/evolucaofitness/HealthConnectPlugin.kt`
- `android/app/src/main/java/br/com/leandro/evolucaofitness/MainActivity.java`
- `src/services/health/healthConnectNativeService.js`
- `src/pages/Integrations.jsx`
- `src/pages/Checkin.jsx`

Configuração Android:

- Dependência: `androidx.health.connect:connect-client:1.1.0-alpha12`
- Kotlin Android plugin adicionado ao app nativo.
- `minSdkVersion = 26`, exigido pelo SDK atual do Health Connect.
- Manifest inclui queries para `com.google.android.apps.healthdata` e `com.sec.android.app.shealth`.
- Permissões de leitura adicionadas: steps, weight, body fat, BMR, heart rate, sleep, active calories e total calories.
- Rationale configurado com `androidx.health.ACTION_SHOW_PERMISSIONS_RATIONALE` e alias `VIEW_PERMISSION_USAGE`.

Fluxo:

- Android/Capacitor: Check-in chama Health Connect, pede permissões e preenche campos retornados sem apagar valores existentes.
- Web/PWA: botão de importação abre a importação assistida manual.
- Integrações mostra status real, permissões, importar dados de hoje e abrir configurações.
- Não há integração Bluetooth direta, backend ou envio automático para Gemini.

## Funcionalidades implementadas

- Dashboard
- Check-in diário com dados corporais e integração futura
- Evolução com gráficos
- Fotos
- Treinos com biblioteca, detalhes, alternativas, carga e gráficos
- Editor de treino
- Sugestões semanais locais
- Cardio
- Metas
- Integrações futuras
- Coach IA local + Gemini
- Sugestões locais de treino com aprovação/admin
- Health Connect nativo Android para preencher Check-in
- Plano alimentar
- PWA
- Android via Capacitor
- Ícone e splash Android

## Validações recentes

Executado com sucesso:

```bash
npm run build
npx cap sync android
.\gradlew.bat assembleDebug
```

O build web ainda emite aviso de chunk grande por causa do bundle atual, mas não é erro.

## Próximos caminhos prováveis

- Testar no celular a nova geração do Coach IA após reinstalar/rodar o APK atualizado.
- Implementar exportação/importação JSON de backup.
- Testar Health Connect em celular físico com Samsung Health/Fitdays sincronizados.
- Melhorar code splitting para reduzir o aviso de chunk grande.
- Revisar visual do menu mobile conforme feedback de uso real no aparelho.
