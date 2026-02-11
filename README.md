# GeoPulse
GeoPulse is an intelligent soil quality detection system that leverages Deep Learning and data analysis to evaluate soil health and classify fertility levels. The project helps farmers, researchers, and agricultural experts make data-driven decisions for sustainable farming and improved crop yields.

## Repository structure

- `AGRIBOT/` — Flask app and UI scaffolding
- `soil-quality-backend/` — model code, `ml_model/` and related backend logic
- `soil-quality-frontend/` — React frontend
- `ml_server.py` — lightweight server for model inference (root)
- `requirements.txt` — Python dependencies

## Requirements

- Python 3.8 or later
- Node.js 16 or later (for frontend)
- Git LFS (recommended for large dataset files)

## Setup (backend)

1. Create and activate a virtual environment:

```powershell
python -m venv .venv
& .venv\Scripts\Activate.ps1
```

2. Install Python dependencies:

```powershell
pip install -r requirements.txt
```

3. Initialize Git LFS (required to fetch large assets):

```powershell
git lfs install
git lfs pull
```

4. Run the inference server (example):

```powershell
python ml_server.py
```

## Setup (frontend)

```bash
cd soil-quality-frontend
npm install
npm start
```

## Notes

- Large file handling: Some dataset archives (for example `archive/Dataset/Train.zip`) are stored using Git LFS. If you clone this repository, run `git lfs install` and `git lfs pull` to retrieve LFS files.
- If you plan to contribute large binary assets, add them to Git LFS with `git lfs track "path/to/file"`.

## Contact

If you need help, open an issue or contact the maintainer.
