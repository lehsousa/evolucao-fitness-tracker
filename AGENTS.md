# Evolução Fitness Leandro - Registro para Agentes

Este arquivo resume o estado atual do projeto para qualquer agente ou pessoa que retome o trabalho.

## Estado atual

- App React + Vite + Tailwind funcionando como PWA e empacotado via Capacitor Android.
- App Android já roda no celular via Android Studio/Capacitor.
- Nome nativo Android configurado como `Evolução Fitness`.
- Ícone e splash Android foram substituídos por assets temporários profissionais com fundo escuro e marca verde/ciano.
- Coach IA usa Gemini sob demanda quando `VITE_GEMINI_API_KEY` está presente.
- ExerciseDB usa RapidAPI quando `VITE_EXERCISEDB_API_KEY` está presente.
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
- `nutritionLogs`

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
- Preparar integração nativa futura com Health Connect via Capacitor.
- Melhorar code splitting para reduzir o aviso de chunk grande.
- Revisar visual do menu mobile conforme feedback de uso real no aparelho.
