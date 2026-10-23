---
description: 'Astro + Drizzle/Node SQLite 데이터 계층을 위한 Vitest 단위 테스트 지침'
applyTo: '**/*.test.ts'
---

# 단위 테스트 지침 (Vitest + Drizzle/Node SQLite)

단위 테스트는 **Vitest**(`npm run test:unit`)로 실행합니다. 프레임워크에 의존하지 않는 가치 높은 두 계층을 다룹니다.

1. **순수 변환 함수**(`db/transforms.ts`) — CSV 파싱, 설명 생성, 중복 제거, 결정적 별점.
2. **데이터 액세스 헬퍼**(`src/lib/games.ts`) — 정렬, 조회 — 실제 메모리 내 **Node SQLite** 데이터베이스로 검증합니다.

> [!IMPORTANT]
> 테스트는 Astro 런타임과 독립적으로 유지합니다. 헬퍼는 **주입 가능한 `db`** 인수를 받으며, 테스트는 메모리 내 데이터베이스를, 페이지는 실제 클라이언트를 전달합니다. 데이터 로직을 단위 테스트하기 위해 Astro 서버를 시작하지 않습니다.

## 파일 구조

- 테스트는 코드 옆에 함께 둡니다. `transforms.ts` 옆에 `transforms.test.ts`, `games.ts` 옆에 `games.test.ts`를 둡니다.
- 이름 패턴: `<module>.test.ts`.
- `describe('<모듈 / 함수>')` 블록과 `it('Y일 때 X를 한다')` 케이스를 사용합니다.
- 헬퍼와 픽스처에 타입 주석을 추가합니다. 이 코드베이스는 명시적 타입을 요구합니다.

## 순수 변환 함수 테스트

- 데이터베이스가 필요 없습니다. 함수를 가져와 출력을 검증합니다.
- 정상 경로, 빈 값/공백 입력, 선택 필드가 없는 행, 중복 제거, **결정성**(예: `ratingFromTitle`은 같은 제목에 항상 같은 값을 반환하며 3.0–5.0 범위를 벗어나지 않음)을 다룹니다.
- 입력/출력 조합은 `it.each`를 사용한 표 기반 케이스를 우선합니다.

```ts
import { describe, it, expect } from 'vitest';
import { ratingFromTitle } from './transforms';

describe('ratingFromTitle', () => {
  it('is deterministic and within range', () => {
    const a = ratingFromTitle('Code Quest');
    const b = ratingFromTitle('Code Quest');
    expect(a).toBe(b);
    expect(a).toBeGreaterThanOrEqual(3.0);
    expect(a).toBeLessThanOrEqual(5.0);
  });
});
```

## 데이터 액세스 헬퍼 테스트

- 공용 헬퍼 `createTestDatabase()`(`db/test-helpers.ts`)로 테스트마다 새 메모리 내 데이터베이스를 만듭니다. 이 헬퍼는 `:memory:` Node SQLite 클라이언트에서 마이그레이션을 실행합니다.
- 테스트에 필요한 픽스처만 시드한 다음 해당 `db`로 헬퍼를 호출합니다.
- 객체의 세부 구조를 확인하기 전에 비용이 적은 항목(개수, 합계, 정렬)을 먼저 검증합니다.

```ts
import { describe, it, expect, beforeEach } from 'vitest';
import { createTestDatabase } from '../../db/test-helpers';
import { getAllGames, getGameById } from './games';

describe('getAllGames', () => {
  let db: Awaited<ReturnType<typeof createTestDatabase>>;

  beforeEach(async () => {
    db = await createTestDatabase();
    // …seed publishers, categories, games…
  });

  it('returns games ordered by title with their relations', async () => {
    const games = await getAllGames(db);
    const titles = games.map((g) => g.title);
    expect(titles).toEqual([...titles].sort());
    expect(games[0].category).not.toBeNull();
  });
});
```

## 필수 커버리지

- 유효한 데이터로 성공하는 경우
- 찾을 수 없는 경우(없는 id로 `getGameById`를 호출하면 `null` 반환)
- 빈 데이터베이스/컬렉션 시나리오
- 정렬 보장(제목순) — 정적 빌드는 이 정렬이 결정적이라는 점에 의존합니다
- 시드에서 파생된 값의 결정성

## 모범 사례

- Arrange-Act-Assert 구조를 따릅니다.
- `it` 하나에는 하나의 동작만 담고, 관련 없는 항목을 한 케이스에서 함께 검증하지 않습니다.
- 데이터베이스를 모킹하지 않습니다. 메모리 내 Node SQLite 인스턴스는 빠르고 실제 SQL/조인을 검증합니다.
- 픽스처는 최소한으로 유지하되 관계(게임 → 퍼블리셔, 게임 → 카테고리)를 대표하도록 구성합니다.
- 스키마 변경으로 테스트가 깨지면 `npm run db:generate`로 마이그레이션을 다시 생성하고 픽스처를 업데이트합니다.
