# Career Goal Definition

## Project

Haaland Road to 1000

## Methodology Version

1.0

## Primary Definition

For this project, a career goal is defined as:

> A goal scored by Erling Haaland in an official senior match for a senior club first team or the senior Norway national team.

The application is designed to make this methodology configurable in future versions.

## Included

The default methodology includes goals scored in official senior matches for:

- Senior club first teams
- Senior Norway national team
- Domestic league competitions
- Official domestic cup competitions
- Official continental club competitions
- Official senior international competitions
- Official senior international qualification matches
- Other officially recognized senior competitive matches when supported by authoritative sources

## Excluded

The default methodology excludes:

- Youth-team goals
- Reserve-team goals
- Academy goals
- Norway youth international goals
- Unofficial exhibition matches
- Unofficial training matches
- Penalty shootout conversions
- Own goals credited to another player

## Friendly Matches

Club friendly goals are excluded from the default career total.

Senior international friendly goals may be included when the match is officially recognized as a senior international by the relevant football authorities.

This distinction must be supported by source evidence.

## Penalty Shootouts

Goals scored during a penalty shootout are excluded.

A penalty scored during normal time or extra time is counted as a goal when officially credited to Erling Haaland.

## Abandoned Matches

Goals from abandoned matches are counted only if the relevant governing body officially preserves the match statistics.

If the statistical status is uncertain, the record must remain unverified until authoritative confirmation is available.

## Own Goals

Own goals are excluded unless the official match record credits the goal to Erling Haaland.

The project's own interpretation of video footage must never override the official attribution.

## Duplicate Records

Each goal must have one canonical record.

Duplicate detection should consider:

- goal number
- match ID
- date
- club
- opponent
- competition
- minute

Potential duplicates must be reviewed before publication.

## Missing Information

Missing attributes must be stored as `null`.

The project must never infer or fabricate:

- assist
- body part
- goal type
- minute
- shot location
- expected goals
- source information

## Verification

A goal may be marked `verified: true` only when sufficient source evidence exists.

Preferred source hierarchy:

1. Official club source
2. Official national association source
3. Official competition source
4. Reliable statistical provider
5. Reputable news organization
6. Secondary football database

## Source of Truth

The canonical goal dataset is the source of truth for all derived statistics.

The application must calculate:

- total career goals
- club goals
- international goals
- season totals
- competition totals
- milestone status
- progress toward 1000
- projections

from the dataset rather than manually duplicating totals in the user interface.

## Methodology Changes

If this definition changes:

1. increment the methodology version
2. document the change
3. revalidate the dataset
4. recalculate all derived statistics
5. update the data verification timestamp