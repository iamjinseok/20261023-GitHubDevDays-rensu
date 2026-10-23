# Tailspin Toys 크라우드 펀딩 개발 지침

게임을 위한 크라우드 펀딩 플랫폼이며 개발자 테마를 사용합니다. 애플리케이션은 **Tailwind CSS v4**로 스타일을 적용한 단일 **Astro 7** 사이트(완전 프리렌더링/정적 출력)입니다. 데이터는 로컬 SQLite 데이터베이스에 저장되며, 빌드 시점에 **Drizzle ORM + Node.js 내장 SQLite 드라이버**로 접근합니다. 페이지는 프런트매터에서 데이터베이스를 직접 쿼리하며, 별도의 백엔드 API나 클라이언트 측 UI 프레임워크는 없습니다. 기여할 때 다음 지침을 따르세요.

## 에이전트 참고 사항

- 코드를 생성하기 전에 프로젝트를 먼저 살펴봅니다
- 긴 작업에는 할 일 목록을 만듭니다
  - 할 일 목록의 각 단계를 시작하기 전에 지침을 다시 읽고 올바른 방향인지 확인합니다
- 지침 파일이 있으면 항상 사용하고, 코드를 생성하기 전에 검토합니다
- 작업을 마친 뒤 요약 마크다운 파일을 만들지 않습니다
- 스크립트와 BASH 명령을 실행할 때는 항상 절대 경로를 사용합니다
- **명시적으로 지시받지 않는 한 main에 자동으로 커밋하거나 푸시하지 않습니다**

## 코드 표준

### 커밋 전 필수 사항

#### 테스트 지침

- **단위 테스트, 린트, 타입 검사는 항상 `quality-checks` 스킬로 실행합니다.** 이 스킬은 `npm run test:unit`, `npm run lint`, `npm run typecheck:all`을 환경 설정, 실행 순서, 문제 해결 방법과 함께 묶어 줍니다. Playwright E2E 테스트는 `npm run test:e2e`로 직접 실행합니다. (수동 검증을 위해 앱을 시작하는 것은 품질 검사가 아니므로 `npm run dev`를 직접 실행합니다.)
- 데이터 계층과 변환 로직은 Vitest 단위 테스트로, E2E와 프런트엔드 기능은 Playwright 테스트로 검증합니다
- 커밋하기 전에 ESLint를 실행하여 프런트엔드 코드 품질을 확인합니다
- 작업이 중복되지 않도록 기존 테스트를 먼저 검토합니다
- 테스트 코드도 프로젝트의 다른 코드와 동일한 품질을 유지하고 DRY 원칙을 따릅니다
- 프런트엔드를 변경할 때는 빌드(`npm run build`)를 확인하고 E2E 테스트(`npm run test:e2e`)를 직접 실행하여 모든 것이 올바르게 동작하는지 확인합니다
- 데이터 계층(스키마, 헬퍼, 변환)을 변경할 때는 해당 단위 테스트를 업데이트하고 실행합니다

#### 프로젝트 지침

- 데이터베이스 스키마를 업데이트할 때는 drizzle-kit 마이그레이션을 생성하고(`npm run db:generate`) 커밋합니다
- 새 기능을 추가할 때는 README를 업데이트합니다
- 프로젝트 구조, 스크립트, 프로그래밍 지침 등 관련 변경 사항이 있으면 이 Copilot 지침 파일의 모든 안내를 함께 업데이트합니다

### 코드 서식 요구 사항

- TypeScript를 사용하며, 특히 데이터 계층(`db/`, `src/lib/`)에서는 함수 매개 변수와 반환값에 명시적 타입을 지정합니다
- 프런트엔드 코드(TypeScript, Astro)는 ESLint 검사(`npm run lint`)를 통과해야 합니다
- All new TypeScript should contain TSDocs comments for documentation purposes.

### 데이터 계층 패턴 (Drizzle + Node SQLite)

- 테이블은 `db/schema.ts`에 정의하고, 스키마 변경은 drizzle-kit 마이그레이션으로 관리합니다 - `drizzle.instructions.md` 참조
- 데이터 액세스 헬퍼는 테스트할 수 있도록 **주입 가능한 `db`** 인수를 받게 하여 `src/lib/`에 둡니다
- CSV/시드 로직은 `db/transforms.ts`의 순수 함수로 유지합니다
- 정적 빌드가 재현되도록 시드에서 파생되는 값은 결정적이어야 합니다(`Math.random` 금지)

### Astro 패턴

- **Astro 페이지/구성 요소**: 라우팅, 레이아웃, 콘텐츠, 구성 요소는 모두 `.astro`로 작성합니다 - `astro.instructions.md` 참조
- 페이지 프런트매터에서 `src/lib/` 헬퍼로 데이터를 직접 쿼리합니다(빌드 시점, 정적 출력)
- 동적 라우트는 `getStaticPaths()`와 `export const prerender = true`를 사용합니다
- 브랜드가 적용된 `404.astro`를 제공합니다(정적 출력에서는 알 수 없는 경로가 실제 404가 됩니다)
- 실제 클라이언트 상호 작용이 필요할 때만 범위가 지정된 Astro `<script>`를 추가합니다

