# =========================================================
# AgroSmart IoT - Inicio del Backend Spring Boot
# =========================================================

Write-Host "Iniciando backend AgroSmart IoT..." -ForegroundColor Green

# Verificar Java
$javaCheck = Get-Command java -ErrorAction SilentlyContinue

if (-not $javaCheck) {
    Write-Host "ERROR: Java no esta instalado o no esta en PATH." -ForegroundColor Red
    exit 1
}

# Obtener la carpeta backend
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Buscar Maven
$mvnCmd = Get-Command mvn -ErrorAction SilentlyContinue

if ($mvnCmd) {
    $maven = $mvnCmd.Source
} else {
    $maven = Join-Path $scriptDir ".tools\apache-maven-3.9.9\bin\mvn.cmd"
}

if (-not (Test-Path $maven) -and -not $mvnCmd) {
    Write-Host "ERROR: No se encuentra Maven." -ForegroundColor Red
    exit 1
}

# Ejecutar Maven desde la carpeta backend
Push-Location $scriptDir

try {
    Write-Host "Compilando e iniciando Spring Boot..." -ForegroundColor Cyan
    & $maven clean spring-boot:run

    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: El backend termino con un error." -ForegroundColor Red
    }
}
finally {
    Pop-Location
}