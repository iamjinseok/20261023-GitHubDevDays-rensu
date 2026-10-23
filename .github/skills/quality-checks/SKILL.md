---
name: quality-checks
description: 이 프로젝트의 단위 테스트(Vitest), 린트(ESLint), 타입 검사(tsgo + astro check)를 실행하고, 커밋·푸시·머지 전에 실패를 디버깅하는 방법을 안내합니다. npm run test:unit, npm run lint, npm run typecheck:all을 실행할 때 이 스킬을 사용하세요.
allowed-tools:
  - shell
---

# 품질 검사 (Quality Checks)

이 스킬은 단일 Astro 애플리케이션(Astro 7 + Drizzle ORM/Node SQLite)의 단위 테스트, 린트, 타입 검사를 실행합니다. `package.json`에 정의된 npm 명령을 리포지토리 루트에서 실행하세요.

## 빠른 참조

| 검사 | 명령 | 사용 시점 |
| --- | --- | --- |
| 단위 테스트 (Vitest) | `npm run test:unit` | 데이터 계층 / 변환 / 헬퍼를 변경한 후 |
| 린트 (ESLint) | `npm run lint` | TypeScript 또는 Astro를 변경한 후 |
| 타입 검사 (tsgo + astro check) | `npm run typecheck:all` | TypeScript 또는 Astro를 변경한 후 |

모든 명령은 의존성이 설치되어 있다고 가정합니다(`npm ci`).

---

## 단위 테스트, 린트, 타입 검사 실행

### 단위 테스트

```bash
npm run test:unit
```

- `db/**/*.test.ts`와 `src/**/*.test.ts`에 대해 Vitest(`vitest run`)를 실행합니다.
- 순수 시드/변환 함수와, 인메모리 Node SQLite 데이터베이스를 사용하는 Drizzle 데이터 접근 헬퍼를 검증합니다.

### 린트

```bash
npm run lint
```

- 프로젝트의 모든 TypeScript 및 Astro 파일에 ESLint를 실행합니다.
- 커밋 전에 오류가 0개여야 합니다.

### 타입 검사

```bash
npm run typecheck:all
```

- `npm run typecheck`는 네이티브 **TypeScript 7** 컴파일러(`tsgo`, `@typescript/native-preview` 제공)로 순수 TypeScript(`db/`, `src/lib/`, `src/types/`, 설정 파일, 테스트)를 `tsconfig.tsgo.json`(`--noEmit`) 기준으로 검사합니다.
- `npm run typecheck:astro`는 `astro sync`를 실행한 뒤 `.astro` 파일에 `astro check`를 실행합니다(기존 `typescript` 패키지 사용).
- 타입 검사는 린트와 별개입니다. `tsgo`는 ESLint에 영향을 주지 않으며, ESLint는 여전히 기존 `typescript` 패키지를 사용합니다. 커밋 전에 둘 다 오류가 0개여야 합니다.

---

## 디버깅 및 문제 해결

### 환경 / 설정 실패

**증상**: `command not found`, 모듈 누락, `Cannot find package`.

```bash
npm ci
```

- Node 22.13 이상이 사용 가능한지 확인합니다: `node --version`.
- 에디터/타입 오류가 누락된 Astro 생성 타입을 가리키면 `npx astro sync`를 실행합니다.

---

### 데이터베이스 / 빌드 시점 데이터

**증상**: 빈 페이지, `no such table`, 게임 페이지가 생성되지 않는 빌드.

SQLite 데이터베이스는 `astro build` **이전에** 마이그레이션과 시드가 되어 있어야 합니다. `npm run build` 또는 `npm run dev`를 사용하면 `prebuild`와 `predev` npm 훅이 `db/`의 TypeScript 마이그레이션 및 시드 작업을 자동으로 실행합니다. 데이터베이스만 따로 설정하려면 다음을 실행합니다.

```bash
npm run db:setup     # db:migrate + db:seed
```

- 데이터베이스는 `tailspin.db`(gitignore 대상)에 있으며 `db/games.csv`에서 다시 생성됩니다.
- 깨끗하게 다시 빌드하려면: `rm -f tailspin.db && rm -rf dist && npm run build`.

