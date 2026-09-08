## ADDED Requirements

### Requirement: Actions are pinned by commit
Every third-party GitHub Action SHALL be referenced by a full commit SHA with a trailing version comment; floating tags or branches SHALL fail the workflow lint.

#### Scenario: Floating tag rejected
- **WHEN** a workflow references `actions/checkout@v4`
- **THEN** the workflow-lint job fails naming the file and line

### Requirement: Workflows run with least privilege and without expression injection
Workflows SHALL declare `permissions: {}` at the top level and grant per job only what that job uses; `id-token: write` SHALL exist only on a deploy job. Values from `vars`, `secrets`, and event payloads SHALL reach shell steps only through `env:`.

#### Scenario: Variable used in shell
- **WHEN** a step contains `${{ vars.ANY }}` inside its `run:` text
- **THEN** the workflow lint fails

#### Scenario: CI job cannot write
- **WHEN** a CI job's token is inspected
- **THEN** it has `contents: read` and nothing else

### Requirement: Deploy credentials are single-purpose
The rsync deploy SHALL require a pinned host key and SHALL use a key restricted to write-only synchronization of the static directory; the AWS deploy role SHALL trust only the `main` branch (and the `production` environment) of the repository by default; the reference bucket SHALL NOT be force-destroyable by default and SHALL have default encryption.

#### Scenario: Missing host key
- **WHEN** `STATIC_DEPLOY_TARGET=rsync` and `RSYNC_HOST_KEY` is unset
- **THEN** the run fails before any connection with instructions for obtaining the key

#### Scenario: Feature branch cannot assume the role
- **WHEN** a workflow on a non-`main` ref requests the deploy role with the module's default trust policy
- **THEN** STS denies the assumption

### Requirement: Toolchain versions are pinned and enforced
The repository SHALL declare one Node version (`.nvmrc`) enforced by `engine-strict` in every app, install dependencies without lifecycle scripts unless an app explicitly needs them, and require PHP dependencies on tagged releases with a declared PHP platform.

#### Scenario: Wrong Node version
- **WHEN** `npm ci` runs under a Node major other than the pinned one
- **THEN** the install fails with an engine error

#### Scenario: Timber on a release
- **WHEN** `composer.json` is read
- **THEN** `timber/timber` resolves to a tagged 2.x release, not a `-dev` branch

### Requirement: CI covers every branch and builds fail closed
CI SHALL run for every pushed branch (or for every pull request plus `main`, never a partial branch list), and a production build of any frontend SHALL fail rather than fall back to fixture data when its API base is unset.

#### Scenario: Worktree branch is tested
- **WHEN** a commit is pushed to `claude/some-task`
- **THEN** the CI workflow runs

#### Scenario: Production without an API base
- **WHEN** the Nuxt project builds with `VERCEL_ENV=production` and no `NUXT_PUBLIC_WP_API_BASE`
- **THEN** the build exits non-zero and nothing is deployed
