---
name: post-deploy-test
description: Autonome Website-Tests nach Deploy. Ruft update_plan auf fuer einmalige Bestaetigung, dann laufen alle Tests autonom. Trigger mit "teste preview", "teste production", oder "/post-deploy-test [URL]"
---

# Post-Deploy Test Skill

Dieser Skill testet eine deployte Website autonom nach einmaliger Bestaetigung.

## Workflow

### Schritt 1: URL ermitteln

Wenn keine URL angegeben:
- **Preview**: Letzte Vercel Preview-URL aus `vercel ls` holen
- **Production**: `https://app.your-product.com`

### Schritt 2: update_plan aufrufen

```
KRITISCH: Vor allen Browser-Aktionen MUSS update_plan aufgerufen werden!

Rufe mcp__claude-in-chrome__update_plan auf mit:
- domains: ["app.your-product.com", "<preview-url>.vercel.app", "localhost:5173"]
- approach:
  - "Startseite laden und Ladezeit pruefen"
  - "Navigation testen (alle Links)"
  - "Console auf Errors pruefen"
  - "Netzwerk-Requests validieren"
  - "Responsive Design testen (Mobile/Desktop)"
  - "Region-Check (DSGVO fra1)"
```

### Schritt 3: Tests ausfuehren (AUTONOM nach Bestaetigung)

Nach einmaliger User-Bestaetigung alle Tests ohne weitere Nachfragen durchfuehren:

#### Test-Checkliste

1. **Startseite laden**
   - URL aufrufen
   - Ladezeit < 3 Sekunden
   - Keine JavaScript-Errors in Console

2. **Navigation testen**
   - Alle sichtbaren Links anklicken
   - Kein 404/500 Error
   - Zurueck zur Startseite

3. **Core Features pruefen**
   - File-Upload Bereich sichtbar
   - Analyse-Button klickbar
   - EmailGate funktioniert (falls vorhanden)

4. **Responsive Design**
   - Desktop (1920x1080) - resize_window
   - Tablet (768x1024) - resize_window
   - Mobile (375x667) - resize_window
   - Keine Layout-Breaks

5. **Console Errors**
   - read_console_messages aufrufen
   - Keine CRITICAL oder ERROR Level
   - Warnungen dokumentieren

6. **Netzwerk-Requests**
   - read_network_requests aufrufen
   - Keine fehlgeschlagenen API-Calls
   - Alle Assets geladen

### Schritt 4: Report erstellen

```markdown
# Post-Deploy Test Report

**URL**: [getestete URL]
**Datum**: [aktuelles Datum]
**Ergebnis**: PASS / FAIL

## Ergebnisse

| Test | Status | Details |
|------|--------|---------|
| Startseite | OK/FAIL | Ladezeit: Xs |
| Navigation | OK/FAIL | X Links geprueft |
| Console | OK/FAIL | X Errors, X Warnings |
| Netzwerk | OK/FAIL | X Requests, X failed |
| Responsive | OK/FAIL | Mobile/Tablet/Desktop |

## Naechste Schritte
[Falls FAIL: Was zu fixen ist]
```

## Beispiel-Aufruf

```
User: teste production
Assistant:
1. Rufe update_plan mit domains: ["app.your-product.com"]
2. [User bestaetigt einmal]
3. Fuehre alle Tests autonom durch
4. Erstelle Report
```

## Wichtige Regeln

1. **IMMER update_plan zuerst** - Sonst fragt jede Aktion nach Bestaetigung
2. **Nach Bestaetigung: AUTONOM** - Keine weiteren Nachfragen
3. **Bei Fehlern: Dokumentieren, nicht abbrechen** - Alle Tests durchfuehren
4. **Report am Ende** - Uebersichtlich, actionable

## Domains fuer update_plan

Standard-Domains die freigegeben werden:
- `app.your-product.com` (Production)
- `*.vercel.app` (Preview Deployments)
- `localhost:5173` (Local Dev)
- `localhost:3000` (Alternative Local)
