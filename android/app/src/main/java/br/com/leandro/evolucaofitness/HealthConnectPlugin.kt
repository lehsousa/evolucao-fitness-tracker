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
import androidx.health.connect.client.records.HeartRateRecord
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
        val end = java.time.Instant.now()
        val range = TimeRangeFilter.between(start, end)
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

        val result = JSObject()
        result.put("date", LocalDate.now(zone).toString())
        result.put("weight", latestWeight(healthClient, range))
        result.put("bodyFat", latestBodyFat(healthClient, range))
        result.put("bmr", latestBmr(healthClient, range))
        result.put("steps", aggregate[StepsRecord.COUNT_TOTAL])
        result.put("sleepHours", aggregate[SleepSessionRecord.SLEEP_DURATION_TOTAL]?.let { roundOne(Duration.ofMillis(it.toMillis()).toMinutes() / 60.0) })
        result.put("avgHeartRate", aggregate[HeartRateRecord.BPM_AVG]?.toDouble()?.let { roundOne(it) })
        result.put("activeCalories", aggregate[ActiveCaloriesBurnedRecord.ACTIVE_CALORIES_TOTAL]?.inKilocalories?.let { roundOne(it) })
        result.put("totalCalories", aggregate[TotalCaloriesBurnedRecord.ENERGY_TOTAL]?.inKilocalories?.let { roundOne(it) })
        result.put("estimatedCalories", aggregate[TotalCaloriesBurnedRecord.ENERGY_TOTAL]?.inKilocalories?.let { roundOne(it) })
        result.put("source", "Health Connect")
        return result
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

    private fun permissionStatusJson(granted: Set<String>): JSObject {
        return JSObject()
            .put("steps", granted.contains(HealthPermission.getReadPermission(StepsRecord::class)))
            .put("weight", granted.contains(HealthPermission.getReadPermission(WeightRecord::class)))
            .put("bodyFat", granted.contains(HealthPermission.getReadPermission(BodyFatRecord::class)))
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

    private companion object {
        const val PROVIDER_PACKAGE = "com.google.android.apps.healthdata"

        val healthPermissions = setOf(
            HealthPermission.getReadPermission(StepsRecord::class),
            HealthPermission.getReadPermission(WeightRecord::class),
            HealthPermission.getReadPermission(BodyFatRecord::class),
            HealthPermission.getReadPermission(BasalMetabolicRateRecord::class),
            HealthPermission.getReadPermission(HeartRateRecord::class),
            HealthPermission.getReadPermission(SleepSessionRecord::class),
            HealthPermission.getReadPermission(ActiveCaloriesBurnedRecord::class),
            HealthPermission.getReadPermission(TotalCaloriesBurnedRecord::class),
        )
    }
}
