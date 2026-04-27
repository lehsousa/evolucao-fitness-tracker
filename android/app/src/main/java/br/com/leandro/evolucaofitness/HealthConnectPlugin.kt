package br.com.leandro.evolucaofitness

import android.content.ActivityNotFoundException
import android.content.Intent
import androidx.activity.result.ActivityResult
import androidx.health.connect.client.HealthConnectClient
import androidx.health.connect.client.PermissionController
import androidx.health.connect.client.permission.HealthPermission
import androidx.health.connect.client.records.ActiveCaloriesBurnedRecord
import androidx.health.connect.client.records.BasalMetabolicRateRecord
import androidx.health.connect.client.records.BodyFatRecord
import androidx.health.connect.client.records.BodyWaterMassRecord
import androidx.health.connect.client.records.BoneMassRecord
import androidx.health.connect.client.records.HeartRateRecord
import androidx.health.connect.client.records.LeanBodyMassRecord
import androidx.health.connect.client.records.SleepSessionRecord
import androidx.health.connect.client.records.StepsRecord
import androidx.health.connect.client.records.TotalCaloriesBurnedRecord
import androidx.health.connect.client.records.WeightRecord
import androidx.health.connect.client.request.AggregateRequest
import androidx.health.connect.client.request.ReadRecordsRequest
import androidx.health.connect.client.time.TimeRangeFilter
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.ActivityCallback
import com.getcapacitor.annotation.CapacitorPlugin
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import org.json.JSONArray
import java.time.Duration
import java.time.LocalDate
import java.time.ZoneId

