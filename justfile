set shell := ["bash", "-cu"]

engine := "services/financial-engine"
orchestrator := "services/ai-orchestrator"
gateway := "services/gateway"
frontend := "frontend"

default:
    just --list

# Format every language in place. Fast.
fmt: fmt-cpp fmt-py fmt-rust fmt-ts

fmt-cpp:
    find {{engine}}/src {{engine}}/tests -type f \( -name '*.cpp' -o -name '*.hpp' \) -print0 \
        | xargs -0 -r clang-format -i

fmt-py:
    cd {{orchestrator}} && ruff format .

fmt-rust:
    cd {{gateway}} && cargo fmt

fmt-ts:
    cd {{frontend}} && npx prettier --write .

# Pre-commit gate: format-check plus lint, no tests. Fast.
check: check-cpp check-py check-rust check-ts

check-cpp:
    find {{engine}}/src {{engine}}/tests -type f \( -name '*.cpp' -o -name '*.hpp' \) -print0 \
        | xargs -0 -r clang-format --dry-run --Werror
    cppcheck --enable=warning,performance,portability --error-exitcode=1 --std=c++20 {{engine}}/src

check-py:
    cd {{orchestrator}} && ruff format --check .
    cd {{orchestrator}} && ruff check .

check-rust:
    cd {{gateway}} && cargo fmt --check
    cd {{gateway}} && cargo clippy --all-targets --locked -- -D warnings

check-ts:
    cd {{frontend}} && npx prettier --check .
    cd {{frontend}} && npx eslint .

# Hard gate for CI: strict format-check, strict lint, type check, full tests.
ci: ci-cpp ci-py ci-rust ci-ts

ci-cpp: check-cpp
    cmake -S {{engine}} -B {{engine}}/build -DCMAKE_BUILD_TYPE=Release
    cmake --build {{engine}}/build
    ctest --test-dir {{engine}}/build --output-on-failure

ci-py: check-py
    cd {{orchestrator}} && mypy --strict src tests
    cd {{orchestrator}} && pytest

ci-rust: check-rust
    cd {{gateway}} && cargo audit
    cd {{gateway}} && cargo test --locked

ci-ts: check-ts
    cd {{frontend}} && npx tsc --noEmit
    cd {{frontend}} && npx vitest run

# Install the pre-commit hook that runs 'just check'.
hooks:
    printf '%s\n' '#!/usr/bin/env bash' 'set -e' 'just check' > .git/hooks/pre-commit
    chmod +x .git/hooks/pre-commit
