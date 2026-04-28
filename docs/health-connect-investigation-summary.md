# Evolucao Fitness Leandro - resumo tecnico da integracao Health Connect

Data do resumo: 2026-04-26

Este documento registra o estado atual da integracao real com Health Connect no app Android via Capacitor, para que outro agente consiga continuar a investigacao dos dados faltantes sem depender do historico da conversa.

## Contexto do projeto

App: Evolucao Fitness Leandro

Stack principal:

- React + Vite
- Tailwind CSS
- Capacitor Android
- Kotlin/Java no projeto Android nativo
- localStorage para persistencia local
- Health Connect via plugin Capacitor local

O app ja possui:

- Dashboard
- Check-in diario
- Treinos
- Coach IA com analise local e Gemini
- Admin do Plano
- ExerciseDB
- Tela Integracoes
- PWA/Capacitor Android
- Importacao assistida/manual
- Integracao Health Connect nativa inicial

## Objetivo da integracao atual

Ler dados autorizados do Android Health Connect e preencher o Check-in do dia sem quebrar o preenchimento manual.

Fluxo esperado:

- Galaxy Fit3 -> Samsung Health -> Health Connect -> Evolucao Fitness
- Balanca Multilaser/Fitdays -> Fitdays -> Samsung Health/Google Fit/Health Connect -> Evolucao Fitness

Importante: o app nao acessa Samsung Health diretamente nesta fase. Ele le apenas o que foi publicado no Health Connect.

## Arquivos principais

### Android nativo

- `android/app/src/main/java/br/com/leandro/evolucaofitness/HealthConnectPlugin.kt`
  - Plugin Capacitor local chamado `HealthConnect`.
  - Expoe metodos para o JavaScript:
    - `isAvailable`
    - `requestPermissions`
    - `checkPermissions`
    - `readTodayHealthData`
    - `readHealthConnectDiagnostics`
    - `openHealthConnectSettings`

- `android/app/src/main/java/br/com/leandro/evolucaofitness/MainActivity.java`
  - Registra `HealthConnectPlugin.class`.

- `android/app/src/main/AndroidManifest.xml`
  - Contem permissoes Health Connect:
    - `android.permission.health.READ_STEPS`
    - `android.permission.health.READ_WEIGHT`
    - `android.permission.health.READ_BODY_FAT`
    - `android.permission.health.READ_LEAN_BODY_MASS`
    - `android.permission.health.READ_BODY_WATER_MASS`
    - `android.permission.health.READ_BONE_MASS`
    - `android.permission.health.READ_BASAL_METABOLIC_RATE`
    - `android.permission.health.READ_HEART_RATE`
    - `android.permission.health.READ_SLEEP`
    - `android.permission.health.READ_ACTIVE_CALORIES_BURNED`
    - `android.permission.health.READ_TOTAL_CALORIES_BURNED`
  - Tambem contem queries para:
    - `com.google.android.apps.healthdata`
    - `com.sec.android.app.shealth`

- `android/app/build.gradle`
  - Usa Health Connect client.
  - Versao atualmente configurada no projeto: `androidx.health.connect:connect-client:1.1.0-alpha12`.

### Frontend React

- `src/services/health/healthConnectNativeService.js`
  - Wrapper JavaScript para o plugin Capacitor.
  - Expoe:
    - `isNativeHealthConnectAvailable`
    - `requestHealthPermissions`
    - `checkHealthPermissions`
    - `readTodayHealthData`
    - `readHealthConnectDiagnostics`
    - `openHealthConnectSettings`
  - `readTodayHealthData()` chama a leitura principal e usa o diagnostico como fallback para completar campos que a leitura principal deixou vazios.

- `src/pages/Checkin.jsx`
  - Botao de importacao de dados de saude.
  - Se origem for `health_connect`, usa importacao automatica.
  - Se origem for `samsung_health`, `fitdays` ou `importacao_assistida`, abre modal de importacao assistida.
  - Nao sobrescreve campos manuais como cintura.
  - Preenche campos recebidos do Health Connect e mantem valores existentes se algum dado vier nulo.

