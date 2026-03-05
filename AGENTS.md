# AGENTS.md - Synkra AIOS (Codex CLI)

Este arquivo define as instrucoes do projeto para o Codex CLI.

<!-- AIOS-MANAGED-START: core -->
## Core Rules

1. Siga a Constitution em `.aios-core/constitution.md`
2. Priorize `CLI First -> Observability Second -> UI Third`
3. Trabalhe por stories em `docs/stories/`
4. Nao invente requisitos fora dos artefatos existentes
<!-- AIOS-MANAGED-END: core -->

<!-- AIOS-MANAGED-START: quality -->
## Quality Gates

- Rode `npm run lint`
- Rode `npm run typecheck`
- Rode `npm test`
- Atualize checklist e file list da story antes de concluir
<!-- AIOS-MANAGED-END: quality -->

<!-- AIOS-MANAGED-START: codebase -->
## Project Map

- Core framework: `.aios-core/`
- CLI entrypoints: `bin/`
- Shared packages: `packages/`
- Tests: `tests/`
- Docs: `docs/`
<!-- AIOS-MANAGED-END: codebase -->

<!-- AIOS-MANAGED-START: commands -->
## Common Commands

- `npm run sync:ide`
- `npm run sync:ide:check`
- `npm run sync:skills:codex`
- `npm run sync:skills:codex:global` (opcional; neste repo o padrao e local-first)
- `npm run validate:structure`
- `npm run validate:agents`
<!-- AIOS-MANAGED-END: commands -->

<!-- AIOS-MANAGED-START: shortcuts -->
## Agent Shortcuts

Preferencia de ativacao no Codex CLI:
1. Use `/skills` e selecione `aios-<agent-id>` vindo de `.codex/skills` (ex.: `aios-architect`)
2. Se preferir, use os atalhos abaixo (`@architect`, `/architect`, etc.)

Interprete os atalhos abaixo carregando o arquivo correspondente em `.aios-core/development/agents/` (fallback: `.codex/agents/`), renderize o greeting via `generate-greeting.js` e assuma a persona ate `*exit`:

- `@architect`, `/architect`, `/architect.md` -> `.aios-core/development/agents/architect.md`
- `@dev`, `/dev`, `/dev.md` -> `.aios-core/development/agents/dev.md`
- `@qa`, `/qa`, `/qa.md` -> `.aios-core/development/agents/qa.md`
- `@pm`, `/pm`, `/pm.md` -> `.aios-core/development/agents/pm.md`
- `@po`, `/po`, `/po.md` -> `.aios-core/development/agents/po.md`
- `@sm`, `/sm`, `/sm.md` -> `.aios-core/development/agents/sm.md`
- `@analyst`, `/analyst`, `/analyst.md` -> `.aios-core/development/agents/analyst.md`
- `@devops`, `/devops`, `/devops.md` -> `.aios-core/development/agents/devops.md`
- `@data-engineer`, `/data-engineer`, `/data-engineer.md` -> `.aios-core/development/agents/data-engineer.md`
- `@ux-design-expert`, `/ux-design-expert`, `/ux-design-expert.md` -> `.aios-core/development/agents/ux-design-expert.md`
- `@squad-creator`, `/squad-creator`, `/squad-creator.md` -> `.aios-core/development/agents/squad-creator.md`
- `@aios-master`, `/aios-master`, `/aios-master.md` -> `.aios-core/development/agents/aios-master.md`
<!-- AIOS-MANAGED-END: shortcuts -->


---

## Available Skills

| Skill | Path | Description |
|-------|------|-------------|
| `aios-god-mode` | `.codex/skills/aios-god-mode/SKILL.md` | The Supreme AIOS Operator — creates, configures, and orchestrates everything in Synkra AIOS. Creates agents, tasks, workflows, squads, templates, checklists, rules, and data files. Operates all 11 agents, 207+ tasks, 15 workflows. Enforces Constitutional governance, story lifecycle, and delegation matrix. Activates when users mention AIOS, agents, stories, epics, workflows, sprints, quality gates, creating components, or any development orchestration task. |

To use a skill, read the SKILL.md file at the path indicated above.
