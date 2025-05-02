from fastapi import FastAPI, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
import uuid, shutil, os, subprocess, tempfile
import boto3
from threading import Thread
from dotenv import dotenv_values
import asyncio

app = FastAPI()

credentials = dotenv_values('.env')

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# AWS S3 setup
S3_BUCKET = credentials['S3_BUCKET']
s3_client = boto3.client("s3", region_name= credentials['REGION'], aws_access_key_id=credentials['ACCESS_KEY'], aws_secret_access_key=credentials['SECRET_ACCESS_KEY'])

# Job status memory
job_status = {}  # {job_id: "processing"/"done"/"error"}
job_files = {}   # {job_id: pdf_filename}
SHARED_DIR = os.path.abspath("./shared")

@app.post("/upload")
async def upload(file: UploadFile = File(...)):
    # Generating a UUID-based filename with the correct extension
    job_id = str(uuid.uuid4())
    filename = f"{job_id}.pptx"
    

    pptx_path = os.path.join(SHARED_DIR, filename)

    # Saving the uploaded file to the shared path
    with open(pptx_path, "wb") as f:
        content = await file.read()
        f.write(content)

    job_status[job_id] = "processing"
    def convert_and_upload():
        try:
            subprocess.run(["docker", "exec", "unoserver",
            "libreoffice", "--headless", "--convert-to", "pdf",
            "--outdir", "/shared", f"/shared/{filename}"
            ], check=True)

            pdf_filename = filename.replace(".pptx", ".pdf")
            pdf_path = os.path.join(SHARED_DIR, pdf_filename)

            # Uploading to S3
            s3_key = f"{job_id}.pdf"
            s3_client.upload_file(pdf_path, S3_BUCKET, s3_key)


            job_files[job_id] = s3_key
            job_status[job_id] = "done"
            
    
            os.remove(pptx_path)
            os.remove(pdf_path)

        except Exception as e:
            print("Conversion error:", e)
            job_status[job_id] = "error"

    Thread(target=convert_and_upload).start()
    return {"job_id": job_id, "status": job_status[job_id]}

@app.get("/status/{job_id}")
async def status(job_id: str):
    if job_status[job_id] is None:
        return {"error": "Invalid job ID"}
    return {"job_id": job_id, "status": job_status[job_id]}

@app.get("/download/{job_id}")
async def download(job_id: str, background_tasks: BackgroundTasks):
    try:
        if job_status.get(job_id) is not None:
            if job_status.get(job_id).lower() != "done":
                return {"error": "Not ready"}
        else:
            return {"error": "Job ID not found!"}

        s3_key = job_files[job_id]
        url = s3_client.generate_presigned_url(
            "get_object",
            Params={"Bucket": S3_BUCKET, "Key": job_files[job_id]},
            ExpiresIn=600
        )
        # print("URL: ",url)
        background_tasks.add_task(delete_file_after_delay, s3_key, delay=120)
        # print("URL: ",url)
        return {"url": url}
    except Exception as e:
        return {"error": e}


async def delete_file_after_delay(s3_key: str, delay: int = 300):
    await asyncio.sleep(delay)
    try:
        s3_client.delete_object(Bucket=S3_BUCKET, Key=s3_key)
        print(f"Deleted {s3_key} from S3 after {delay} seconds.")
    except Exception as e:
        print(f"Error deleting {s3_key}: {e}")