- `src/pages/Integrations.jsx`
  - Card Health Connect.
  - Botoes:
    - Verificar disponibilidade
    - Solicitar permissoes
    - Importar dados de hoje
    - Abrir configuracoes
    - Diagnosticar Health Connect
  - Mostra permissao por tipo e diagnostico dos registros publicados.

- `src/components/integrations/AssistedImportModal.jsx`
  - Modal para preencher dados manualmente a partir de Samsung Health/Fitdays quando a leitura automatica nao fornece todos os campos.

## Tipos de dados tentados no Health Connect

O plugin tenta ler:

- `StepsRecord`
- `WeightRecord`
- `BodyFatRecord`
- `LeanBodyMassRecord`
- `BodyWaterMassRecord`
- `BoneMassRecord`
- `BasalMetabolicRateRecord`
- `HeartRateRecord`
- `SleepSessionRecord`
- `ActiveCaloriesBurnedRecord`
- `TotalCaloriesBurnedRecord`

## Comportamento da leitura atual

### `readTodayHealthData`

Periodo principal:

- Hoje 00:00 no timezone local ate agora.

Fallback para composicao corporal:

- Ultimos 30 dias ate agora.

Campos retornados para JS:

- `date`
- `weight`
- `bodyFat`
- `muscleMass`
- `bodyWaterMass`
- `boneMass`
- `bmr`
- `steps`
- `sleepHours`
- `avgHeartRate`
- `activeCalories`
- `totalCalories`
- `estimatedCalories`
- `importedFields`
- `missingFields`
- `source`
- `bodyCompositionWindowDays`

### `readHealthConnectDiagnostics`

Mostra, por tipo de dado:

- `key`
- `label`
- `found`
- `value`
- `unit`
- `lastSeenAt`
- `sourcePackage`
- `sourceName`
- `recordCount`

Esse diagnostico foi criado para diferenciar:

1. Permissao concedida, mas sem registro publicado.
2. Registro publicado e legivel pelo app.
3. Registro existente visualmente no Samsung Health, mas nao disponivel no Health Connect.

## Resultado real observado no celular

Depois dos testes no dispositivo Android:

Dados importados com sucesso:

- Peso
- Passos
- Frequencia cardiaca
- Calorias estimadas

Dados que ainda nao foram importados automaticamente:

- Gordura corporal
- Massa muscular/massa magra
- Agua corporal
- Gordura visceral
- Metabolismo basal
- Sono, em alguns testes
- Calorias ativas, em alguns testes

Observacao importante:

O Samsung Health e o Fitdays exibem dados completos de bioimpedancia, incluindo peso, IMC, gordura corporal, massa muscular, agua corporal, gordura visceral e TMB/BMR. Porem, o Health Connect so disponibilizou para o app os dados listados como importados acima.

Isso indica que permissao nao e o unico fator. O app so consegue ler tipos de registro que a fonte realmente publica no Health Connect.

## Evidencias dos testes

O usuario confirmou no celular que:

- Health Connect estava conectado.
- As permissoes apareciam como concedidas no app.
- O diagnostico encontrou apenas alguns tipos de dados.
- A importacao final trouxe peso, passos, frequencia cardiaca e calorias estimadas.

O usuario tambem mostrou telas do Samsung Health/Fitdays com dados completos, mas esses dados nao apareceram no diagnostico Health Connect.

## Hipotese tecnica atual

O Samsung Health pode estar recebendo/exibindo dados da balanca Fitdays internamente, mas nem todos os campos estao sendo publicados no Health Connect como registros padronizados.

Mesmo quando Samsung Health mostra "Body composition", isso nao garante que os dados foram publicados como:

- `BodyFatRecord`
- `LeanBodyMassRecord`
- `BodyWaterMassRecord`
- `BoneMassRecord`
- `BasalMetabolicRateRecord`

Tambem pode haver diferenca entre:

