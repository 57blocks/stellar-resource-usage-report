PORT=${1:-8000}

docker run --rm -i \
    -p "$PORT:8000" \
    --name stellar-dev \
    stellar/quickstart:latest \
    --local \
    --limits unlimited \
    --enable-soroban-rpc \
    --enable-soroban-diagnostic-events
