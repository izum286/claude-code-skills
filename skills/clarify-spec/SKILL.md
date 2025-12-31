---
name: clarify-spec
description: |
  AKTIVIERT SICH AUTOMATISCH bei vagen Aufträgen. Erkennungsmerkmale: Auftrag <20 Wörter, keine konkreten Dateinamen, vage Verben (besser, optimieren, fixen, machen, ändern, verbessern, anpassen, erweitern). Stellt 2-4 gezielte Rückfragen und gibt strukturierten, bestätigbaren Auftrag aus. LIEBER EINMAL ZU OFT NACHFRAGEN als falsch implementieren. Escape: "mach einfach" überspringt Klärung.
triggers:
  - /clarify
  - /spec
  - /was-genau
  - /präzisieren
---

# Clarify-Spec: Automatische Auftragsklärung

## Wann aktivieren?

**AUTOMATISCH bei diesen Signalen:**

| Signal | Beispiel |
|--------|----------|
| Kurzer Auftrag (<20 Wörter) | "Mach den Export besser" |
| Keine Dateinamen | "Optimiere die Performance" |
| Vage Verben | besser, optimieren, fixen, machen, ändern, verbessern, anpassen |
| Unsichere Sprache | irgendwie, vielleicht, mal eben, schnell, einfach |
| Fehlende Erfolgskriterien | Kein "damit", "sodass", "weil" |

**NICHT aktivieren bei:**
- Konkreter Dateiname genannt
- Klares Ziel mit Erfolgskriterium
- Expliziter Befehl ("mach einfach", "keine Rückfragen")

## Workflow

### Schritt 1: Vagheits-Check

Prüfe jeden Auftrag:

```
☐ Konkrete Datei/Komponente genannt?
☐ Klares Ziel definiert?
☐ Erfolgskriterium erkennbar?
☐ Scope abgegrenzt?
```

**< 3 Haken → Rückfragen stellen!**

### Schritt 2: Kontext sammeln (still)

- Relevante Dateien suchen
- CLAUDE.md/AGENTS.md prüfen
- No-Touch Zones identifizieren

### Schritt 3: Gezielte Rückfragen (2-4)

**Format:**
```
Bevor ich loslege - kurze Rückfrage:

1. [WAS genau soll anders sein?]
2. [WO/Welche Datei ist betroffen?]
3. [Optional: Erfolgskriterium?]

(Oder sag "mach einfach" - dann entscheide ich.)
```

**Fragen-Priorität:**

| Prio | Typ | Frage |
|------|-----|-------|
| 1 | WAS | "Was genau meinst du mit 'besser'?" |
| 2 | WO | "Welche Komponente ist betroffen?" |
| 3 | ERFOLG | "Woran erkenne ich dass es fertig ist?" |
| 4 | BEISPIEL | "Gibt es ein Beispiel/Referenz?" |

### Schritt 4: Strukturierter Auftrag

Nach Antwort ausgeben:

```markdown
## Präzisierter Auftrag

**Ziel:** [1 Satz]

**Scope:**
- Dateien: [Liste]
- Neue Dateien: [Falls nötig]

**Erfolgskriterien:**
- [ ] Kriterium 1
- [ ] Kriterium 2

---
Soll ich loslegen? (ja/nein/anpassen)
```

### Schritt 5: Bestätigung

| Antwort | Aktion |
|---------|--------|
| ja / ok / los | Ausführen |
| nein | Abbrechen |
| anpassen: ... | Modifizieren |
| mach einfach | Mit eigenem Ermessen |

## Beispiele

### Vager Auftrag → Nachfragen

**User:** "Mach den Export besser"

**Claude:**
```
Bevor ich loslege - kurze Rückfrage:

1. Welchen Export meinst du? (PPTX / Markdown / beide)
2. Was genau stört dich am aktuellen Export?

(Oder sag "mach einfach")
```

### Klarer Auftrag → Direkt ausführen

**User:** "Füge in ResultsDisplay.tsx einen Download-Button hinzu der die Analyse als .md speichert"

→ Alle Kriterien erfüllt → Keine Rückfragen nötig.

### Grenzfall → Kurze Nachfrage

**User:** "Füge einen Button hinzu"

**Claude:**
```
Kurze Rückfrage:
1. Welcher Button? (Download, Export, Login...)
2. Wo soll er erscheinen?
```

## Escape Hatches

User kann Klärung überspringen mit:
- "Mach einfach"
- "Entscheide selbst"
- "Keine Rückfragen"
- "Egal, hauptsache X"

→ Mit bestem Wissen ausführen.

## Anti-Pattern

**FALSCH:**
```
User: "Optimiere die Performance"
Claude: *beginnt sofort mit Refactoring*
→ Falsche Annahmen, Nacharbeit
```

**RICHTIG:**
```
User: "Optimiere die Performance"
Claude: "Welche Performance?
1. Ladezeit?
2. API Response?
3. Build-Zeit?
4. Bundle Size?"
```