- Dados que o Samsung Health exibe.
- Dados que o Samsung Health sincroniza com Health Connect.
- Dados que Health Connect permite que apps terceiros leiam.

## Pontos ja investigados em documentacao

Documentacao consultada anteriormente:

- Android Health Connect:
  - Guia oficial de inicio: `https://developer.android.com/health-and-fitness/health-connect/get-started`
  - Tipos de dados: `https://developer.android.com/health-and-fitness/guides/health-connect/data-and-data-types/data-types`
- Samsung Developer:
  - Artigo sobre acesso a dados Samsung Health via Health Connect: `https://developer.samsung.com/health/blog/en/accessing-samsung-health-data-through-health-connect`
  - Documentacao Samsung Health Data/SDK em developer.samsung.com

Conclusao da pesquisa:

- Health Connect e a ponte oficial recomendada.
- Health Connect nao le dados internos do Samsung Health se eles nao forem publicados como registros Health Connect.
- Integracao direta com Samsung Health exigiria investigar Samsung Health Data SDK/API, possivelmente com permissoes, termos e/ou processo de aprovacao da Samsung.

## Possiveis caminhos para o proximo agente

### Caminho 1 - Confirmar publicacao no Health Connect

Antes de alterar codigo, verificar no aparelho:

1. Samsung Health > Configuracoes > Health Connect.
2. Verificar se Samsung Health tem permissao de escrita para composicao corporal.
3. Verificar se Fitdays consegue compartilhar com Health Connect diretamente ou apenas com Samsung Health/Google Fit.
4. Verificar no Health Connect > Dados e acesso > Medidas corporais se aparecem registros de:
   - Peso
   - Gordura corporal
   - Massa magra
   - Agua corporal
   - Massa ossea
   - Taxa metabolica basal

Se esses registros nao aparecem no Health Connect, o app nao conseguira le-los pela ponte atual.

### Caminho 2 - Melhorar diagnostico nativo

Adicionar detalhes extras ao diagnostico:

- Exibir periodo consultado por item.
- Exibir lista dos ultimos N registros por tipo, nao apenas o ultimo.
- Exibir `sourcePackage` para cada registro quando disponivel.
- Exibir mensagem clara quando ha permissao, mas nenhum registro.

Possivel novo metodo:

- `readRecentRecordsByType(type, days = 90)`

Isso ajudaria a confirmar se os dados estao com data antiga, fuso diferente ou origem inesperada.

### Caminho 3 - Investigar Samsung Health Data SDK/API

Se o objetivo for ler os dados completos que aparecem no Samsung Health, investigar:

- Samsung Health Data SDK para Android.
- Permissoes necessarias para:
  - peso
  - gordura corporal
  - massa muscular/esqueletica
  - agua corporal
  - gordura visceral
  - metabolismo basal
- Se a API e publica para apps pessoais ou exige aprovacao/parceria.
- Se e possivel usar dentro de um plugin Capacitor local junto com Health Connect.

Atencao: nao assumir que Samsung Health SDK esta liberado automaticamente. Pode haver limitacoes de distribuicao, assinatura, app approval ou consentimento extra.

### Caminho 4 - Investigar Fitdays

Verificar se Fitdays oferece:

- API publica.
- Exportacao CSV.
- Integracao direta com Health Connect.
- Integracao com Google Fit/Samsung Health que preserve bioimpedancia completa.

Se nao houver API, manter importacao assistida/manual pode ser o caminho mais realista.

## Regras para manter

- Nao quebrar check-in manual.
- Nao sobrescrever cintura e observacoes automaticamente.
- Nao enviar dados de saude para Gemini automaticamente.
- Nao hardcodar dados de teste no Android real.
- Nao implementar Bluetooth direto com a balanca sem decisao explicita.
- Nao implementar backend.
- Nao remover Health Connect, pois ele ja funciona parcialmente.

## Comandos de validacao usados

Build web:

```powershell
npm run build
```

Sync Capacitor:

```powershell
npx cap sync android
```

Build Android debug:

