Quick ML server start guide (FastAPI)

Purpose
- Minimal, copy-paste PowerShell steps to run the ML FastAPI server located in this folder.
- Assumes Windows PowerShell and Python are installed.

Prerequisites
- Python 3.10+ available on PATH (python --version)
- The model file exists at `./models/price_model.joblib`. If not, see "Regenerate model" below.

Steps (PowerShell)
1) Open PowerShell and cd into this folder:

    cd 'C:\Users\User\Desktop\3.2_project\RouteLead\ml'

2) Create and activate a virtual environment (one-time):

    python -m venv .venv
    # Activate the venv (PowerShell)
    .\.venv\Scripts\Activate.ps1

3) Upgrade pip and install dependencies:

    python -m pip install --upgrade pip
    python -m pip install -r requirements.txt

4) Confirm the model file exists:

    Test-Path .\models\price_model.joblib

   - If this returns False, either copy the `price_model.joblib` into `./models/` or regenerate it (see "Regenerate model" below).

5) Start the FastAPI server with uvicorn (dev, with reload):

    uvicorn serve_price_model:app --host 0.0.0.0 --port 8000 --reload

   - The app will be reachable at: http://127.0.0.1:8000
   - Health endpoint: GET /health
   - Prediction endpoint: POST /predict

Quick test (PowerShell):

# Health check
Invoke-RestMethod -Method Get -Uri http://localhost:8000/health

# Example predict
Invoke-RestMethod -Method Post -Uri http://localhost:8000/predict -ContentType 'application/json' -Body (@{ distance = 10; weight = 2; volume = 0.5 } | ConvertTo-Json)

Run in background (PowerShell) - detached process:

Start-Process -NoNewWindow -FilePath .venv\Scripts\python.exe -ArgumentList "-m uvicorn serve_price_model:app --host 0.0.0.0 --port 8000"

Or as a Job:

Start-Job -ScriptBlock { cd 'C:\Users\User\Desktop\3.2_project\RouteLead\ml'; .\.venv\Scripts\Activate.ps1; uvicorn serve_price_model:app --host 0.0.0.0 --port 8000 }

Regenerate model (if missing)
- A training script is present: `train_price_model.py`.
- To regenerate a model (requires pandas, scikit-learn):

    .\.venv\Scripts\Activate.ps1
    python train_price_model.py

- The script should write `models/price_model.joblib` if it trains successfully.

Troubleshooting
- "Model not found" on startup: confirm `models/price_model.joblib` path and permissions.
- Dependency install failures: ensure venv activated and Python version matches requirements; check error messages and install missing packages individually.
- Port in use: change `--port` (e.g. 8001) and update backend `ml.service.url` if Spring Boot calls this service.
- If Spring Boot (backend) cannot reach ML service (connection refused), start this server before hitting backend endpoints that call `/predict`.

Security note
- This example runs a development server. For production, run under a process manager and behind a proper web server or container with secure configuration.

That's it — use the commands above to run and test the ML pricing service locally.