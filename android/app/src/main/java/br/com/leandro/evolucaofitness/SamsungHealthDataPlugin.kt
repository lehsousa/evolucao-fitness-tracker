package br.com.leandro.evolucaofitness

import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import com.samsung.android.sdk.health.data.HealthDataService
import com.samsung.android.sdk.health.data.data.Field
import com.samsung.android.sdk.health.data.data.HealthDataPoint
import com.samsung.android.sdk.health.data.error.AuthorizationException
import com.samsung.android.sdk.health.data.error.HealthDataException
import com.samsung.android.sdk.health.data.error.ResolvablePlatformException
import com.samsung.android.sdk.health.data.permission.AccessType
import com.samsung.android.sdk.health.data.permission.Permission
import com.samsung.android.sdk.health.data.request.DataType
import com.samsung.android.sdk.health.data.request.DataTypes
import com.samsung.android.sdk.health.data.request.LocalTimeFilter
import com.samsung.android.sdk.health.data.request.Ordering
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import org.json.JSONArray
import java.time.LocalDateTime

@CapacitorPlugin(name = "SamsungHealthData")
class SamsungHealthDataPlugin : Plugin() {
    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.Main)

    @PluginMethod
    fun isAvailable(call: PluginCall) {
        scope.launch {
            try {
                withContext(Dispatchers.IO) {
                    HealthDataService.getStore(context)
                }
                call.resolve(
                    JSObject()
                        .put("available", true)
                        .put("status", "available")
                        .put("message", "Samsung Health Data SDK disponivel")
                )
            } catch (error: HealthDataException) {
                call.resolve(
                    JSObject()
                        .put("available", false)
                        .put("status", statusFromHealthError(error))
                        .put("message", healthErrorMessage(error))
                        .put("errorCode", error.errorCode)
                )
            } catch (error: Exception) {
                call.resolve(
                    JSObject()
                        .put("available", false)
                        .put("status", "error")
                        .put("message", error.message ?: "Nao foi possivel acessar o Samsung Health Data SDK")
                )
            }
        }
    }

    @PluginMethod
    override fun checkPermissions(call: PluginCall) {
        scope.launch {
            try {
                val granted = withContext(Dispatchers.IO) {
                    HealthDataService.getStore(context).getGrantedPermissions(bodyCompositionPermissions)
                }
                call.resolve(permissionStatusJson(granted))
            } catch (error: HealthDataException) {
                call.resolve(permissionErrorJson(error))
            } catch (error: Exception) {
                call.resolve(
                    JSObject()
                        .put("bodyComposition", false)
                        .put("error", error.message ?: "Erro ao verificar permissoes Samsung Health")
                )
            }
        }
    }

    @PluginMethod
    override fun requestPermissions(call: PluginCall) {
        val currentActivity = activity
        if (currentActivity == null) {
            call.reject("Activity indisponivel para solicitar permissoes")
            return
        }

        scope.launch {
            try {
                val granted = withContext(Dispatchers.IO) {
                    HealthDataService.getStore(context).requestPermissions(bodyCompositionPermissions, currentActivity)
                }
                call.resolve(permissionStatusJson(granted))
            } catch (error: HealthDataException) {
                if (error is ResolvablePlatformException && error.hasResolution) {
                    try {
                        error.resolve(currentActivity)
                    } catch (_: Exception) {
                        // The returned error still explains what the user must fix.
                    }
                }
                call.resolve(permissionErrorJson(error))
            } catch (error: Exception) {
                call.resolve(
                    JSObject()
                        .put("bodyComposition", false)
                        .put("error", error.message ?: "Erro ao solicitar permissoes Samsung Health")
                )
            }
        }
    }

    @PluginMethod
    fun readLatestBodyComposition(call: PluginCall) {
        scope.launch {
            try {
                val result = withContext(Dispatchers.IO) { readBodyComposition(limit = 1) }
                call.resolve(result)
            } catch (error: HealthDataException) {
                call.resolve(readErrorJson(error))
            } catch (error: Exception) {
                call.resolve(
                    JSObject()
                        .put("ok", false)
                        .put("message", error.message ?: "Nao foi possivel ler bioimpedancia do Samsung Health")
                )
            }
        }
    }

    @PluginMethod
    fun readBodyCompositionHistory(call: PluginCall) {
        val limit = call.getInt("limit", 10) ?: 10
        scope.launch {
            try {
                val result = withContext(Dispatchers.IO) { readBodyComposition(limit = limit.coerceIn(1, 50)) }
                call.resolve(result)
            } catch (error: HealthDataException) {
                call.resolve(readErrorJson(error))
            } catch (error: Exception) {
                call.resolve(
                    JSObject()
                        .put("ok", false)
                        .put("message", error.message ?: "Nao foi possivel ler historico de bioimpedancia")
                )
            }
        }
    }

    private suspend fun readBodyComposition(limit: Int): JSObject {
        val store = HealthDataService.getStore(context)
        val end = LocalDateTime.now()
        val start = end.minusDays(365)
        val request = DataTypes.BODY_COMPOSITION.readDataRequestBuilder
            .setLocalTimeFilter(LocalTimeFilter.of(start, end))
            .setOrdering(Ordering.DESC)
            .setLimit(limit)
            .build()
        val response = store.readData(request)
        val records = response.dataList.map { bodyCompositionJson(it) }
        val recordsArray = JSONArray()
        records.forEach { recordsArray.put(it) }
        val latest = records.firstOrNull()

        return JSObject()
            .put("ok", true)
            .put("source", "Samsung Health")
            .put("totalRecords", response.dataList.size)
            .put("records", recordsArray)
            .put("latest", latest)
    }

    private fun bodyCompositionJson(point: HealthDataPoint): JSObject {
        return JSObject()
            .put("date", point.startTime.atZone(java.time.ZoneId.systemDefault()).toLocalDate().toString())
            .put("startTime", point.startTime.toString())
            .put("endTime", point.endTime.toString())
            .put("sourcePackage", point.dataSource?.appId)
            .put("sourceDeviceId", point.dataSource?.deviceId)
            .put("weight", roundOne(floatValue(point, DataType.BodyCompositionType.WEIGHT)))
            .put("height", roundOne(floatValue(point, DataType.BodyCompositionType.HEIGHT)))
            .put("bodyFat", roundOne(floatValue(point, DataType.BodyCompositionType.BODY_FAT)))
            .put("bodyFatMass", roundOne(floatValue(point, DataType.BodyCompositionType.BODY_FAT_MASS)))
            .put("fatFree", roundOne(floatValue(point, DataType.BodyCompositionType.FAT_FREE)))
            .put("fatFreeMass", roundOne(floatValue(point, DataType.BodyCompositionType.FAT_FREE_MASS)))
            .put("muscleMassPercent", roundOne(floatValue(point, DataType.BodyCompositionType.MUSCLE_MASS)))
            .put("skeletalMuscle", roundOne(floatValue(point, DataType.BodyCompositionType.SKELETAL_MUSCLE)))
            .put("skeletalMuscleMass", roundOne(floatValue(point, DataType.BodyCompositionType.SKELETAL_MUSCLE_MASS)))
            .put("bodyWater", roundOne(floatValue(point, DataType.BodyCompositionType.TOTAL_BODY_WATER)))
            .put("bmi", roundOne(floatValue(point, DataType.BodyCompositionType.BODY_MASS_INDEX)))
            .put("bmr", intValue(point, DataType.BodyCompositionType.BASAL_METABOLIC_RATE))
    }

    private fun floatValue(point: HealthDataPoint, field: Field<Float>): Double? {
        return try {
            point.getValue(field)?.toDouble()
        } catch (_: Exception) {
            null
        }
    }

    private fun intValue(point: HealthDataPoint, field: Field<Int>): Int? {
        return try {
            point.getValue(field)
        } catch (_: Exception) {
            null
        }
    }

    private fun roundOne(value: Double?): Double? {
        if (value == null) return null
        return kotlin.math.round(value * 10.0) / 10.0
    }

    private fun permissionStatusJson(granted: Set<Permission>): JSObject {
        val hasBodyComposition = granted.contains(bodyCompositionReadPermission)
        return JSObject()
            .put("bodyComposition", hasBodyComposition)
            .put("status", if (hasBodyComposition) "granted" else "pending")
            .put("message", if (hasBodyComposition) "Permissao de bioimpedancia concedida" else "Permissao de bioimpedancia pendente")
    }

    private fun permissionErrorJson(error: HealthDataException): JSObject {
        return JSObject()
            .put("bodyComposition", false)
            .put("status", statusFromHealthError(error))
            .put("message", healthErrorMessage(error))
            .put("error", error.errorMessage ?: error.message)
            .put("errorCode", error.errorCode)
            .put("requiresDeveloperModeOrPartnership", error is AuthorizationException)
    }

    private fun readErrorJson(error: HealthDataException): JSObject {
        return JSObject()
            .put("ok", false)
            .put("status", statusFromHealthError(error))
            .put("message", healthErrorMessage(error))
            .put("error", error.errorMessage ?: error.message)
            .put("errorCode", error.errorCode)
            .put("requiresDeveloperModeOrPartnership", error is AuthorizationException)
    }

    private fun statusFromHealthError(error: HealthDataException): String {
        if (error is AuthorizationException) return "authorization_required"
        if (error is ResolvablePlatformException) return "platform_resolution_required"
        return "error"
    }

    private fun healthErrorMessage(error: HealthDataException): String {
        if (error is AuthorizationException) {
            return "Samsung bloqueou o acesso. Ative Developer Mode no Samsung Health ou registre o app como parceiro."
        }
        if (error is ResolvablePlatformException && error.hasResolution) {
            return "Samsung Health precisa de uma acao no celular para liberar o SDK."
        }
        return error.errorMessage ?: error.message ?: "Erro no Samsung Health Data SDK"
    }

    private companion object {
        val bodyCompositionReadPermission = Permission.of(DataTypes.BODY_COMPOSITION, AccessType.READ)
        val bodyCompositionPermissions = setOf(bodyCompositionReadPermission)
    }
}
