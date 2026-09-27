# 1. 책임과 데이터 모델

## 중심 질문

> RocksDB는 어떤 형태의 데이터를 어떤 인스턴스 경계에서 저장하는가?

이 과정에서는 RocksDB를 상위 애플리케이션에 내장되는 single-node key-value storage engine으로 이해한다. Secondary index와 constraint의 구체적인 읽기·쓰기·동시성 처리, 복제·백업 구현은 이후 과정에서 배운다.

## 1. Embedded library와 single node

### 논문 §1 원문

> RocksDB [...] is designed as a library component that is embedded in higher-level applications. As such, each RocksDB instance manages data on storage devices of just a single server node; it does not handle any inter-host operations, such as replication and load balancing [...]

### 직역

> RocksDB는 상위 애플리케이션에 내장되는 라이브러리 구성 요소로 설계됐다. 따라서 각 RocksDB 인스턴스는 단일 서버 노드의 저장장치에 있는 데이터만 관리한다. 복제나 로드밸런싱처럼 호스트 사이에서 수행되는 작업은 처리하지 않는다.

세 용어의 의미는 다음과 같다.

- `embedded library`: 애플리케이션이 RocksDB 라이브러리를 직접 호출한다. RocksDB 자체가 네트워크 요청을 받는 완성된 DB 서버라는 뜻은 아니다.
- `storage engine`: 상위 시스템을 위해 데이터를 저장하고 조회하는 하위 구성 요소다.
- `single node`: RocksDB 인스턴스 하나가 관리하는 범위가 단일 서버 노드라는 뜻이다.

전체 서비스는 여러 서버로 구성된 분산 시스템이면서, 각 서버에서 별도의 RocksDB 인스턴스를 사용할 수 있다.

```text
분산 서비스
├─ 서버 A
│  ├─ 요청 처리·복제 로직
│  └─ RocksDB-A → A가 관리하는 저장장치
├─ 서버 B
│  ├─ 요청 처리·복제 로직
│  └─ RocksDB-B → B가 관리하는 저장장치
└─ 서버 C
   ├─ 요청 처리·복제 로직
   └─ RocksDB-C → C가 관리하는 저장장치
```

### 논문 §4.1 원문

> Large-scale distributed data services typically partition the data into shards that are distributed across multiple server nodes [...] a separate RocksDB instance is used to service each shard [...]

### 직역

> 대규모 분산 데이터 서비스는 일반적으로 데이터를 여러 서버 노드에 분산되는 shard로 나눈다. 이 문맥에서는 각 shard를 서비스하기 위해 별도의 RocksDB 인스턴스를 사용한다.

따라서 `RocksDB는 single node`와 `RocksDB를 사용하는 전체 서비스는 distributed`가 동시에 참일 수 있다.

## 2. Local SSD 중심의 설계 배경

### 논문 §2.1 원문

> It became more attractive for applications to design their architecture to store data on local SSDs rather than use a remote data storage service. This increased the demand for a key-value store engine that can be embedded in applications.

> We wanted to create a flexible key-value store to serve a wide range of applications using local SSD drives while optimizing for the characteristics of SSDs.

### 직역

> 애플리케이션이 원격 데이터 저장 서비스 대신 local SSD에 데이터를 저장하도록 아키텍처를 설계하는 것이 더 매력적이 됐다. 이는 애플리케이션에 내장할 수 있는 key-value storage engine의 수요를 증가시켰다.

> RocksDB는 SSD의 특성에 최적화하면서 local SSD를 사용하는 다양한 애플리케이션을 지원하기 위한 유연한 key-value store로 만들어졌다.

그러나 local SSD는 single node의 정의나 실행을 위한 필수조건이 아니다.

### 논문의 remote storage 설명

> So far, our optimizations have assumed the SSDs are locally attached [...] the performance of running RocksDB with remote storage has become viable for an increasing number of applications.

### 직역

> 지금까지의 최적화는 SSD가 로컬에 연결되어 있다고 가정해 왔다. 하지만 remote storage에서 RocksDB를 실행하는 성능도 점점 더 많은 애플리케이션에서 실용적이 됐다.

정리하면 다음과 같다.

- Local SSD는 RocksDB가 발전해 온 핵심 설계 배경이다.
- Remote storage를 사용해도 인스턴스의 관리 범위가 바뀌는 것은 아니다.
- 저장장치의 위치와 single-node 책임 경계는 서로 다른 문제다.

## 3. Ordered byte-array key-value

### 공식 Basic Operations 원문

