# Technical Preferences

## Engine & Language
- Engine: Unity 6000.3.12f1
- Language: C#

## Naming Conventions
- Classes: PascalCase (e.g., `PlayerController`)
- Public fields/properties: PascalCase (e.g., `MoveSpeed`)
- Private fields: _camelCase (e.g., `_moveSpeed`)
- Methods: PascalCase (e.g., `TakeDamage()`)
- Files: PascalCase matching class (e.g., `PlayerController.cs`)
- Constants: PascalCase or UPPER_SNAKE_CASE

## Input & Platform
- **Target Platforms**: Mobile (iOS / Android)
- **Input Methods**: Touch
- **Primary Input**: Touch
- **Gamepad Support**: None
- **Touch Support**: Full
- **Platform Notes**: Mobile-first touch interactions. Requires SafeArea compliance for UI.

## Performance Budgets
- Framerate Target: 60fps (16.6ms frame budget)
- Render Pipeline: URP 2D
- Allocations: Zero in hot paths (Update/Physics)
- Draw Calls: Aim for < 100 on mobile (use atlasing and SpriteRenderer batching)

## Testing
- Framework: Unity Test Framework (NUnit)

## Forbidden Patterns
[TO BE CONFIGURED]

## Allowed Libraries
- UniTask
- PrimeTween
- Odin Inspector
- Newtonsoft JSON
- TextMeshPro
- (NiceVibrations if haptics implemented)

## Engine Specialists
- **Primary**: unity-specialist
- **Language/Code Specialist**: unity-specialist (C# review — primary covers it)
- **Shader Specialist**: unity-shader-specialist (Shader Graph, HLSL, URP/HDRP materials)
- **UI Specialist**: unity-ui-specialist (UI Toolkit UXML/USS, UGUI Canvas, runtime UI)
- **Additional Specialists**: unity-dots-specialist (ECS, Jobs system, Burst compiler), unity-addressables-specialist (asset loading, memory management, content catalogs)
- **Routing Notes**: Invoke primary for architecture and general C# code review. Invoke DOTS specialist for any ECS/Jobs/Burst code. Invoke shader specialist for rendering and visual effects. Invoke UI specialist for all interface implementation. Invoke Addressables specialist for asset management systems.

### File Extension Routing

| File Extension / Type | Specialist to Spawn |
|-----------------------|---------------------|
| Game code (.cs files) | unity-specialist |
| Shader / material files (.shader, .shadergraph, .mat) | unity-shader-specialist |
| UI / screen files (.uxml, .uss, Canvas prefabs) | unity-ui-specialist |
| Scene / prefab / level files (.unity, .prefab) | unity-specialist |
| Native extension / plugin files (.dll, native plugins) | unity-specialist |
| General architecture review | unity-specialist |