---

### 단위 테스트 실패

**증상**: `npm run test:unit`에서 단언(assertion) 실패.

1. **실패한 단언을 읽습니다** — Vitest가 기대값과 실제값을 인라인으로 출력합니다.
2. **인메모리 데이터베이스**: 헬퍼 테스트는 테스트마다 새로운 `:memory:` Node SQLite 데이터베이스를 만들고, 마이그레이션을 실행하고, 픽스처를 시드합니다. 스키마 변경이 반영되지 않았다면 `npm run db:generate`로 마이그레이션을 다시 생성합니다.
3. **결정성**: 별점은 제목의 안정적인 해시(`ratingFromTitle`)에서 도출되며 `Math.random`은 절대 사용하지 않습니다. 별점 단언이 간헐적으로 실패한다면 대개 비결정적 데이터가 섞여 들어온 것입니다.

단일 파일 실행:

```bash
npx vitest run src/lib/games.test.ts
```

---

### 린트 실패

**증상**: `npm run lint`에서 ESLint 오류.

1. **안전한 문제는 자동 수정**: `npm run lint -- --fix`.
2. **사용하지 않는 변수**: 의도적으로 사용하지 않는 식별자에는 `_` 접두사를 붙입니다.
3. **TypeScript 타입 오류**: 누락된 타입 어노테이션을 추가하거나 잘못된 타입을 수정합니다.
4. **`--fix` 이후에도 남은 오류**: 직접 해결합니다. 정당한 사유 없이 `eslint-disable`로 억제하지 마세요.

---

### 로컬과 CI의 차이

**증상**: 단위 테스트, 린트, 타입 검사가 로컬에서는 통과하지만 CI에서는 실패(또는 그 반대).

- **Node 버전 불일치**: CI는 현재 Node LTS 릴리스를 사용합니다.
- **데이터베이스 상태**: CI는 항상 깨끗한 시드에서 빌드합니다. 로컬에서 오래된 데이터가 의심되면 `tailspin.db`를 삭제하고 다시 빌드합니다.

---

## 검증 정책

### 커밋/머지 전에 단위 테스트, 린트, 타입 검사가 통과해야 합니다

- 변경 사항을 커밋하기 전에 기존 단위 테스트, 린트, 타입 검사가 모두 통과해야 합니다
- 명시적인 사유 없이 단위 테스트를 건너뛰거나 비활성화하지 마세요
- 단위 테스트, 린트, 타입 검사 실패는 머지를 막습니다 — 무시하지 말고 수정하세요
- 변경된 코드의 테스트만이 아니라 전체 단위 테스트 스위트를 실행하세요
- 새 기능에는 적절한 단위 테스트 커버리지가 포함되어야 합니다

> [!NOTE]
> 이 스킬은 단위 테스트, 린트, 타입 검사의 **실행, 검증, 디버깅**을 다룹니다. 단위 테스트 코드를 **작성하는 방법**(구조, 픽스처, 명명, 품질 기준)은 지침 파일을 따르세요. 지침 파일이 유일한 기준(single source of truth)입니다.
> - 단위 테스트(`**/*.test.ts`): [unit-tests.instructions.md](../../instructions/unit-tests.instructions.md)

---

## 커밋 전 체크리스트

1. (프런트엔드 파일이 변경된 경우) 린트 실행: `npm run lint`
2. (TypeScript / Astro 파일이 변경된 경우) 타입 검사 실행: `npm run typecheck:all`
3. (데이터 계층 / 헬퍼가 변경된 경우) 단위 테스트 실행: `npm run test:unit`
4. 새 기능에 적절한 단위 테스트 커버리지가 있는지 확인
5. 깨지거나, 건너뛰거나, 비활성화된 단위 테스트가 없는지 확인

## 결과 출력 형식
완료되면 실행한 각 명령과 그 결과(통과, 실패, 차단)를 보고하세요. 테스트 수, 소요 시간, 오류, 경고 등 기타 지표는 도구가 보고한 경우에만 포함하세요. 실패나 차단 사항에는 다음 조치를 명시하고, 건너뛰었거나 완료되지 않은 검사를 통과했다고 설명하지 마세요.
