# Database Internals 학습 목표

## 장기 목표

『Database Internals』의 핵심 원리를 온전히 이해하고, 낯선 데이터베이스도 내부 동작을 스스로 추론·검증하며, 서로 다른 데이터베이스가 같은 문제를 어떤 구조와 트레이드오프로 해결하는지 비교할 수 있는 수준에 도달한다.

목표는 특정 데이터베이스의 기능이나 설정을 암기하는 것이 아니다. 전체 학습을 관통하는 질문은 다음과 같다.

> 주어진 워크로드와 보장 수준에서, 데이터베이스는 데이터를 어떻게 저장·변경·노출·복구·유지·분산하며, 그 대가를 어디에 배치하는가?

이 질문을 `요구사항 → 물리적 저장과 탐색 → 변경 비용 → 동시성과 가시성 → 장애와 복구 → 시간 경과와 자원 경쟁 → 여러 노드 → 설계 선택의 평가` 순서로 분할한다. 앞 단계의 단순한 데이터베이스에 현실의 압력을 하나씩 추가하고, 마지막에 전체 설계의 적합성과 트레이드오프를 평가한다.

1. **무엇을 해결해야 하는가?** 데이터 모델과 point lookup·range scan·join·aggregation 같은 접근 패턴, latency·throughput·freshness, 필요한 정합성과 내구성을 먼저 정의한다.
2. **데이터를 어떤 물리 구조로 표현하고 필요한 바이트를 어떻게 찾는가?** Page, record, file, B+tree, LSM-tree, Heap, Columnar, index와 cache를 배운다. 아직 동시 실행이나 장애는 없다고 가정한다.
3. **데이터 변경 비용을 언제, 어디에서 지불하는가?** In-place update와 append, buffer와 MemTable, immutable file, read·write·space amplification을 비교한다.
4. **여러 읽기와 쓰기가 겹칠 때 누구에게 어떤 버전이 보여야 하는가?** Lock, MVCC, Sequence Number, Snapshot, isolation과 정상 실행 중의 atomicity를 다룬다.
5. **실행 도중 멈췄을 때 무엇이 살아남고 어떻게 복구되는가?** WAL, redo·undo, checkpoint, commit, crash atomicity와 client acknowledgement의 의미를 배운다.
6. **오래 실행되고 작업들이 유한한 자원을 경쟁해도 어떻게 성능을 유지하는가?** Compaction, Vacuum, Purge, Merge, tombstone 제거, cache·thread·I/O 관리, per-instance와 per-host 제어, backpressure와 stall을 다룬다.
7. **한 노드를 넘으면 데이터의 책임과 진실을 어떻게 나누는가?** Partitioning, replication, consistency, quorum, consensus, distributed transaction과 distributed execution을 배운다.
8. **그래서 이 시스템은 어떤 문제에 적합하며, 무엇을 얻고 잃는가?** Embedded engine·DBMS·managed service의 책임 경계를 구분하고, RocksDB부터 HeatWave까지 OLTP·OLAP·HTAP의 저장 및 실행 구조를 비교한다.

## 학습 대상

### OLTP

- RocksDB
- Berkeley DB
- InnoDB
- PostgreSQL
- DynamoDB

### OLAP

- StarRocks
- ClickHouse

### HTAP

- SingleStore
- HeatWave

## 도달해야 할 이해 수준

학습을 마치면 다음과 같은 질문을 원리부터 설명할 수 있어야 한다.

- 이 데이터베이스는 왜 B+tree, LSM-tree, Heap, Columnar 구조 중 하나 또는 여러 개를 선택했는가?
- 쓰기량이 급증하면 어떤 구조에서 무엇이 병목이 되는가?
- PostgreSQL과 InnoDB의 MVCC는 RocksDB Snapshot의 버전 가시성과 무엇이 다른가?
- StarRocks와 ClickHouse의 Merge 또는 Compaction은 RocksDB Compaction과 무엇이 같고 다른가?
- SingleStore와 HeatWave는 OLTP 데이터를 어떻게 분석 경로에 노출하며, 데이터 최신성을 유지하는 비용은 어디에서 발생하는가?
- 주어진 워크로드와 장애 조건에서 어떤 구조가 적합하며, 그 선택으로 무엇을 얻고 잃는가?

최종적으로는 데이터베이스의 사용법을 아는 수준을 넘어, 새로운 데이터베이스의 내부 구조·보장·병목·트레이드오프를 분석할 수 있어야 한다.

## 학습 원칙

- 『Database Internals』을 전체 개념의 뼈대로 사용한다.
- 각 제품의 공식 논문과 문서를 우선하고, 필요한 경우 현재 upstream 코드를 확인한다.
- 논문이 직접 말한 내용, 현재 구현으로 확인한 내용, 이해를 위한 일반적인 데이터베이스 모델을 구분한다.
- DynamoDB와 HeatWave처럼 내부 구현이 공개되지 않은 부분은 추측하지 않고 `공개된 보장`, `알려진 구조`, `알 수 없음`으로 나눈다.
- 제품별 옵션을 전부 암기하는 것을 목표로 삼지 않는다.
- 호스트 전체 자원 관리처럼 데이터베이스의 근본적인 설계 경계와 트레이드오프를 보여주는 내용은 단순 운영·튜닝으로 분류해 제외하지 않는다.

## 다음 합의 항목

장기 목표를 기준으로 다음 내용을 차례대로 합의하고 문서에 추가한다.

1. RocksDB 학습 목표
2. 전체 학습 목차
3. 지금까지 학습한 내용
4. 앞으로 학습할 내용과 순서
