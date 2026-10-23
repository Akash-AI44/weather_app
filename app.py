from fastapi import FastAPI

app = FastAPI()


@app.get("/api/health")
def status():
    return {"status": "ok"}