```powershell
$env:JAVA_HOME='C:\Program Files\Android\Android Studio\jbr'
$env:Path="$env:JAVA_HOME\bin;$env:Path"
cd android
.\gradlew.bat assembleDebug
```

Todos passaram apos as ultimas alteracoes.

## Estado Git no momento deste resumo

Ha alteracoes locais relacionadas a Health Connect ainda nao necessariamente commitadas/pushadas, incluindo:

- `android/app/src/main/AndroidManifest.xml`
- `android/app/src/main/java/br/com/leandro/evolucaofitness/HealthConnectPlugin.kt`
- `src/components/integrations/AssistedImportModal.jsx`
- `src/pages/Checkin.jsx`
- `src/pages/Integrations.jsx`
- `src/services/health/healthConnectNativeService.js`

Antes de continuar, rodar:

```powershell
git status --short
git diff
```

## Resumo executivo para continuidade

A integracao Health Connect esta operacional e importa peso, passos, frequencia cardiaca e calorias estimadas. Os dados faltantes de bioimpedancia aparecem no Samsung Health/Fitdays, mas nao foram publicados ou nao ficaram acessiveis no Health Connect durante os testes. O proximo passo nao deve ser tentativa aleatoria de codigo; deve ser confirmar a camada de origem/publicacao dos registros e, se necessario, investigar Samsung Health Data SDK ou alternativas Fitdays/exportacao.

## Atualizacao posterior - Samsung Health Data SDK

Foi iniciado o caminho de leitura direta pelo Samsung Health Data SDK.

Arquivos adicionados/alterados:

- `android/app/src/main/java/br/com/leandro/evolucaofitness/SamsungHealthDataPlugin.kt`
  - Plugin Capacitor local `SamsungHealthData`.
  - Metodos expostos:
    - `isAvailable`
    - `checkPermissions`
    - `requestPermissions`
    - `readLatestBodyComposition`
    - `readBodyCompositionHistory`
  - Le `DataTypes.BODY_COMPOSITION` dos ultimos 365 dias.
  - Campos mapeados: peso, altura, gordura corporal, massa gorda, massa livre de gordura, massa muscular/esqueletica, agua corporal, IMC e metabolismo basal.

- `src/services/health/samsungHealthDataService.js`
  - Wrapper JavaScript para o plugin nativo.
  - Normaliza o ultimo registro para o formato do Check-in.

- `src/pages/Checkin.jsx`
  - Quando a origem e `samsung_health`, tenta importar bioimpedancia pelo Samsung Health Data SDK.
  - Se falhar, a importacao assistida continua disponivel.

- `src/pages/Integrations.jsx`
  - Adiciona card de teste do Samsung Health Data SDK:
    - verificar disponibilidade
    - solicitar permissao de bioimpedancia
    - importar bioimpedancia

Configuracao Android:

- Dependencia local em `android/app/build.gradle`:
  - `implementation(name: 'samsung-health-data-api-1.1.0', ext: 'aar')`
- O AAR esperado e:
  - `android/app/libs/samsung-health-data-api-1.1.0.aar`
- `minSdkVersion` foi ajustado para `29`, pois o Samsung Health Data SDK exige Android 10+.

Observacoes importantes:

- O AAR e ignorado pelo Git por `android/.gitignore` (`*.aar`). Em outra maquina, o arquivo precisa ser recolocado manualmente.
- O acesso pode exigir Developer Mode no Samsung Health para teste local.
- Para distribuicao publica, pode exigir registro/aprovacao da Samsung com package name e assinatura.
- Gordura visceral nao apareceu como campo do `BODY_COMPOSITION` no AAR `1.1.0`; provavelmente continuara manual salvo se outro SDK/fonte expuser esse dado.

Validacao local apos adicionar o SDK:

```powershell
npm run build
$env:JAVA_HOME='C:\Program Files\Android\Android Studio\jbr'
$env:Path="$env:JAVA_HOME\bin;$env:Path"
cd android
.\gradlew.bat assembleDebug
```

O build Android passou depois de ajustar `minSdkVersion` para 29.
