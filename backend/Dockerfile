FROM python:3.11-slim

WORKDIR /app

RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

ENV PATH="/home/appuser/.local/bin:$PATH"

COPY . .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]
