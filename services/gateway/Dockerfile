FROM rust:1-slim AS build
WORKDIR /app
COPY . .
RUN cargo build --release --locked

FROM debian:bookworm-slim
WORKDIR /app
COPY --from=build /app/target/release/gateway /app/gateway
EXPOSE 8080
CMD ["/app/gateway"]
