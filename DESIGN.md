# Design brief

The first turn replaces this file with the art direction it establishes. Until
then it records the contract every component obeys.

## Palette and type

Every value lives in `src/theme.css`: colour, both faces, the type scale, the
spacing rhythm, radii, shadow and motion. `src/index.css` only imports it and
sets the base layer. Nothing hardcodes a colour, a font stack, a radius or a
shadow — change the token and every component follows.

One colour scheme, deliberately. A design is light or it is dark; there is no
`prefers-color-scheme` override unless the owner asks for one.

## Faces

`--font-heading`, `--font-body` and `--font-label` — the `font-display`,
`font-sans` and `font-label` classes; `font-mono` is a real monospace stack for
code. The faces themselves are loaded in `src/fonts.css`; changing one means
changing the import and the token together, or the page renders the fallback
stack.

## Components

`src/components/ui` holds unstyled shadcn primitives — buttons, cards, dialogs,
inputs. They are raw material, not a layout. There is no section library: every
section is composed for the page it is on.

## Shell

The scaffold ships no header, navigation or footer, and no page beyond a
placeholder home and a 404. Whether this site has a top bar, a side rail, a
footer at all — and which routes exist — is decided for this business. A route
nobody asked for is not built.

## Brand mark

`src/components/Brand.tsx` is how the business appears wherever its name does,
and `public/favicon.svg` matches it. One icon weight and one stroke width across
the whole site, named here once it is chosen — icons that disagree on weight are
the clearest tell of a page nobody art-directed.

## Imagery

What fills a space a layout leaves for a picture: a photograph, a drawing, or
type and colour carrying the section on their own. Whichever it is, it is one
answer for the whole site, and it is written here — the image generator reads
this section and paints to it.

## Voice

Real copy, specific to the business. No lorem, no invented testimonials, prices
or awards.
