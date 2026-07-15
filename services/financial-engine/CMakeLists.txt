cmake_minimum_required(VERSION 3.24)
project(financial_engine LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)
set(CMAKE_EXPORT_COMPILE_COMMANDS ON)

add_compile_options(-Wall -Wextra -Werror -Wpedantic -Wconversion -Wshadow)

file(GLOB_RECURSE ENGINE_SOURCES CONFIGURE_DEPENDS src/*.cpp)
list(FILTER ENGINE_SOURCES EXCLUDE REGEX ".*/main\\.cpp$")

add_library(engine_lib STATIC ${ENGINE_SOURCES})
target_include_directories(engine_lib PUBLIC src)

add_executable(financial_engine src/main.cpp)
target_link_libraries(financial_engine PRIVATE engine_lib)

enable_testing()

include(FetchContent)
FetchContent_Declare(
    googletest
    GIT_REPOSITORY https://github.com/google/googletest.git
    GIT_TAG v1.15.2
)
set(gtest_force_shared_crt ON CACHE BOOL "" FORCE)
FetchContent_MakeAvailable(googletest)

file(GLOB_RECURSE ENGINE_TESTS CONFIGURE_DEPENDS tests/*.cpp)
if(ENGINE_TESTS)
    add_executable(engine_tests ${ENGINE_TESTS})
    target_link_libraries(engine_tests PRIVATE engine_lib GTest::gtest_main)
    include(GoogleTest)
    gtest_discover_tests(engine_tests)
endif()
