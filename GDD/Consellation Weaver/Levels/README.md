# Levels

Level definitions for Constellation Weaver. Each level is a standalone JSON file.

## Contents

- `001_triangulum.json` – `005_lyra.json` — Tutorial tier (3×3, 2–3 waypoints)
- `006_leo.json` – `020_lupus.json` — Chapter 1: Spring Sky (4×4 and 5×5, 3–4 waypoints)
- `manifest.json` — ordered index of all levels with summary metadata

## File format

```json
{
  "id": "001_triangulum",
  "index": 1,
  "chapter": "tutorial",
  "tier": "tutorial",
  "constellation": "Triangulum",
  "hemisphere": "N",
  "best_month": 12,
  "lore": "A small northern triangle, simple and plain, yet named since antiquity.",
  "width": 3,
  "height": 3,
  "waypoints": [
    {"x": 0, "y": 0, "order": 1},
    {"x": 0, "y": 2, "order": 2}
  ],
  "solution": [[0,0],[1,0],[2,0],[2,1],[2,2],[1,2],[1,1],[0,1],[0,2]],
  "designer_notes": {
    "pedagogical_goal": "Introduce finger-drag input with lowest possible difficulty.",
    "estimated_solve_seconds": 10
  }
}
```

## Coordinate system

- Origin `(0, 0)` is **top-left**.
- `x` increases to the right (0..width-1).
- `y` increases downward (0..height-1).
- Movement is 4-connected orthogonal only (no diagonals).

## Field reference

| Field | Type | Description |
|---|---|---|
| `id` | string | Unique level id, matches filename stem |
| `index` | int | 1-based position in campaign order |
| `chapter` | string | `tutorial` or `ch1_spring_sky` etc. |
| `tier` | string | `tutorial`, `easy`, `medium`, `hard`, `expert` |
| `constellation` | string | IAU constellation name |
| `hemisphere` | string | `N`, `S`, or `E` (equatorial) |
| `best_month` | int | 1–12, primary viewing month in hemisphere |
| `lore` | string | ≤120 chars, original writing from public-domain myth sources |
| `width` | int | Grid columns |
| `height` | int | Grid rows |
| `waypoints` | array | List of `{x, y, order}` waypoints. `order` is 1-indexed. |
| `solution` | array | Hamiltonian path as array of `[x, y]` pairs, length = `width * height` |
| `designer_notes.pedagogical_goal` | string | Why this level exists at this position |
| `designer_notes.estimated_solve_seconds` | int | Target solve time for median player |

## Validation rules (any level file must satisfy)

1. `solution.length === width * height`
2. Every cell in `solution` is unique (no revisits)
3. Every consecutive pair in `solution` is 4-adjacent
4. Every waypoint position exists exactly once in `solution`
5. Waypoints appear in `solution` in their declared `order`
6. `solution[0]` equals the position of waypoint with `order === 1`
7. `solution[solution.length - 1]` equals the position of the max-order waypoint

A validator script should check all files against these rules during CI.

## Difficulty progression (levels 1–20)

| Tier | Levels | Grid | Waypoints | Target solve |
|---|---|---|---|---|
| Tutorial | 1–2 | 3×3 | 2 | 10 s |
| Tutorial | 3–5 | 3×3 | 3 | 15 s |
| Easy | 6–13 | 4×4 | 3–4 | 30 s |
| Easy-medium | 14–20 | 5×5 | 4 | 45 s |

## Conventions

- Tutorial constellations are kept simple and recognizable (Triangulum, Sagitta, Delphinus, Lyra).
- Chapter 1 constellations are all spring-sky constellations across northern and southern hemispheres.
- Level index determines unlock order in Journey. A player must solve level N before level N+1 appears.

## How to add a new level

1. Copy an existing level file as a template.
2. Rename to `NNN_constellation_name.json` (zero-padded index, snake-case).
3. Fill in metadata, grid size, waypoints, and solution.
4. Verify against validation rules manually or via the validator script.
5. Add an entry to `manifest.json` at the correct index position.
6. Ensure `index` matches the entry position in the manifest.

## Notes on solution uniqueness

The GDD specifies that levels should have unique solutions (only one valid Hamiltonian path matching the waypoint sequence). The 20 levels in this initial set are hand-designed for playability; a subset may have multiple valid solutions because they are tutorials or early-easy levels where permissiveness aids learning. The generator used for remaining campaign content (levels 21–120) and all 88 daily constellation puzzles must enforce uniqueness via the solver described in GDD §7.2.
