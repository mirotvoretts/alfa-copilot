set shell := ["bash", "-cu"]

engine := "services/financial-engine"
orchestrator := "services/ai-orchestrator"
gateway := "services/gateway"
frontend := "frontend"

default:
    just --list

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

check: check-cpp check-py check-rust check-ts

check-cpp:
    #!/usr/bin/env bash
    set -euo pipefail
    files=$(find {{engine}}/src {{engine}}/tests -type f \( -name '*.cpp' -o -name '*.hpp' \))
    if [ -z "$files" ]; then echo "check-cpp: no C++ sources yet, skipping"; exit 0; fi
    echo "$files" | xargs clang-format --dry-run --Werror
    cppcheck --enable=warning,performance,portability --error-exitcode=1 --std=c++20 {{engine}}/src

check-py:
    #!/usr/bin/env bash
    set -euo pipefail
    if ! find {{orchestrator}}/src {{orchestrator}}/tests -type f -name '*.py' | grep -q .; then echo "check-py: no Python sources yet, skipping"; exit 0; fi
    cd {{orchestrator}} && ruff format --check . && ruff check .

check-rust:
    #!/usr/bin/env bash
    set -euo pipefail
    if ! find {{gateway}}/src -type f -name '*.rs' | grep -q .; then echo "check-rust: no Rust sources yet, skipping"; exit 0; fi
    cd {{gateway}} && cargo fmt --check && cargo clippy --all-targets --locked -- -D warnings

check-ts:
    #!/usr/bin/env bash
    set -euo pipefail
    if ! find {{frontend}}/src -type f \( -name '*.ts' -o -name '*.tsx' \) | grep -q .; then echo "check-ts: no TS sources yet, skipping"; exit 0; fi
    cd {{frontend}} && npx prettier --check . && npx eslint .

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

hooks:
    git config core.hooksPath .githooks
