# BhoomiDrishti ML Service

This service contains the trained BhoomiDrishti model used by the Officer workflow.

## Start locally

```powershell
python -m pip install -r ml_service/requirements.txt
python -m uvicorn ml_service.main:app --reload --port 8001
```

The frontend sends the selected `project_id` separately from the uploaded workbook. The service accepts either that contract or a workbook containing a `Project_ID` column.

## Response contract

`POST /api/officer/ml/upload-risk` returns the selected project ID, processed row count, raw and adjusted delay, risk level, score, priority, ranked risk drivers, recommended action, engineered features, and row-level owner status.

The model files are loaded once at startup. Keep them versioned with the service and do not expose them through the frontend.