### 스타일링

- Tailwind CSS 유틸리티 클래스만 사용합니다 - `style.instructions.md` 참조
- 다크 테마 색상: slate 팔레트(`bg-slate-800`, `text-slate-100` 등)
- 둥근 모서리와 현대적인 UI 패턴
- 깔끔하고 접근성 있는 인터페이스로 최신 UI/UX 원칙을 따릅니다

### GitHub Actions 워크플로

- 좋은 보안 사례를 따릅니다
- 워크플로 권한을 명시적으로 설정합니다
- 수행하는 작업을 설명하는 주석을 추가합니다

## npm 명령

- 개발 명령은 `package.json`에 정의되어 있습니다. 사이트에는 Astro를, 데이터베이스 설정에는 `db/`의 TypeScript 작업을 실행합니다.
- **스킬이 우선합니다.** 명령을 직접 실행하기 전에 해당 작업을 다루는 스킬이 있는지 확인합니다(예: `quality-checks` 스킬은 단위 테스트, 린트, 타입 검사를 묶어 줍니다). 적용되는 스킬이 있으면 그것을 따릅니다.
- 주요 npm 스크립트:
  - `npm run dev` — Astro 개발 서버 시작(`predev`가 로컬 SQLite 데이터베이스를 마이그레이션하고 시드)
  - `npm run build` — 정적 사이트 빌드(`prebuild`가 로컬 SQLite 데이터베이스를 마이그레이션하고 시드)
  - `npm run preview` — 빌드된 `dist/` 출력 제공
  - `npm run lint` — ESLint
  - `npm run test:unit` — Vitest 단위 테스트
  - `npm run test:e2e` — Playwright E2E 테스트(먼저 빌드하고 미리 보기 실행)
  - `npm run typecheck` — `tsconfig.tsgo.json`을 사용해 `tsgo`(`@typescript/native-preview`의 TypeScript 7 네이티브 컴파일러)로 순수 TypeScript 타입 검사
  - `npm run typecheck:astro` — `astro check`(기존 TypeScript 패키지)로 `.astro` 파일 타입 검사
  - `npm run typecheck:all` — 두 타입 검사 스크립트를 모두 실행(CI `type-check` 작업에서 사용)
  - `npm run db:generate` / `db:migrate` / `db:seed` / `db:setup` — Drizzle 스키마/마이그레이션/시드 작업
  - `npm run db:export` — `predb:export`로 마이그레이션 및 시드한 뒤 카탈로그 그라운딩 파일을 `db/catalog.json`에 작성

> [!NOTE]
> TypeScript 7(`tsgo`)은 타입 검사에만 **나란히** 도입되었으며 린트에는 영향을 주지 않습니다. 네이티브 컴파일러의 API가 아직 준비되지 않았으므로 ESLint + `typescript-eslint`와 `astro check`는 여전히 기존 `typescript` 패키지(v6 유지)를 사용합니다. `typescript-eslint`와 `@astrojs/check`가 네이티브 API를 지원하기 전까지 기존 `typescript` 패키지를 7로 올리지 **마세요**(Dependabot `ignore`로 막혀 있습니다). `tsgo`는 `--noEmit` 전용이며 사이트는 여전히 `astro build`로 빌드합니다.

## 리포지토리 구조

애플리케이션은 리포지토리 루트에 있습니다.

- `db/`: Drizzle 스키마, 마이그레이션, 변환, 시드, `games.csv`
- `src/lib/`: Node SQLite 클라이언트(`db.ts`), 데이터 액세스 헬퍼(`games.ts`), 순수 헬퍼(카테고리/퍼블리셔 필터링용 `filters.ts`, `ratings.ts`)
- `src/components/`: 재사용 가능한 `.astro` 구성 요소
- `src/layouts/`: Astro 레이아웃 템플릿
- `src/pages/`: Astro 페이지 라우트(`index.astro` 목록, `game/[id].astro`, `404.astro`, `about.astro`)
- `src/styles/`: CSS 및 Tailwind 구성
- `src/types/`: TypeScript 인터페이스(Game, Publisher, Category)
- `e2e-tests/`: Playwright E2E 테스트(홈, 게임, 필터, 접근성)
- `.github/instructions/`: 파일 유형별 Copilot 지침
- `.github/skills/`: 에이전트 스킬(`quality-checks`, `make-contribution`)
- `.github/agents/`: 사용자 지정 에이전트 프로필(`qa.agent.md`)
- `drizzle.config.ts`, `vitest.config.ts`, `astro.config.mjs`, `playwright.config.ts`: 도구 구성
- `README.md`: 프로젝트 문서
