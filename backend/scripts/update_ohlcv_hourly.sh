#\!/bin/bash
DATA_DIR=/Users/openclaw/pruviq/data/futures
VENV=/Users/openclaw/pruviq/backend/.venv/bin/python
cd /Users/openclaw/pruviq/backend
$VENV scripts/update_ohlcv.py --data-dir "$DATA_DIR" 2>&1 | tail -5
curl -s -X POST http://localhost:8080/admin/refresh 2>/dev/null | head -1 || true
kill -HUP $(pgrep -u openclaw -f uvicorn) 2>/dev/null || true