@CapacitorPlugin(name = "HealthConnect")
class HealthConnectPlugin : Plugin() {
    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.Main)
    private val permissionContract = PermissionController.createRequestPermissionResultContract()

    @PluginMethod
    fun isAvailable(call: PluginCall) {
        val status = sdkStatus()
        val result = JSObject()
        when (status) {
            HealthConnectClient.SDK_AVAILABLE -> {
                result.put("available", true)
                result.put("status", "available")
                result.put("message", "Health Connect disponível")
            }
            HealthConnectClient.SDK_UNAVAILABLE_PROVIDER_UPDATE_REQUIRED -> {
                result.put("available", false)
                result.put("status", "update_required")
                result.put("message", "Health Connect precisa ser instalado ou atualizado")
            }
            else -> {
                result.put("available", false)
                result.put("status", "not_available")
                result.put("message", "Health Connect não está disponível neste dispositivo")
            }
        }
        call.resolve(result)
    }

    @PluginMethod
    override fun requestPermissions(call: PluginCall) {
        if (sdkStatus() != HealthConnectClient.SDK_AVAILABLE) {
            call.reject("Health Connect não está disponível neste dispositivo")
            return
        }

        try {
            val intent = permissionContract.createIntent(context, healthPermissions)
            startActivityForResult(call, intent, "permissionsResult")
        } catch (error: Exception) {
            call.reject(error.message ?: "Não foi possível solicitar permissões do Health Connect")
        }
    }

    @ActivityCallback
    fun permissionsResult(call: PluginCall, result: ActivityResult) {
        val granted = permissionContract.parseResult(result.resultCode, result.data)
        call.resolve(permissionStatusJson(granted))
    }

    @PluginMethod
    override fun checkPermissions(call: PluginCall) {
        if (sdkStatus() != HealthConnectClient.SDK_AVAILABLE) {
            call.resolve(permissionStatusJson(emptySet()))
            return
        }

        scope.launch {
            try {
                val granted = withContext(Dispatchers.IO) {
                    client().permissionController.getGrantedPermissions()
                }
                call.resolve(permissionStatusJson(granted))
            } catch (error: Exception) {
                call.reject(error.message ?: "Erro ao verificar permissões do Health Connect")
            }
        }
    }

    @PluginMethod
    fun readTodayHealthData(call: PluginCall) {
        if (sdkStatus() != HealthConnectClient.SDK_AVAILABLE) {
            call.reject("Health Connect não está disponível neste dispositivo")
            return
        }

        scope.launch {
            try {
                val data = withContext(Dispatchers.IO) { readToday() }
                call.resolve(data)
            } catch (error: SecurityException) {
                call.reject("Permissões do Health Connect pendentes")
            } catch (error: Exception) {
                call.reject(error.message ?: "Não foi possível ler dados do Health Connect")
            }
        }
    }

    @PluginMethod
    fun readHealthConnectDiagnostics(call: PluginCall) {
        if (sdkStatus() != HealthConnectClient.SDK_AVAILABLE) {
            call.reject("Health Connect nao esta disponivel neste dispositivo")
            return
        }

        scope.launch {
            try {
                val data = withContext(Dispatchers.IO) { readDiagnostics() }
                call.resolve(data)
            } catch (error: SecurityException) {
                call.reject("Permissoes do Health Connect pendentes")
            } catch (error: Exception) {
                call.reject(error.message ?: "Nao foi possivel diagnosticar dados do Health Connect")
            }
        }
    }

    @PluginMethod
    fun readEnhancedDiagnostics(call: PluginCall) {
        if (sdkStatus() != HealthConnectClient.SDK_AVAILABLE) {
            call.reject("Health Connect nao esta disponivel neste dispositivo")
            return
        }

        scope.launch {
            try {
                val data = withContext(Dispatchers.IO) { readEnhancedDiagnosticsData() }
                call.resolve(data)
            } catch (error: SecurityException) {
                call.reject("Permissoes do Health Connect pendentes")
            } catch (error: Exception) {
                call.reject(error.message ?: "Nao foi possivel executar o diagnostico avancado")
            }
        }
    }

    @PluginMethod
    fun openHealthConnectSettings(call: PluginCall) {
        try {
            val intent = Intent(HealthConnectClient.ACTION_HEALTH_CONNECT_SETTINGS)
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            context.startActivity(intent)
            call.resolve(JSObject().put("opened", true))
        } catch (error: ActivityNotFoundException) {
            call.reject("Configurações do Health Connect não encontradas")
        } catch (error: Exception) {
            call.reject(error.message ?: "Não foi possível abrir o Health Connect")
        }
    }

    private suspend fun readToday(): JSObject {
        val zone = ZoneId.systemDefault()
        val start = LocalDate.now(zone).atStartOfDay(zone).toInstant()
        val recentStart = LocalDate.now(zone).minusDays(30).atStartOfDay(zone).toInstant()
        val end = java.time.Instant.now()
        val range = TimeRangeFilter.between(start, end)
        val recentRange = TimeRangeFilter.between(recentStart, end)
        val healthClient = client()

        val aggregate = healthClient.aggregate(
            AggregateRequest(
                metrics = setOf(
                    StepsRecord.COUNT_TOTAL,
                    SleepSessionRecord.SLEEP_DURATION_TOTAL,
                    HeartRateRecord.BPM_AVG,
                    ActiveCaloriesBurnedRecord.ACTIVE_CALORIES_TOTAL,
                    TotalCaloriesBurnedRecord.ENERGY_TOTAL,
                ),
                timeRangeFilter = range,
            )
        )

        val weight = safeRead { latestWeight(healthClient, range) } ?: safeRead { latestWeight(healthClient, recentRange) }
        val bodyFat = safeRead { latestBodyFat(healthClient, range) } ?: safeRead { latestBodyFat(healthClient, recentRange) }
        val muscleMass = safeRead { latestLeanBodyMass(healthClient, range) } ?: safeRead { latestLeanBodyMass(healthClient, recentRange) }
        val bodyWaterMass = safeRead { latestBodyWaterMass(healthClient, range) } ?: safeRead { latestBodyWaterMass(healthClient, recentRange) }
        val boneMass = safeRead { latestBoneMass(healthClient, range) } ?: safeRead { latestBoneMass(healthClient, recentRange) }
        val bmr = safeRead { latestBmr(healthClient, range) } ?: safeRead { latestBmr(healthClient, recentRange) }
        val steps = aggregate[StepsRecord.COUNT_TOTAL] ?: safeRead { sumSteps(healthClient, range) }
        val sleepHours = aggregate[SleepSessionRecord.SLEEP_DURATION_TOTAL]
            ?.let { roundOne(Duration.ofMillis(it.toMillis()).toMinutes() / 60.0) }
            ?: safeRead { sumSleepHours(healthClient, range) }
        val avgHeartRate = aggregate[HeartRateRecord.BPM_AVG]
            ?.toDouble()
            ?.let { roundOne(it) }
            ?: safeRead { averageHeartRate(healthClient, range) }
        val activeCalories = aggregate[ActiveCaloriesBurnedRecord.ACTIVE_CALORIES_TOTAL]
            ?.inKilocalories
            ?.let { roundOne(it) }
            ?: safeRead { sumActiveCalories(healthClient, range) }
        val totalCalories = aggregate[TotalCaloriesBurnedRecord.ENERGY_TOTAL]
            ?.inKilocalories
            ?.let { roundOne(it) }
            ?: safeRead { sumTotalCalories(healthClient, range) }
        val estimatedCalories = totalCalories ?: activeCalories
        val values = mapOf(
            "weight" to weight,
            "bodyFat" to bodyFat,
            "muscleMass" to muscleMass,
            "bodyWaterMass" to bodyWaterMass,
            "boneMass" to boneMass,
            "bmr" to bmr,
            "steps" to steps,
            "sleepHours" to sleepHours,
            "avgHeartRate" to avgHeartRate,
            "activeCalories" to activeCalories,
            "totalCalories" to totalCalories,
            "estimatedCalories" to estimatedCalories,
        )

        val result = JSObject()
        result.put("date", LocalDate.now(zone).toString())
        result.put("weight", weight)
        result.put("bodyFat", bodyFat)
        result.put("muscleMass", muscleMass)
        result.put("bodyWaterMass", bodyWaterMass)
        result.put("boneMass", boneMass)
        result.put("bmr", bmr)
        result.put("steps", steps)
        result.put("sleepHours", sleepHours)
        result.put("avgHeartRate", avgHeartRate)
        result.put("activeCalories", activeCalories)
        result.put("totalCalories", totalCalories)
        result.put("estimatedCalories", estimatedCalories)
        result.put("importedFields", JSONArray(values.filterValues { it != null }.keys))
        result.put("missingFields", JSONArray(values.filterValues { it == null }.keys))
        result.put("source", "Health Connect")
        result.put("bodyCompositionWindowDays", 30)
        return result
    }

    private suspend fun readDiagnostics(): JSObject {
        val zone = ZoneId.systemDefault()
        val todayStart = LocalDate.now(zone).atStartOfDay(zone).toInstant()
        val recentStart = LocalDate.now(zone).minusDays(30).atStartOfDay(zone).toInstant()
        val end = java.time.Instant.now()
        val todayRange = TimeRangeFilter.between(todayStart, end)
        val recentRange = TimeRangeFilter.between(recentStart, end)
        val healthClient = client()

        val records = JSONArray()
        records.put(safeDiagnostic { diagnoseSteps(healthClient, todayRange) } ?: missingDiagnostic("steps", "Passos", "passos"))
        records.put(safeDiagnostic { diagnoseWeight(healthClient, recentRange) } ?: missingDiagnostic("weight", "Peso", "kg"))
        records.put(safeDiagnostic { diagnoseBodyFat(healthClient, recentRange) } ?: missingDiagnostic("bodyFat", "Gordura corporal", "%"))
        records.put(safeDiagnostic { diagnoseLeanBodyMass(healthClient, recentRange) } ?: missingDiagnostic("muscleMass", "Massa magra", "kg"))
        records.put(safeDiagnostic { diagnoseBodyWaterMass(healthClient, recentRange) } ?: missingDiagnostic("bodyWaterMass", "Agua corporal", "kg"))
        records.put(safeDiagnostic { diagnoseBoneMass(healthClient, recentRange) } ?: missingDiagnostic("boneMass", "Massa ossea", "kg"))
        records.put(safeDiagnostic { diagnoseBmr(healthClient, recentRange) } ?: missingDiagnostic("bmr", "Metabolismo basal", "kcal/dia"))
        records.put(safeDiagnostic { diagnoseSleep(healthClient, todayRange) } ?: missingDiagnostic("sleepHours", "Sono", "h"))
        records.put(safeDiagnostic { diagnoseHeartRate(healthClient, todayRange) } ?: missingDiagnostic("avgHeartRate", "Frequencia cardiaca", "bpm"))
        records.put(safeDiagnostic { diagnoseActiveCalories(healthClient, todayRange) } ?: missingDiagnostic("activeCalories", "Calorias ativas", "kcal"))
        records.put(safeDiagnostic { diagnoseTotalCalories(healthClient, todayRange) } ?: missingDiagnostic("totalCalories", "Calorias totais", "kcal"))

        return JSObject()
            .put("generatedAt", java.time.Instant.now().toString())
            .put("today", LocalDate.now(zone).toString())
            .put("recentWindowDays", 30)
            .put("records", records)
    }

    private suspend fun readEnhancedDiagnosticsData(): JSObject {
        val zone = ZoneId.systemDefault()
        val start = LocalDate.now(zone).minusDays(90).atStartOfDay(zone).toInstant()
        val end = java.time.Instant.now()
        val range = TimeRangeFilter.between(start, end)
        val healthClient = client()

        val diagnostics = JSONArray()
        diagnostics.put(safeEnhancedDiagnostic { enhancedWeight(healthClient, range) } ?: enhancedError("weight", "Peso", null))
        diagnostics.put(safeEnhancedDiagnostic { enhancedBodyFat(healthClient, range) } ?: enhancedError("bodyFat", "Gordura corporal", null))
        diagnostics.put(safeEnhancedDiagnostic { enhancedLeanBodyMass(healthClient, range) } ?: enhancedError("leanBodyMass", "Massa magra", null))
        diagnostics.put(safeEnhancedDiagnostic { enhancedBodyWaterMass(healthClient, range) } ?: enhancedError("bodyWaterMass", "Agua corporal", null))
        diagnostics.put(safeEnhancedDiagnostic { enhancedBoneMass(healthClient, range) } ?: enhancedError("boneMass", "Massa ossea", null))
        diagnostics.put(safeEnhancedDiagnostic { enhancedBmr(healthClient, range) } ?: enhancedError("basalMetabolicRate", "Metabolismo basal", null))
        diagnostics.put(safeEnhancedDiagnostic { enhancedSteps(healthClient, range) } ?: enhancedError("steps", "Passos", null))
        diagnostics.put(safeEnhancedDiagnostic { enhancedHeartRate(healthClient, range) } ?: enhancedError("heartRate", "Frequencia cardiaca", null))
        diagnostics.put(safeEnhancedDiagnostic { enhancedSleep(healthClient, range) } ?: enhancedError("sleep", "Sono", null))
        diagnostics.put(safeEnhancedDiagnostic { enhancedActiveCalories(healthClient, range) } ?: enhancedError("activeCalories", "Calorias ativas", null))
        diagnostics.put(safeEnhancedDiagnostic { enhancedTotalCalories(healthClient, range) } ?: enhancedError("totalCalories", "Calorias totais", null))

        return JSObject()
            .put("diagnostics", diagnostics)
            .put("queryPeriod", "Ultimos 90 dias")
            .put("queryPeriodDays", 90)
            .put("generatedAt", java.time.Instant.now().toString())
    }

    private suspend fun enhancedWeight(healthClient: HealthConnectClient, range: TimeRangeFilter): JSObject {
        val records = healthClient.readRecords(ReadRecordsRequest(WeightRecord::class, timeRangeFilter = range)).records
        val items = records.sortedByDescending { it.time }.take(10).map {
            enhancedRecord(it.time.toString(), it.weight.inKilograms, "kg", it.metadata.dataOrigin.packageName)
        }
        return enhancedResult("weight", "Peso", records.size, items)
    }

    private suspend fun enhancedBodyFat(healthClient: HealthConnectClient, range: TimeRangeFilter): JSObject {
        val records = healthClient.readRecords(ReadRecordsRequest(BodyFatRecord::class, timeRangeFilter = range)).records
        val items = records.sortedByDescending { it.time }.take(10).map {
            enhancedRecord(it.time.toString(), it.percentage.value, "%", it.metadata.dataOrigin.packageName)
        }
        return enhancedResult("bodyFat", "Gordura corporal", records.size, items)
    }

    private suspend fun enhancedLeanBodyMass(healthClient: HealthConnectClient, range: TimeRangeFilter): JSObject {
        val records = healthClient.readRecords(ReadRecordsRequest(LeanBodyMassRecord::class, timeRangeFilter = range)).records
        val items = records.sortedByDescending { it.time }.take(10).map {
            enhancedRecord(it.time.toString(), it.mass.inKilograms, "kg", it.metadata.dataOrigin.packageName)
        }
        return enhancedResult("leanBodyMass", "Massa magra", records.size, items)
    }

    private suspend fun enhancedBodyWaterMass(healthClient: HealthConnectClient, range: TimeRangeFilter): JSObject {
        val records = healthClient.readRecords(ReadRecordsRequest(BodyWaterMassRecord::class, timeRangeFilter = range)).records
        val items = records.sortedByDescending { it.time }.take(10).map {
            enhancedRecord(it.time.toString(), it.mass.inKilograms, "kg", it.metadata.dataOrigin.packageName)
        }
        return enhancedResult("bodyWaterMass", "Agua corporal", records.size, items)
    }

    private suspend fun enhancedBoneMass(healthClient: HealthConnectClient, range: TimeRangeFilter): JSObject {
        val records = healthClient.readRecords(ReadRecordsRequest(BoneMassRecord::class, timeRangeFilter = range)).records
        val items = records.sortedByDescending { it.time }.take(10).map {
            enhancedRecord(it.time.toString(), it.mass.inKilograms, "kg", it.metadata.dataOrigin.packageName)
        }
        return enhancedResult("boneMass", "Massa ossea", records.size, items)
    }

    private suspend fun enhancedBmr(healthClient: HealthConnectClient, range: TimeRangeFilter): JSObject {
        val records = healthClient.readRecords(ReadRecordsRequest(BasalMetabolicRateRecord::class, timeRangeFilter = range)).records
        val items = records.sortedByDescending { it.time }.take(10).map {
            enhancedRecord(it.time.toString(), it.basalMetabolicRate.inKilocaloriesPerDay, "kcal/dia", it.metadata.dataOrigin.packageName)
        }
        return enhancedResult("basalMetabolicRate", "Metabolismo basal", records.size, items)
    }

    private suspend fun enhancedSteps(healthClient: HealthConnectClient, range: TimeRangeFilter): JSObject {
        val records = healthClient.readRecords(ReadRecordsRequest(StepsRecord::class, timeRangeFilter = range)).records
        val items = records.sortedByDescending { it.endTime }.take(10).map {
            enhancedRecord(it.endTime.toString(), it.count, "passos", it.metadata.dataOrigin.packageName)
                .put("startTime", it.startTime.toString())
        }
        return enhancedResult("steps", "Passos", records.size, items)
    }

    private suspend fun enhancedHeartRate(healthClient: HealthConnectClient, range: TimeRangeFilter): JSObject {
        val records = healthClient.readRecords(ReadRecordsRequest(HeartRateRecord::class, timeRangeFilter = range)).records
        val items = records.sortedByDescending { it.endTime }.take(10).map {
            val samples = it.samples.map { sample -> sample.beatsPerMinute }
            enhancedRecord(it.endTime.toString(), samples.takeIf { values -> values.isNotEmpty() }?.average()?.let { value -> roundOne(value) }, "bpm", it.metadata.dataOrigin.packageName)
                .put("startTime", it.startTime.toString())
                .put("samples", samples.size)
        }
        return enhancedResult("heartRate", "Frequencia cardiaca", records.size, items)
    }

    private suspend fun enhancedSleep(healthClient: HealthConnectClient, range: TimeRangeFilter): JSObject {
        val records = healthClient.readRecords(ReadRecordsRequest(SleepSessionRecord::class, timeRangeFilter = range)).records
        val items = records.sortedByDescending { it.endTime }.take(10).map {
            enhancedRecord(it.endTime.toString(), roundOne(Duration.between(it.startTime, it.endTime).toMinutes() / 60.0), "h", it.metadata.dataOrigin.packageName)
                .put("startTime", it.startTime.toString())
        }
        return enhancedResult("sleep", "Sono", records.size, items)
    }

    private suspend fun enhancedActiveCalories(healthClient: HealthConnectClient, range: TimeRangeFilter): JSObject {
        val records = healthClient.readRecords(ReadRecordsRequest(ActiveCaloriesBurnedRecord::class, timeRangeFilter = range)).records
        val items = records.sortedByDescending { it.endTime }.take(10).map {
            enhancedRecord(it.endTime.toString(), roundOne(it.energy.inKilocalories), "kcal", it.metadata.dataOrigin.packageName)
                .put("startTime", it.startTime.toString())
        }
        return enhancedResult("activeCalories", "Calorias ativas", records.size, items)
    }

    private suspend fun enhancedTotalCalories(healthClient: HealthConnectClient, range: TimeRangeFilter): JSObject {
        val records = healthClient.readRecords(ReadRecordsRequest(TotalCaloriesBurnedRecord::class, timeRangeFilter = range)).records
        val items = records.sortedByDescending { it.endTime }.take(10).map {
            enhancedRecord(it.endTime.toString(), roundOne(it.energy.inKilocalories), "kcal", it.metadata.dataOrigin.packageName)
                .put("startTime", it.startTime.toString())
        }
        return enhancedResult("totalCalories", "Calorias totais", records.size, items)
    }

    private suspend fun safeEnhancedDiagnostic(block: suspend () -> JSObject): JSObject? {
        return try {
            block()
        } catch (error: Exception) {
            null
        }
    }

    private fun enhancedResult(type: String, label: String, totalRecords: Int, records: List<JSObject>): JSObject {
        val recordsArray = JSONArray()
        records.forEach { recordsArray.put(it) }
        return JSObject()
            .put("type", type)
            .put("label", label)
            .put("totalRecords", totalRecords)
            .put("hasData", records.isNotEmpty())
            .put("records", recordsArray)
            .put("latestTimestamp", records.firstOrNull()?.getString("timestamp"))
            .put("latestSource", records.firstOrNull()?.getString("sourcePackage"))
    }

    private fun enhancedRecord(timestamp: String, value: Any?, unit: String, sourcePackage: String?): JSObject {
        return JSObject()
            .put("timestamp", timestamp)
            .put("value", value)
            .put("unit", unit)
            .put("sourcePackage", sourcePackage)
            .put("sourceName", appLabel(sourcePackage))
    }

    private fun enhancedError(type: String, label: String, message: String?): JSObject {
        return JSObject()
            .put("type", type)
            .put("label", label)
            .put("totalRecords", 0)
            .put("hasData", false)
            .put("error", message ?: "Sem acesso ou sem registros")
            .put("records", JSONArray())
    }

    private suspend fun diagnoseSteps(healthClient: HealthConnectClient, range: TimeRangeFilter): JSObject {
        val records = healthClient.readRecords(ReadRecordsRequest(StepsRecord::class, timeRangeFilter = range)).records
        val latest = records.maxByOrNull { it.endTime }
        val total = records.sumOf { it.count }.takeIf { it > 0 }
        return diagnosticResult("steps", "Passos", total, "passos", latest?.endTime?.toString(), latest?.metadata?.dataOrigin?.packageName, records.size)
    }

    private suspend fun diagnoseWeight(healthClient: HealthConnectClient, range: TimeRangeFilter): JSObject {
        val records = healthClient.readRecords(ReadRecordsRequest(WeightRecord::class, timeRangeFilter = range)).records
        val latest = records.maxByOrNull { it.time }
        return diagnosticResult("weight", "Peso", latest?.weight?.inKilograms?.let { roundOne(it) }, "kg", latest?.time?.toString(), latest?.metadata?.dataOrigin?.packageName, records.size)
    }

    private suspend fun diagnoseBodyFat(healthClient: HealthConnectClient, range: TimeRangeFilter): JSObject {
        val records = healthClient.readRecords(ReadRecordsRequest(BodyFatRecord::class, timeRangeFilter = range)).records
        val latest = records.maxByOrNull { it.time }
        return diagnosticResult("bodyFat", "Gordura corporal", latest?.percentage?.value?.let { roundOne(it) }, "%", latest?.time?.toString(), latest?.metadata?.dataOrigin?.packageName, records.size)
    }

    private suspend fun diagnoseLeanBodyMass(healthClient: HealthConnectClient, range: TimeRangeFilter): JSObject {
        val records = healthClient.readRecords(ReadRecordsRequest(LeanBodyMassRecord::class, timeRangeFilter = range)).records
        val latest = records.maxByOrNull { it.time }
        return diagnosticResult("muscleMass", "Massa magra", latest?.mass?.inKilograms?.let { roundOne(it) }, "kg", latest?.time?.toString(), latest?.metadata?.dataOrigin?.packageName, records.size)
    }

    private suspend fun diagnoseBodyWaterMass(healthClient: HealthConnectClient, range: TimeRangeFilter): JSObject {
        val records = healthClient.readRecords(ReadRecordsRequest(BodyWaterMassRecord::class, timeRangeFilter = range)).records
        val latest = records.maxByOrNull { it.time }
        return diagnosticResult("bodyWaterMass", "Agua corporal", latest?.mass?.inKilograms?.let { roundOne(it) }, "kg", latest?.time?.toString(), latest?.metadata?.dataOrigin?.packageName, records.size)
    }

    private suspend fun diagnoseBoneMass(healthClient: HealthConnectClient, range: TimeRangeFilter): JSObject {
        val records = healthClient.readRecords(ReadRecordsRequest(BoneMassRecord::class, timeRangeFilter = range)).records
        val latest = records.maxByOrNull { it.time }
        return diagnosticResult("boneMass", "Massa ossea", latest?.mass?.inKilograms?.let { roundOne(it) }, "kg", latest?.time?.toString(), latest?.metadata?.dataOrigin?.packageName, records.size)
    }

    private suspend fun diagnoseBmr(healthClient: HealthConnectClient, range: TimeRangeFilter): JSObject {
        val records = healthClient.readRecords(ReadRecordsRequest(BasalMetabolicRateRecord::class, timeRangeFilter = range)).records
        val latest = records.maxByOrNull { it.time }
        return diagnosticResult("bmr", "Metabolismo basal", latest?.basalMetabolicRate?.inKilocaloriesPerDay?.let { roundOne(it) }, "kcal/dia", latest?.time?.toString(), latest?.metadata?.dataOrigin?.packageName, records.size)
    }

    private suspend fun diagnoseSleep(healthClient: HealthConnectClient, range: TimeRangeFilter): JSObject {
        val records = healthClient.readRecords(ReadRecordsRequest(SleepSessionRecord::class, timeRangeFilter = range)).records
        val latest = records.maxByOrNull { it.endTime }
        val minutes = records.sumOf { Duration.between(it.startTime, it.endTime).toMinutes() }.takeIf { it > 0 }
        return diagnosticResult("sleepHours", "Sono", minutes?.let { roundOne(it / 60.0) }, "h", latest?.endTime?.toString(), latest?.metadata?.dataOrigin?.packageName, records.size)
    }

    private suspend fun diagnoseHeartRate(healthClient: HealthConnectClient, range: TimeRangeFilter): JSObject {
        val records = healthClient.readRecords(ReadRecordsRequest(HeartRateRecord::class, timeRangeFilter = range)).records
        val latest = records.maxByOrNull { it.endTime }
        val samples = records.flatMap { it.samples }.map { it.beatsPerMinute }
        return diagnosticResult("avgHeartRate", "Frequencia cardiaca", samples.takeIf { it.isNotEmpty() }?.average()?.let { roundOne(it) }, "bpm", latest?.endTime?.toString(), latest?.metadata?.dataOrigin?.packageName, records.size)
    }

    private suspend fun diagnoseActiveCalories(healthClient: HealthConnectClient, range: TimeRangeFilter): JSObject {
        val records = healthClient.readRecords(ReadRecordsRequest(ActiveCaloriesBurnedRecord::class, timeRangeFilter = range)).records
        val latest = records.maxByOrNull { it.endTime }
        val total = records.sumOf { it.energy.inKilocalories }.takeIf { it > 0 }
        return diagnosticResult("activeCalories", "Calorias ativas", total?.let { roundOne(it) }, "kcal", latest?.endTime?.toString(), latest?.metadata?.dataOrigin?.packageName, records.size)
    }

    private suspend fun diagnoseTotalCalories(healthClient: HealthConnectClient, range: TimeRangeFilter): JSObject {
        val records = healthClient.readRecords(ReadRecordsRequest(TotalCaloriesBurnedRecord::class, timeRangeFilter = range)).records
        val latest = records.maxByOrNull { it.endTime }
        val total = records.sumOf { it.energy.inKilocalories }.takeIf { it > 0 }
        return diagnosticResult("totalCalories", "Calorias totais", total?.let { roundOne(it) }, "kcal", latest?.endTime?.toString(), latest?.metadata?.dataOrigin?.packageName, records.size)
    }

    private suspend fun safeDiagnostic(block: suspend () -> JSObject): JSObject? {
        return try {
            block()
        } catch (_: Exception) {
            null
        }
    }

    private fun diagnosticResult(
        key: String,
        label: String,
        value: Any?,
        unit: String,
        lastSeenAt: String?,
        sourcePackage: String?,
        recordCount: Int,
    ): JSObject {
        return JSObject()
            .put("key", key)
            .put("label", label)
            .put("found", value != null)
            .put("value", value)
            .put("unit", unit)
            .put("lastSeenAt", lastSeenAt)
            .put("sourcePackage", sourcePackage)
            .put("sourceName", sourceName(sourcePackage))
            .put("recordCount", recordCount)
    }

    private fun missingDiagnostic(key: String, label: String, unit: String): JSObject {
        return diagnosticResult(key, label, null, unit, null, null, 0)
    }

    private suspend fun latestWeight(healthClient: HealthConnectClient, range: TimeRangeFilter): Double? {
        return healthClient.readRecords(ReadRecordsRequest(WeightRecord::class, timeRangeFilter = range))
            .records
            .maxByOrNull { it.time }
            ?.weight
            ?.inKilograms
            ?.let { roundOne(it) }
    }

    private suspend fun latestBodyFat(healthClient: HealthConnectClient, range: TimeRangeFilter): Double? {
        return healthClient.readRecords(ReadRecordsRequest(BodyFatRecord::class, timeRangeFilter = range))
            .records
            .maxByOrNull { it.time }
            ?.percentage
            ?.value
            ?.let { roundOne(it) }
    }

    private suspend fun latestBmr(healthClient: HealthConnectClient, range: TimeRangeFilter): Double? {
        return healthClient.readRecords(ReadRecordsRequest(BasalMetabolicRateRecord::class, timeRangeFilter = range))
            .records
            .maxByOrNull { it.time }
            ?.basalMetabolicRate
            ?.inKilocaloriesPerDay
            ?.let { roundOne(it) }
    }

    private suspend fun latestLeanBodyMass(healthClient: HealthConnectClient, range: TimeRangeFilter): Double? {
        return healthClient.readRecords(ReadRecordsRequest(LeanBodyMassRecord::class, timeRangeFilter = range))
            .records
            .maxByOrNull { it.time }
            ?.mass
            ?.inKilograms
            ?.let { roundOne(it) }
    }

    private suspend fun latestBodyWaterMass(healthClient: HealthConnectClient, range: TimeRangeFilter): Double? {
        return healthClient.readRecords(ReadRecordsRequest(BodyWaterMassRecord::class, timeRangeFilter = range))
            .records
            .maxByOrNull { it.time }
            ?.mass
            ?.inKilograms
            ?.let { roundOne(it) }
    }

    private suspend fun latestBoneMass(healthClient: HealthConnectClient, range: TimeRangeFilter): Double? {
        return healthClient.readRecords(ReadRecordsRequest(BoneMassRecord::class, timeRangeFilter = range))
            .records
            .maxByOrNull { it.time }
            ?.mass
            ?.inKilograms
            ?.let { roundOne(it) }
    }

    private suspend fun sumSteps(healthClient: HealthConnectClient, range: TimeRangeFilter): Long? {
        val total = healthClient.readRecords(ReadRecordsRequest(StepsRecord::class, timeRangeFilter = range))
            .records
            .sumOf { it.count }
        return total.takeIf { it > 0 }
    }

    private suspend fun sumSleepHours(healthClient: HealthConnectClient, range: TimeRangeFilter): Double? {
        val minutes = healthClient.readRecords(ReadRecordsRequest(SleepSessionRecord::class, timeRangeFilter = range))
            .records
            .sumOf { Duration.between(it.startTime, it.endTime).toMinutes() }
        return minutes.takeIf { it > 0 }?.let { roundOne(it / 60.0) }
    }

    private suspend fun averageHeartRate(healthClient: HealthConnectClient, range: TimeRangeFilter): Double? {
        val samples = healthClient.readRecords(ReadRecordsRequest(HeartRateRecord::class, timeRangeFilter = range))
            .records
            .flatMap { it.samples }
            .map { it.beatsPerMinute }
        if (samples.isEmpty()) return null
        return roundOne(samples.average())
    }

    private suspend fun sumActiveCalories(healthClient: HealthConnectClient, range: TimeRangeFilter): Double? {
        val total = healthClient.readRecords(ReadRecordsRequest(ActiveCaloriesBurnedRecord::class, timeRangeFilter = range))
            .records
            .sumOf { it.energy.inKilocalories }
        return total.takeIf { it > 0 }?.let { roundOne(it) }
    }

    private suspend fun sumTotalCalories(healthClient: HealthConnectClient, range: TimeRangeFilter): Double? {
        val total = healthClient.readRecords(ReadRecordsRequest(TotalCaloriesBurnedRecord::class, timeRangeFilter = range))
            .records
            .sumOf { it.energy.inKilocalories }
        return total.takeIf { it > 0 }?.let { roundOne(it) }
    }

    private suspend fun <T> safeRead(block: suspend () -> T?): T? {
        return try {
            block()
        } catch (_: Exception) {
            null
        }
    }

    private fun permissionStatusJson(granted: Set<String>): JSObject {
        return JSObject()
            .put("steps", granted.contains(HealthPermission.getReadPermission(StepsRecord::class)))
            .put("weight", granted.contains(HealthPermission.getReadPermission(WeightRecord::class)))
            .put("bodyFat", granted.contains(HealthPermission.getReadPermission(BodyFatRecord::class)))
            .put("muscleMass", granted.contains(HealthPermission.getReadPermission(LeanBodyMassRecord::class)))
            .put("bodyWaterMass", granted.contains(HealthPermission.getReadPermission(BodyWaterMassRecord::class)))
            .put("boneMass", granted.contains(HealthPermission.getReadPermission(BoneMassRecord::class)))
            .put("bmr", granted.contains(HealthPermission.getReadPermission(BasalMetabolicRateRecord::class)))
            .put("heartRate", granted.contains(HealthPermission.getReadPermission(HeartRateRecord::class)))
            .put("sleep", granted.contains(HealthPermission.getReadPermission(SleepSessionRecord::class)))
            .put("activeCalories", granted.contains(HealthPermission.getReadPermission(ActiveCaloriesBurnedRecord::class)))
            .put("totalCalories", granted.contains(HealthPermission.getReadPermission(TotalCaloriesBurnedRecord::class)))
    }

    private fun sdkStatus(): Int {
        return HealthConnectClient.getSdkStatus(context, PROVIDER_PACKAGE)
    }

    private fun client(): HealthConnectClient {
        return HealthConnectClient.getOrCreate(context, PROVIDER_PACKAGE)
    }

    private fun roundOne(value: Double): Double {
        return kotlin.math.round(value * 10.0) / 10.0
    }

    private fun sourceName(sourcePackage: String?): String? {
        return when (sourcePackage) {
            "com.sec.android.app.shealth" -> "Samsung Health"
            "com.google.android.apps.fitness" -> "Google Fit"
            "com.google.android.apps.healthdata" -> "Health Connect"
            null -> null
            else -> sourcePackage
        }
    }

    private fun appLabel(sourcePackage: String?): String? {
        if (sourcePackage == null) return null
        return try {
            val appInfo = context.packageManager.getApplicationInfo(sourcePackage, 0)
            context.packageManager.getApplicationLabel(appInfo).toString()
        } catch (_: Exception) {
            sourceName(sourcePackage)
        }
    }

    private companion object {
        const val PROVIDER_PACKAGE = "com.google.android.apps.healthdata"

        val healthPermissions = setOf(
            HealthPermission.getReadPermission(StepsRecord::class),
            HealthPermission.getReadPermission(WeightRecord::class),
            HealthPermission.getReadPermission(BodyFatRecord::class),
            HealthPermission.getReadPermission(LeanBodyMassRecord::class),
            HealthPermission.getReadPermission(BodyWaterMassRecord::class),
            HealthPermission.getReadPermission(BoneMassRecord::class),
            HealthPermission.getReadPermission(BasalMetabolicRateRecord::class),
            HealthPermission.getReadPermission(HeartRateRecord::class),
            HealthPermission.getReadPermission(SleepSessionRecord::class),
            HealthPermission.getReadPermission(ActiveCaloriesBurnedRecord::class),
            HealthPermission.getReadPermission(TotalCaloriesBurnedRecord::class),
        )
    }
}
