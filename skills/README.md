# Claude Code Skills

Installierte Skills fuer erweiterte Funktionalitaet in Claude Code Sessions.

## Installierte Skills (6)

### 1. Continual Learning for AI Agents
**Verzeichnis:** `continual-learning/learning-capture/`
**Zweck:** Lernt aus deinen Sessions und erstellt wiederverwendbare Patterns

**Wann verwenden:**
- Nach Abschluss komplexer Aufgaben, die sich wiederholen koennten
- Wenn du 2-3x aehnliche Probleme geloest hast
- Um Domain-Wissen zwischen Sessions zu konservieren
- Effektive Reasoning-Patterns dokumentieren

**Aufruf:**
```
Use the learning-capture skill to analyze this session and capture reusable patterns
```

**ROI:** Spart 500+ Tokens pro Wiederverwendung bei 10+ zukuenftigen Einsaetzen

---

### 2. Token Budget Advisor
**Verzeichnis:** `token-budget-advisor/token-budget-advisor/`
**Zweck:** Optimiert Token-Nutzung und verhindert Context-Overflow

**Wann verwenden:**
- Vor grossen Refactorings oder Multi-File-Operations
- Wenn Sessions langsam werden (Kontext-Limit naehert sich)
- Bei der Arbeit mit grossen Codebases
- Um Read/Grep/Tool-Call-Strategien zu optimieren

**Aufruf:**
```
Use the token-budget-advisor skill to analyze my current context usage
```

**Nutzen:** Verhindert Kontext-Overflow, optimiert Tool-Calls, schnellere Sessions

---

### 3. Security Analyzer
**Verzeichnis:** `security-analyzer/skill-security-analyzer/`
**Zweck:** Scannt Code auf Sicherheitsluecken (OWASP Top 10, XSS, SQL Injection)

**Wann verwenden:**
- Vor Deployment zu Production
- Nach groesseren Features (Auth, API, Datenbank)
- Bei Third-Party-Dependency-Updates
- Code-Review vor Git-Commit

**Aufruf:**
```
Use the skill-security-analyzer to scan this React app for vulnerabilities
```

**Prueft:** XSS, CSRF, SQL Injection, Insecure Dependencies, Hardcoded Secrets, API Security

---

### 4. Documentation Generator
**Verzeichnis:** `doc-generator/skill-doc-generator/`
**Zweck:** Generiert automatisch README.md, API-Docs, Code-Dokumentation

**Wann verwenden:**
- Nach Abschluss eines Features
- Fuer neue Projekte (initialer README)
- Wenn APIs sich aendern
- Vor PR/Code-Sharing

**Aufruf:**
```
Use the skill-doc-generator to create comprehensive documentation for this project
```

**Erstellt:** README.md, API-Dokumentation, Code-Kommentare, Dependency-Dokumentation

---

### 5. Project Development Methodology (NEU)
**Verzeichnis:** `project-development/`
**Zweck:** End-to-End LLM-Projekt Design von Ideation bis Deployment

**Wann verwenden:**
- Neues Projekt starten das LLM-Processing nutzen koennte
- Evaluieren ob Task besser mit LLM oder traditionellem Code loesbar
- Pipeline-Architektur designen fuer Batch-Processing
- Kosten und Timelines fuer LLM-Projekte schaetzen

**Aufruf:**
```
Use the project-development skill to design this LLM-powered feature
```

**Kern-Konzepte:**
- Task-Model Fit Recognition (LLM-geeignet vs. nicht)
- Manual Prototype Step (vor Automation validieren)
- Staged Pipeline: `acquire -> prepare -> process -> parse -> render`
- File System as State Machine
- Cost Estimation: `Items x Tokens x Preis + 20% Buffer`

**Quelle:** github.com/muratcankoylan/Agent-Skills-for-Context-Engineering

---

### 6. Multi-Agent Architecture Patterns (NEU)
**Verzeichnis:** `multi-agent-patterns/`
**Zweck:** Design von Multi-Agent Systemen fuer komplexe Tasks

**Wann verwenden:**
- Single-Agent Context-Limits werden ueberschritten
- Tasks zerlegen sich natuerlich in parallele Subtasks
- Verschiedene Subtasks brauchen verschiedene Tool-Sets
- Produktion Agent-Systeme mit mehreren spezialisierten Komponenten

**Aufruf:**
```
Use the multi-agent-patterns skill to design this multi-agent system
```

**Architektur-Patterns:**
| Pattern | Wann verwenden |
|---------|----------------|
| Supervisor/Orchestrator | Komplexe Tasks mit klarer Zerlegung |
| Peer-to-Peer/Swarm | Flexible Exploration, emergente Loesungen |
| Hierarchical | Grosse Projekte mit Abstraktions-Layern |

**Kritische Konzepte:**
- Context Isolation (Hauptgrund fuer Multi-Agent)
- Token Economics: Multi-Agent = ~15x Baseline Tokens
- Anti-Telephone-Game: Direct forward statt Paraphrasierung
- Failure Mode Mitigations: Bottleneck, Divergenz, Error Propagation

**Quelle:** github.com/muratcankoylan/Agent-Skills-for-Context-Engineering

---

## Verwendung

### Methode 1: Expliziter Skill-Aufruf
```
Use the [skill-name] skill to [task]
```

### Methode 2: Skill-Tool (falls verfuegbar)
```
/skill learning-capture
```

### Methode 3: Kontextbasiert
Claude Code erkennt automatisch, wann ein Skill nuetzlich ist und schlaegt ihn vor.

---

## Skill-Struktur

Jeder Skill folgt diesem Format:
```
skill-name/
├── SKILL.md          # Hauptanweisungen (Frontmatter + Content)
├── LICENSE.txt       # Lizenz
├── references/       # Zusaetzliche Dokumentation
└── scripts/          # Hilfsskripte (optional)
```

---

## Best Practices

### Planungs-Phase
1. **project-development** vor jedem neuen LLM-Feature
   - Task-Model Fit pruefen
   - Pipeline-Architektur planen
   - Kosten schaetzen

2. **multi-agent-patterns** bei komplexen Systemen
   - Context Isolation designen
   - Failure Modes antizipieren

### Entwicklungs-Phase
3. **Token Budget Advisor** vor grossen Operations
   - Verhindert Session-Crashes
   - Optimiert Tool-Nutzung

4. **Security Analyzer** vor Production-Deploys
   - Minimiert Security-Risiken
   - Compliance-Check

### Abschluss-Phase
5. **Doc Generator** nach Feature-Completion
   - Haelt Dokumentation aktuell
   - Erleichtert Onboarding

6. **Learning Skill** nach jeder Session mit Novel Approaches
   - Dokumentiert Entscheidungen
   - Baut wiederverwendbare Patterns auf

---

## Installationsdatum

- **Continual Learning:** 2025-11-01
- **Token Budget Advisor:** 2025-11-01
- **Security Analyzer:** 2025-11-01
- **Documentation Generator:** 2025-11-01
- **Project Development:** 2025-12-27
- **Multi-Agent Patterns:** 2025-12-27

---

## Troubleshooting

**Skill wird nicht erkannt:**
1. Ueberpruefe SKILL.md Format (Frontmatter vorhanden?)
2. Ueberpruefe Verzeichnisstruktur
3. Claude Code neu starten

**Skill-Fehler:**
1. Logs pruefen: `C:\Users\Anwender\.claude\debug\`
2. Skill-Verzeichnis-Permissions pruefen

---

**Version:** 2.0
**Letztes Update:** 2025-12-27
**Plattform:** Windows 11, Claude Code