> The rocksdb library provides a persistent key value store. Keys and values are arbitrary byte arrays. The keys are ordered within the key value store according to a user-specified comparator function.

### 직역

> RocksDB 라이브러리는 영속적인 key-value store를 제공한다. Key와 value는 임의의 byte array다. Key는 사용자가 지정한 comparator 함수에 따라 key-value store 안에서 정렬된다.

정렬되는 것은 key다. Value 내부의 구조를 RocksDB가 해석하거나 정렬하는 것은 아니다.

기본 comparator는 byte lexicographic order를 사용하므로 문자열 key는 다음과 같이 정렬될 수 있다.

```text
user/1
user/10
user/2
```

숫자 순서가 필요하다면 애플리케이션이 fixed-width 또는 정렬 가능한 binary encoding을 사용하거나 적절한 comparator를 제공해야 한다.

### 논문 §7 원문

> Both keys and values are variable-length byte arrays. Applications have great flexibility in determining what information to pack into each key and value, and they can freely choose from a rich set of encoding schemes. Consequently, it is the application that is responsible for parsing and interpreting the keys and values.

### 직역

> Key와 value는 모두 가변 길이 byte array다. 애플리케이션은 각 key와 value에 어떤 정보를 넣을지 자유롭게 결정할 수 있고 다양한 encoding 방식을 선택할 수 있다. 따라서 key와 value를 parsing하고 해석하는 책임은 애플리케이션에 있다.

예를 들어 다음 데이터가 있다고 하자.

```text
key   = user/by-id/0000000042
value = <protobuf bytes>
```

RocksDB가 아는 것은 다음뿐이다.

- key의 byte
- value의 byte
- comparator상 key가 위치할 순서

이 데이터가 사용자 42번을 뜻하고 value가 Protobuf로 encoding됐다는 의미는 애플리케이션이 정의하고 해석한다.

## 4. DB와 Column Family

### DB

공식 Basic Operations 원문:

> A rocksdb database has a name which corresponds to a file system directory. All of the contents of database are stored in this directory.

직역:

> RocksDB DB의 이름은 filesystem directory에 대응한다. DB의 모든 내용은 이 directory에 저장된다.

같은 호스트가 서로 다른 directory에 여러 RocksDB DB 인스턴스를 운영할 수 있다.

```text
서버 A
├─ /data/shard-17/  ← DB 인스턴스 A
└─ /data/shard-18/  ← DB 인스턴스 B
```

### Column Family

논문 §2.2 원문:

> [Column family] allows different independent key spaces to co-exist in one DB. Each KV pair is associated with exactly one column family [...] Each column family has its own set of MemTables and SSTables, but they share the WAL.

직역:

> Column Family는 서로 독립적인 key space들이 하나의 DB 안에 공존할 수 있게 한다. 각 KV pair는 정확히 하나의 Column Family에 속한다. 각 Column Family는 자체 MemTable과 SSTable 집합을 가지지만 WAL은 공유한다.

공식 Column Families 문서는 이를 다음과 같이 설명한다.

> Column Families provide a way to logically partition the database.

> They share the write-ahead log and don't share memtables and table files.

직역:

> Column Family는 DB를 논리적으로 분할하는 방법이다.

> 같은 DB의 Column Family들은 WAL을 공유하지만 MemTable과 table file은 공유하지 않는다.

Column Family는 한 DB 안의 독립적인 ordered KV key space이자 물리적인 LSM 구성 경계다. 애플리케이션이 하나의 Column Family를 RDB table처럼 사용할 수는 있지만, Column Family 자체가 schema와 row 의미를 제공하는 table은 아니다.

## 5. Replication & Backup: application controls it, DB supports materials

> 이 절의 내용은 single-node 책임 경계를 이해하기 위한 선행 자료로 남긴다. Logical copy, physical copy와 Backup Engine의 구체적인 보장과 사용법은 11장에서 통과 여부를 평가한다.

### 책임에 대한 논문 §4.2 원문

> RocksDB is a single node library. The applications that use RocksDB are responsible for replication and backups if needed. Each application implements these functions in its own way (for legitimate reasons), so it is important that RocksDB offers appropriate support for these functions.

### 직역

> RocksDB는 single-node library다. RocksDB를 사용하는 애플리케이션은 필요한 경우 replication과 backup을 책임진다. 각 애플리케이션은 정당한 이유로 이러한 기능을 서로 다른 방식으로 구현하므로, RocksDB가 적절한 지원을 제공하는 것이 중요하다.

