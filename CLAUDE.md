# Winged It

Recreate improvised recipes. The user writes a free-text account of what they cooked, answers a fixed checklist of clarifying questions, and gets an AI-generated recipe card.

Scope cuts are deliberate (5-week solo timeline): no accounts, no database, no adaptive AI conversation.

## Stack

- React 19, TypeScript (strict), Vite, react-router-dom v7
- localforage for persistence (no backend, no sync)
- Gemini (`@google/genai`, model `gemini-3-flash-preview`) called only from Vercel serverless functions in `api/`
- Fonts via Fontsource: Bricolage Grotesque (headings), Public Sans (body)

## Flow

1. User writes free text (minimum 20 words, with a `0/20 words` counter).
2. `/api/generate-questions` returns up to 4 skippable questions. The last is always "Do you wish you'd done anything differently?"
3. `/api/generate-recipe` builds the recipe from the text and answers.
4. The recipe is auto-saved via `addRecipe()` and shown on the recipe page.
5. Users can edit, delete, or create a recipe manually. PDF export uses a print stylesheet.

## Structure

- `src/components/Name/Name.tsx` + `Name.module.css`
- Form components (Field, TextInput, TextArea, Select, rows, PhotoField, RecipeForm) live in `src/components/Form/Name/Name.tsx` + `Name.module.css`.
- `src/routes/Name/Name.tsx` + `Name.module.css`
- `src/hooks`, `src/lib`, `src/types`, `src/styles`
- Figma layer names map to PascalCase components.
- A component with variants in Figma is ONE React component with a `variant` prop.

## Conventions

- CSS Modules only. No inline styles, no Tailwind.
- Use tokens from `src/styles/tokens.css` (`--color-*`, `--font-*`). Design values from Figma (Tailwind output, names like `--semantic/color-surface`) or from screenshots must be converted to our tokens.
- Mobile-first. The app column is capped by `--app-max-width` (`src/styles/tokens.css`).
- Button variants: primary, secondary, outline (cancel), destructive. The error (salmon) colour is for destructive actions, the error modal icon, and form errors (field and row error outlines, error messages, the remove-row button).
- One `Dialog` component with variants, using native `<dialog>`.
- Semantic HTML. Props typed as `NameProps` interfaces. No `any`.
- UI copy: British English, metric units, lowercase button labels, no em dashes, except the separator in ingredient lines (formatIngredient).
- LLM errors: map to friendly messages (rate limit, network, generic). Never show raw API text.
- Radius: buttons use --radius-sm (4px) or --radius-full. Everything else (cards, inputs, textareas, images, dialogs, sheets) uses --radius-md (8px). Never use other radii unless I say so.
- Spacing: the default for card padding, screen padding and gaps between blocks is --space-3 (16px). Smaller gaps inside a block use --space-2 (8px).

## Data

- `Ingredient { item, quantity, unit }`, with `unit` from the `IngredientUnit` union.
- `quantity` 0 means "to taste".
- Nutrition values are numbers (kcal and grams).
- Always render ingredients with `formatIngredient()`.

## Commands

- `npm run dev`: frontend only. The API needs `vercel dev` with `GEMINI_API_KEY` in `.env.local`.
- Mock API (dev only, no Gemini): set `VITE_MOCK_API=true` in `.env.local`, then `localStorage.mockScenario` to `success` (default), `unusable`, `rateLimit`, `network`, `generic` or `recipeError`. The nutrition calculation (`api/recalculate-nutritional-info`) is mocked too and honours `rateLimit`, `network` and `generic`. On a recalculation the mock scales the previous values by the ratio of new to old ingredient count.
- `npm run lint`
- `npx tsc -b`
- `npm run build`: does NOT type-check. `api/` is not covered by any tsconfig.

## Rules for Claude Code

- Only do what is asked. Nothing extra.
- Read files before editing. Prefer small edits over rewrites.
- Do not re-read files that have not changed.
- The Figma MCP limit is used up. Do not call any Figma tool. Work from the screenshots and design data I give you, and ask me if something is missing.
- Gemini free tier is rate limited. No loops or repeated calls.
- Never commit or push unless asked. Use conventional commit messages.
- Never add co-author trailers, "Generated with Claude Code" lines, or any attribution to commits or PR descriptions.
- Never sign commits or add sign-offs (no `-S`, `--gpg-sign`, `--signoff`). Commits use my git identity only.
- Run lint, type-check and build after changes, and say what could not be verified.
- I am a beginner: explain non-obvious patterns in 1-2 sentences.
- Be concise. Push back if my request conflicts with these rules.
- Before asking me for a design value (padding, gap, radius, font size, colour, icon size), look at how existing components and screens handle it (tokens.css and the *.module.css files). If the codebase uses one value consistently, use it, and list it in the plan under "Inferred from existing code, please confirm" with the file where you found the pattern. Only ask me for values that have no precedent in the code, or where the screenshot clearly shows something different from the existing pattern.
- Never guess a value that has no precedent: ask for it once, in one batch.
