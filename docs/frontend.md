# Frontend architecture

The frontend follows Feature-Sliced Design (FSD). The source tree is split into six
layers, each with a single clear responsibility. The layers are ordered, and that order
is the core rule of the whole architecture.

## Layers

From the highest layer to the lowest:

- "app" - routing, providers, global styles. The composition root of the application.
- "pages" - whole screens assembled from lower layers.
- "widgets" - large self-contained UI blocks, such as Header, Sidebar, or the feed.
- "features" - user actions that carry business value, such as AuthForm, AddToCart, or
  LoginButton.
- "entities" - business entities of the domain, such as User, Product, or Order.
- "shared" - reusable code with no business meaning: the ui-kit, the api client, and
  generic utilities.

```
src/
  app/
  pages/
  widgets/
  features/
  entities/
  shared/
```

## The one rule: imports go down only

A layer may import ONLY from the layers BELOW it. It must never import from a layer above
it, and it must never reach sideways into the internals of a sibling slice on the same
layer.

Allowed, because each target sits lower than its source:

- "pages" may use "widgets", "features", "entities", and "shared".
- "features" may use "entities" and "shared".
- "entities" may use "shared".

Not allowed, because the direction points up or sideways:

- "shared" must not import from "entities", "features", "pages", or "app".
- "entities" must not import from "features".
- One "feature" must not import from another "feature".

This keeps dependencies flowing in a single direction. The result is that lower layers
stay generic and reusable, higher layers stay thin and specific, and a change in a high
layer cannot ripple downward into shared code.

## Public API per slice

Every slice exposes its contents through an "index.ts" barrel file. Other slices import
from that public entry point, never from a file deep inside the slice. The internal file
layout of a slice can then change freely without breaking its consumers.

## How the rule is enforced

The downward-only rule is not a convention that relies on discipline. It is checked
automatically:

- "eslint-plugin-boundaries" defines the six layers and rejects any import that points up
  or sideways. A violating import fails "just check" and fails CI.
- "tsconfig.json" declares a path alias per layer, so imports read as "features/..." or
  "shared/..." rather than long relative paths, which also makes an illegal direction
  obvious at a glance.

If an import is rejected, the fix is to move the code to the correct layer, not to relax
the rule.