애플리케이션이 replication과 backup을 책임진다는 것은 RocksDB가 아무 기능도 제공하지 않는다는 뜻이 아니다.

### Logical copy 원문

> First, all the keys can be read from a source replica and then written to the destination replica. We call this logical copying. On the source side, snapshots ensure a consistent view of the source data.

### 직역

> 첫 번째 방법은 source replica의 모든 key를 읽어 destination replica에 쓰는 것이다. 이를 logical copying이라고 한다. Source에서는 Snapshot이 source data의 일관된 view를 보장한다.

Snapshot은 복사를 직접 수행하지 않는다.

```text
Snapshot 획득
→ 같은 Snapshot으로 전체 key scan
→ 애플리케이션이 결과를 destination으로 전송
→ destination에 write 또는 bulk load
```

### Physical copy 원문

> Second, bootstrapping a new replica can be done by copying SSTables and other files directly. We call this physical copying. RocksDB assists physical copying by identifying existing database files at a current point in time and preventing them from being mutated or deleted while the copy is ongoing.

### 직역

> 두 번째 방법은 SSTable과 다른 파일을 직접 복사해 새 replica를 만드는 것이다. 이를 physical copying이라고 한다. RocksDB는 현재 시점의 DB 파일들을 식별하고 복사가 진행되는 동안 그 파일들이 변경되거나 삭제되지 않도록 하여 physical copying을 돕는다.

RocksDB가 제공하는 것은 복사 대상 파일의 식별과 생명주기 보호다. 실제 파일 전송과 destination 설치는 상위 시스템이 담당한다.

### Backup Engine 원문

> While most applications implement their own backups (to accommodate their own requirements), RocksDB provides a backup engine for applications to use if their backup requirements are simple.

### 직역

> 대부분의 애플리케이션은 자체 요구사항에 맞춰 backup을 구현하지만, backup 요구사항이 단순한 애플리케이션을 위해 RocksDB는 Backup Engine을 제공한다.

따라서 애플리케이션 책임과 RocksDB의 구현 재료는 다음처럼 구분된다.

- 상위 시스템 책임: 복제 순서, 전송, replica membership, backup 주기·보존·복구 정책
- RocksDB가 제공하는 재료: 일관된 Snapshot view, 복사할 파일의 식별과 보호, 단순한 요구를 위한 Backup Engine

## 보장과 비보장

### 이 과정에서 확인한 것

- RocksDB는 상위 애플리케이션에 내장되는 persistent key-value storage engine이다.
- 각 RocksDB 인스턴스는 한 서버 노드의 데이터를 관리한다.
- Local SSD는 설계 배경이지만 필수 실행 조건은 아니다.
- Key와 value는 임의의 byte array이고 key는 comparator 순서로 정렬된다.
- Key와 value의 encoding과 해석은 애플리케이션 책임이다.
- DB는 filesystem directory에 대응한다.
- 같은 DB의 Column Family는 자체 MemTable과 SSTable을 가지고 WAL을 공유한다.
- Replication과 backup은 상위 시스템 책임이지만 RocksDB는 이를 구현할 재료를 제공한다.

### 이 과정의 통과 기준에 포함하지 않는 것

- Secondary index의 쓰기와 탐색
- Constraint와 transaction conflict control
- Sequence Number와 Snapshot
- Logical copy, physical copy와 Backup Engine의 구체적인 보장과 사용법

## 통과 기준

1. `embedded library`, `storage engine`, `single node`의 의미와 RocksDB를 사용하는 전체 분산 시스템의 경계를 설명한다.
2. Local SSD가 RocksDB의 설계 배경이지 single node를 결정하거나 실행 가능성을 제한하는 조건이 아님을 설명한다.
3. Byte-array key-value 모델, comparator에 따른 key 순서, encoding과 데이터 해석의 애플리케이션 책임을 설명한다.
4. DB가 filesystem directory에 대응하며 같은 호스트가 여러 독립 DB 인스턴스를 운영할 수 있음을 설명한다.
5. Column Family가 한 DB 안의 독립적인 ordered KV key space와 LSM 구성 경계이며, 각자의 MemTable·SSTable을 가지고 WAL을 공유함을 설명한다.

## 출처

- [RocksDB: Evolution of Development Priorities in a Key-value Store Serving Large-scale Applications](https://doi.org/10.1145/3483840)
- [RocksDB Basic Operations](https://github.com/facebook/rocksdb/wiki/Basic-Operations)
- [RocksDB Column Families](https://github.com/facebook/rocksdb/wiki/Column-Families)
