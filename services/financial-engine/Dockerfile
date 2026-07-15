FROM gcc:14 AS build
RUN apt-get update && apt-get install -y cmake ninja-build && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY . .
RUN cmake -S . -B build -G Ninja -DCMAKE_BUILD_TYPE=Release && cmake --build build

FROM debian:bookworm-slim
WORKDIR /app
COPY --from=build /app/build/financial_engine /app/financial_engine
EXPOSE 50051
CMD ["/app/financial_engine"]
