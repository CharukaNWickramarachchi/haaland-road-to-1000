# Data Sources

## Purpose

Haaland Road to 1000 uses a source-first verification methodology.

No career total should be published solely because it appears on a secondary
statistics website.

## Source Hierarchy

Sources are preferred in this order:

1. Official club
2. Official national association
3. Official competition organizer
4. Reliable statistical provider
5. Reputable news organization
6. Secondary football database

## Historical Club Verification

### Bryne FK

UEFA records:

- 16 senior appearances
- 0 senior goals

Reserve-team goals are excluded.

### Molde FK

UEFA records:

- 50 senior appearances
- 20 senior goals

This total includes goals scored in UEFA Europa League qualifying.

The project therefore treats official continental qualifying matches as
senior competitive matches.

### FC Red Bull Salzburg

UEFA records:

- 27 appearances
- 29 goals

### Borussia Dortmund

Borussia Dortmund records Haaland's final competitive total as:

- 89 competitive appearances
- 86 goals

### Manchester City

Manchester City's official records are used as the primary source for his
Manchester City career.

The club recorded 162 goals across his first 199 appearances.

Haaland subsequently scored twice against Crystal Palace on 28 August 2026.

This produces a Manchester City reference total of 164 goals through that
match.

## Norway

The Norwegian Football Federation is the authoritative source for senior
international statistics.

As verified on 31 August 2026, the federation records:

- 55 senior international appearances
- 62 senior international goals

Youth international statistics are stored separately by the federation and
are excluded from this project's career-goal definition.

## Reference Baseline

Using the project's methodology, the independently verified aggregate
reference is:

| Team | Goals |
|---|---:|
| Bryne FK | 0 |
| Molde FK | 20 |
| FC Red Bull Salzburg | 29 |
| Borussia Dortmund | 86 |
| Manchester City | 164 |
| Norway | 62 |
| Reference total | 361 |

## Important Dataset Rule

The aggregate reference total is a verification checkpoint, not the
application's primary source of truth.

The production career total must be calculated from the canonical
goal-by-goal dataset.

Until those individual records are populated and validated,
`latestGoalNumber` remains null.

## Verification Date

31 August 2026