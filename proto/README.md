# proto

Shared protobuf schemas for gRPC between the services. This directory is the single
source of truth for internal contracts. Do not copy or fork these schemas into a
service; every service generates its stubs from here.

Freeze the schemas and the stream message shape before implementation, then build the
services in parallel against mocks of each other.
