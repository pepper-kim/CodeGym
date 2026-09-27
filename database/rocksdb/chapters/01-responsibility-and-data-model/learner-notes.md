# RocksDB 책임과 데이터 모델

요약: RocksDB는 애플리케이션의 라이브러리를 통해 제공되는 key-value local DB다. Single node로 작동하며 여러 RocksDB가 운영되는 분산 DB 환경에서도 각 DB는 서로를 알지 못한다. 복제, 백업, 분산 트랜잭션 등은 DB를 사용하는 각 애플리케이션의 책임이다.

## 1. Embedded library to manage data in single server node

- 애플리케이션은 RocksDB 라이브러리를 통해 local DB에 접근할 수 있다.
- 단일 서버 내의 데이터만 관리한다.
- 각 RocksDB는 서로의 존재를 모르기에 복제와 로드밸런싱 등은 이 DB의 책임이 아니다.

> RocksDB [...] is designed as a library component that is embedded in higher-level applications. As such, each RocksDB instance manages data on storage devices of just a single server node; it does not handle any inter-host operations, such as replication and load balancing [...] - 논문 §1

- 물론 분산 시스템은 데이터를 파티셔닝하여 여러 RocksDB에 샤딩하여 저장할 수 있다.
- 샤딩, 복제 등은 상위 애플리케이션의 책임이다.

> Large-scale distributed data services typically partition the data into shards that are distributed across multiple server nodes [...] a separate RocksDB instance is used to service each shard [...] - 논문 §4.1

예를 들어 아래와 같은 구조는 가능하다.

```text
분산 서비스
├─ 서버 A
│  ├─ 요청 처리·복제 로직
│  └─ RocksDB-A → A의 저장장치
├─ 서버 B
│  ├─ 요청 처리·복제 로직
│  └─ RocksDB-B → B의 저장장치
└─ 서버 C
   ├─ 요청 처리·복제 로직
   └─ RocksDB-C → C의 저장장치
```

## 2. Built for local SSD usage

- 외부 저장소에 데이터를 저장하는 것보다 local SSD에 저장하는 것이 매력적이게 되어 개발했다.
- Key-value 데이터를 local SSD에 저장하고 SSD에 맞춰 최적화를 진행했다.
- 시작은 local SSD였지만 외부 저장소에 저장하는 것도 충분히 가능하다. 각 RocksDB 인스턴스가 다른 인스턴스와 독립적으로 작동한다면 single node 원칙은 지켜진다.

> It became more attractive for applications to design their architecture to store data on local SSDs rather than use a remote data storage service. This increased the demand for a key-value store engine that can be embedded in applications. - 논문 §2.1

> We wanted to create a flexible key-value store to serve a wide range of applications using local SSD drives while optimizing for the characteristics of SSDs.

> So far, our optimizations have assumed the SSDs are locally attached [...] the performance of running RocksDB with remote storage has become viable for an increasing number of applications.

## 3. Ordered byte array KV

- 임의의 byte array KV를 영속적으로 저장할 수 있다.
- Key는 사용자가 지정한 comparator function으로 정렬할 수 있으며 기본 정렬은 사전순이다.

따라서 아래와 같은 순서로 정렬될 수 있다.

```text
user/1
user/10
user/2
```

숫자순 정렬을 원하면 애플리케이션이 다음과 같이 변경해야 한다.

```text
user/01
user/02
user/10
```

KV의 형식은 애플리케이션의 책임이다. RocksDB는 byte array를 저장하는 책임만 있다.

예를 들어 아래와 같이 저장돼 있을 경우 RocksDB가 아는 것은 다음뿐이다.

- 이 key의 byte
- 이 value의 byte
- comparator상 key가 위치할 순서

```text
key   = user/by-id/0000000042
value = <protobuf bytes>
```

> The rocksdb library provides a persistent key value store. Keys and values are arbitrary byte arrays. The keys are ordered within the key value store according to a user-specified comparator function. - 공식 Basic Operations

> The default ordering function for key [...] orders bytes lexicographically. - 공식 문서

> Both keys and values are variable-length byte arrays. Applications have great flexibility in determining what information to pack into each key and value, and they can freely choose from a rich set of encoding schemes. Consequently, it is the application that is responsible for parsing and interpreting the keys and values. - 논문 §7

## 4. Database

- DB 인스턴스의 경계는 filesystem directory에 대응되고 모든 내용은 이곳에 저장된다.
- 즉 같은 호스트가 여러 DB 인스턴스를 운영할 수 있다.

```text
서버 A
├─ /data/shard-17/  ← DB 인스턴스 A
└─ /data/shard-18/  ← DB 인스턴스 B
```

> A rocksdb database has a name which corresponds to a file system directory. All of the contents of database are stored in this directory. - 공식 Basic Operations

## 5. Column Family

- 한 DB 안의 독립적인 ordered KV key space와 물리적 LSM 구성 경계다. RDB의 table과 개념적으로 유사할 수 있지만 column schema가 없는 등 분명한 차이가 존재한다.
- Column Family는 MemTable과 SSTable을 따로 가진다.
- 한 인스턴스 내부의 모든 Column Family는 WAL을 공유한다.
- WAL을 공유하므로 단일 인스턴스 내 여러 Column Family를 대상으로 하는 WriteBatch는 원자성을 보장한다.

> [Column family] allows different independent key spaces to co-exist in one DB. Each KV pair is associated with exactly one column family [...] Each column family has its own set of MemTables and SSTables, but they share the WAL. - 논문 §2.2

> The shared WAL enables atomic writes to different column families. - 논문 §2.2

> Column Families provide a way to logically partition the database. - 공식 문서

> They share the write-ahead log and don't share memtables and table files. - 공식 문서

## 6. Replication & Backup: application controls it, DB supports materials

- 복제와 백업 등은 RocksDB의 책임이 아니라 이를 사용하는 분산 시스템의 책임이다.
- RocksDB는 분산 시스템이 복제와 백업을 구현하기 위한 재료를 제공한다.
  - Logical copy: source의 Snapshot을 통해 일관된 view를 제공한다.
  - Physical copy: SSTable과 다른 파일들을 식별하고 파일이 복사되는 동안 변경되거나 삭제되는 것을 방지한다.
  - Backup Engine: RocksDB가 자체 Backup Engine을 제공하며 백업 관련 설정은 애플리케이션 책임이다.

> 구체적인 내용은 추후 다른 과정에서 설명한다.

> RocksDB is a single node library. The applications that use RocksDB are responsible for replication and backups if needed. [...] it is important that RocksDB offers appropriate support for these functions. - 논문 §4.2

### Logical copy

> First, all the keys can be read from a source replica and then written to the destination replica. We call this logical copying. On the source side, snapshots ensure a consistent view of the source data. - 논문 §4.2

### Physical copy

> Second, bootstrapping a new replica can be done by copying SSTables and other files directly. We call this physical copying. RocksDB assists physical copying by identifying existing database files at a current point in time and preventing them from being mutated or deleted while the copy is ongoing. - 논문 §4.2

### Backup Engine

> While most applications implement their own backups (to accommodate their own requirements), RocksDB provides a backup engine for applications to use if their backup requirements are simple.
