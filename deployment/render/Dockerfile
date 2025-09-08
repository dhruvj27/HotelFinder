# Dockerfile - build-friendly for scikit-surprise
FROM python:3.10-slim

ENV DEBIAN_FRONTEND=noninteractive
WORKDIR /app

# System build deps (compilers, headers, BLAS/LAPACK)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    gcc \
    g++ \
    gfortran \
    git \
    curl \
    python3-dev \
    libopenblas-dev \
    liblapack-dev \
    libblas-dev \
    pkg-config \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements but we'll install some packages in stages
COPY requirements.txt /app/requirements.txt

# Upgrade pip & core wheel/build tools
RUN pip install --upgrade pip setuptools wheel

# Install numerical libs + cython early (needed to build C extensions)
# Pin numpy and scipy to versions that are compatible with your code and wheels
RUN pip install --no-cache-dir numpy==1.26.4 scipy==1.11.3 cython==0.29.36

# Install scikit-surprise separately so it sees numpy/cython headers
RUN pip install --no-cache-dir scikit-surprise==1.1.3

# Install the remaining requirements excluding the ones we already installed.
# Create a temporary filtered requirements file that excludes numpy, scipy, cython, scikit-surprise
RUN python3 -c "\
import pathlib; \
r = pathlib.Path('requirements.txt').read_text().splitlines(); \
filtered = [l for l in r if l.strip() and not l.strip().startswith('#') and not any(x in l.lower() for x in ['numpy','scipy','cython','scikit-surprise','surprise'])]; \
pathlib.Path('/app/req_filtered.txt').write_text('\n'.join(filtered))"

RUN pip install --no-cache-dir -r /app/req_filtered.txt

# Copy app sources
COPY . /app

EXPOSE 8000

CMD ["gunicorn", "-k", "uvicorn.workers.UvicornWorker", "app:app", "-b", "0.0.0.0:8000", "--workers", "1"]