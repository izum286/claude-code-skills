# clarify-spec

**Automatische Auftragsklärung für Claude Code**

[![Claude Code Skill](https://img.shields.io/badge/Claude%20Code-Skill-blue)](https://github.com/anthropics/skills)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Problem

Du gibst Claude einen vagen Auftrag → Claude rät was gemeint ist → Ergebnis passt nicht → Nacharbeit und Frustration.

```
User: "Mach den Export besser"
Claude: *implementiert irgendwas*
User: "Das meinte ich nicht..."
```

## Lösung

Dieser Skill **aktiviert sich automatisch** bei vagen Aufträgen und stellt gezielte Rückfragen BEVOR Code geschrieben wird.

```
User: "Mach den Export besser"
Claude: "Kurze Rückfrage:
         1. Welchen Export? (PPTX / Markdown / beide)
         2. Was genau stört dich am aktuellen Export?
         (Oder sag 'mach einfach')"
User: "PPTX, das Logo fehlt"
Claude: "Präzisierter Auftrag:
         Ziel: Logo zum PPTX-Export hinzufügen
         Datei: presentationBuilder.ts
         Soll ich loslegen?"
```

## Installation

### Option 1: Manuell kopieren
```bash
cp -r clarify-spec ~/.claude/skills/
```

### Option 2: Git clone
```bash
cd ~/.claude/skills
git clone https://github.com/Svenja-dev/claude-code-skills.git
# Dann clarify-spec Ordner nutzen
```

## Aktivierung

### Automatisch (empfohlen)

Der Skill aktiviert sich **automatisch** bei:

| Signal | Beispiel |
|--------|----------|
| Kurzer Auftrag (<20 Wörter) | "Mach den Export besser" |
| Keine Dateinamen | "Optimiere die Performance" |
| Vage Verben | besser, optimieren, fixen, machen |
| Unsichere Sprache | irgendwie, vielleicht, mal eben |

### Manuell

```
/clarify
/spec
/was-genau
```

## Workflow

```
┌─────────────────────────────────────────────────┐
│ 1. VAGHEITS-CHECK                               │
│    Auftrag < 20 Wörter? Keine Dateinamen?       │
│              ↓                                  │
│ 2. KONTEXT SAMMELN (still)                      │
│    Relevante Dateien, CLAUDE.md prüfen          │
│              ↓                                  │
│ 3. RÜCKFRAGEN (2-4)                             │
│    Was genau? Wo? Erfolgskriterium?             │
│              ↓                                  │
│ 4. STRUKTURIERTER AUFTRAG                       │
│    Ziel, Scope, Erfolgskriterien                │
│              ↓                                  │
│ 5. BESTÄTIGUNG                                  │
│    ja → Ausführen                               │
└─────────────────────────────────────────────────┘
```

## Escape Hatches

Du kannst die Klärung überspringen:

- `"Mach einfach"`
- `"Entscheide selbst"`
- `"Keine Rückfragen"`

## Philosophie

> **LIEBER EINMAL ZU OFT NACHFRAGEN als falsch implementieren.**

Der Skill ist absichtlich aggressiv konfiguriert. Wenn dir das zu viel ist, nutze "mach einfach".

## Lizenz

MIT License

## Autor

Dresden AI Insights
[dresdenaiinsights.com](https://www.dresdenaiinsights.com)
