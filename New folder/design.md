---
version: "superdesign-alpha"
name: "Ornate Pastel Reliquary"
description: "A hand-inked triptych of illustrated pastel panels in violet and aqua, framed by rococo scrollwork and starburst studs, centered on a curtained plaque with swirling display lettering and a dotted paper ground."
colors:
  background: "#C0D8F0"
  surface-violet: "#D8C0FF"
  surface-aqua: "#C0F0F0"
  surface-plaque: "#D8F0F0"
  text-primary: "#69D2D2"
  text-ink: "#000000"
  accent-sweet: "#9678FF"
  accent-spicy: "#69D2D2"
typography:
  body-md:
    fontFamily: "jttkkumejeonryeong"
    fontSize: "70px"
    fontWeight: 400
  display-lg:
    fontFamily: "kurobara-cinderella"
    fontSize: "70px"
    fontWeight: 400
    lineHeight: "1.0"
  label-serif:
    fontFamily: "Times New Roman"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: "1.4"
  accent-hand:
    fontFamily: "Irish Grover"
    fontSize: "18px"
    fontWeight: 400
    lineHeight: "1.2"
spacing:
  base: "8px"
  gap: "24px"
  section-padding: "48px"
rounded:
  panel: "12px"
  plaque: "16px"
  ornament-frame: "4px"
components:
  panel-frame-violet:
    background: "#D8C0FF"
    border: "3px solid #000000"
    radius: "12px"
    padding: "16px"
  panel-frame-aqua:
    background: "#C0F0F0"
    border: "3px solid #000000"
    radius: "12px"
    padding: "16px"
  plaque-center:
    background: "#D8F0F0"
    border: "3px solid #000000"
    radius: "8px"
    padding: "40px"
---
# Ornate Pastel Reliquary
Source: https://theiconicgirlrecipe.com

## Overview
This is an illustrated, hand-drawn maximalist system — closer to a collectible print or vinyl-sleeve gatefold than a conventional web UI. The visual language is baroque-ornamental: dense scrollwork borders, filigree, gem-like studs, and stars rendered in flat cel-shaded illustration with heavy black ink outlines. Two mirrored character portraits in violet and aqua bookend a pale, dotted-paper plaque bearing swirling calligraphic display lettering. The overall register is decorative-collectible rather than utilitarian; the entire composition behaves as a single piece of art, not a stack of interchangeable components.

## Composition
The layout is a strict horizontal triptych: two flanking rectangular panels of equal width, and a wider center plaque, all joined by a continuous ornamental border strip running along the bottom edge. The two side panels mirror each other in illustration content (a seated character rendered from behind) but differ in hue — violet on the left, aqua/mint on the right — establishing bilateral symmetry as the dominant structural device. The center plaque breaks that symmetry only in content: a curtained backdrop with a dotted texture, topped by an arched swag-and-star crown ornament, holding the display wordmark and two lines of smaller caption text. A deliberate choice here is symmetry-with-mirrored-color rather than a single dominant hero panel — this rejects a hierarchy where one character panel outranks the other, instead placing all emphasis on the central plaque as the shared focal point between two equal, color-coded guardians.

## Colors
The pixel field confirms a pastel-dominant, no-black-background system: light blue (~26%), aqua/cyan (~25%), lavender (~13%), periwinkle (~11%), blue-violet (~10%), and pale aqua-teal (~9%) together account for nearly the whole frame — there is no near-black or neutral-gray surface anywhere; "background" reads as a soft blue-lavender wash. The two panel fills are the surface roles: a muted violet (`surface-violet`) on the left and a minty aqua (`surface-aqua`) on the right, each a large flat cel-shaded fill occupying roughly a third of the canvas. The center plaque is the palest surface, a near-white powder blue (`surface-plaque`), acting as the "card" the eye lands on first. Pure black (`#000000`) is used exclusively as ink — every outline, linework detail, and the display wordmark's implied stroke sits in black or a black-adjacent navy, never as a fill. The named tokens `--color-sweet: #9678FF` and `--color-spicy: #69D2D2` map directly onto the violet and aqua panel families, confirming these two hues are the system's rationed accent pair — one warm-cool violet, one cool-mint teal — used in exact bilateral balance rather than one accent dominating.

## Typography
Display lettering uses `kurobara-cinderella`, a swirling, ribbon-like display face reserved for the single two-line wordmark at roughly 70px — this is the system's unmistakable signature, occupying the visual center of the plaque and rendered in a dusty steel-blue tone that reads legibly against the pale plaque without introducing a new hue. Beneath it, two lines of caption text sit in a plain serif (`Times New Roman`) at a much smaller scale, functioning as a subordinate label/caption role — quiet, structural, deliberately unadorned to contrast the display swirl above it. `Irish Grover` and `jttkkumejeonryeong` appear as small hand-styled accent marks elsewhere in the illustrated scene (charm/tag details), a rounded, playful mono-weight face used only in tiny doses, never for running text.

## Layout
There is no grid in the conventional sense — this is a fixed three-column illustrated composition, roughly 30/40/30 in width, bordered on all four sides by a continuous carved-scroll frame that also runs as a connecting strip beneath all three columns, visually stitching the triptych into one bordered artifact. Spacing is not modular/token-based but illustrative: generous internal margins inside each panel frame (an inset border of hand-drawn scrollwork, roughly matching a `12px`–`16px` radius rhythm) hold each character portrait centered and cropped tight at the panel edges. Density is high at the ornamental border (stars, gems, curls) and low in the panel interiors, which is what gives the piece its breathing room despite the maximalist framing.

## Components
- **Panel frame (violet / aqua), ×2, flanking left and right**: each is a bordered illustration card, `3px` black ink outline, `~12px` corner radius, filled with the panel's hue (`#B9A6E8`-family violet or `#A8E8DC`-family aqua). Inside, top to bottom: an ornamental scroll cartouche across the top edge, a full-bleed character illustration (a seated figure viewed from behind) filling ~80% of the frame, a small gem/flower accent mid-frame, a dangling tassel-charm motif at one side, and a star-and-heart stud detail in the lower corner. No text lives inside these panels — they are pure illustrated media cards.
- **Center plaque, ×1, spanning the middle column**: the focal card, pale dotted-texture fill (`#DCE9F2`-family), `3px` black border, softly arched top edge suggesting a stage curtain. Internal anatomy top to bottom: an arched crown ornament of swags, stars, and studs across the header zone; a small pendant/charm icon graphic sitting just above and overlapping the wordmark; the two-line display wordmark in `kurobara-cinderella` centered in the upper-middle; two lines of small serif caption text directly beneath it, right-aligned to the wordmark's baseline block. The plaque functions as the single content-bearing component in the entire composition.
- **Border ornament strip, ×1, running full width beneath all three panels**: a continuous carved band of interlocking scrollwork with small gem studs at intervals, unifying the triptych as one frame rather than three separate cards.

## Graphics & Effects
All fills are flat cel-shaded illustration color with hard-edged gradient shading used only to imply volume on the characters' fur/hair curls and on the ornamental metalwork (visible as darker value bands hugging the inside of each curl and stud) — this is illustrative shading, not a CSS gradient system, and should be rebuilt as painted shading rather than a linear-gradient background. The center plaque carries a fine dotted-paper texture across its curtain backdrop — small evenly spaced dots at low contrast against the pale blue fill — this is the system's only texture layer and should be reproduced as a subtle repeating dot pattern, not noise/grain. Elevation is communicated entirely through consistent heavy black outline weight (implying carved/embossed relief) rather than drop shadows; every shape, from stars to studs to character forms, carries the same ~3px ink stroke, which is the system's substitute for a shadow/elevation scale.

## Motion
No motion is visible in the artifact itself, but the available keyframe vocabulary (`wiggle`, `guide-breathe`, `vibrate`, `rWiggle`) and the `opacity 0.2s ease` transition indicate a rebuild should treat the illustrated charms, stars, and stud details as idle-animated elements — small looping rotation/wiggle or breathing scale cycles on individual ornament pieces (stars, dangling tassels, gem studs) — rather than any full-panel or scroll-linked motion. Any interactive reveal (hover on a panel, appearance of a caption) should use the measured `opacity 0.2s ease` fade rather than a slide or scale transform, keeping motion small, decorative, and confined to individual ornament pieces.

## Guardrails
- Never substitute a flat neutral or dark background for the pastel blue/violet/aqua wash — there is no black or gray surface in this system.
- Do not simplify the border scrollwork into a plain rounded rectangle; the carved-ornament frame is structural, not decorative garnish.
- Keep the violet and aqua panels in exact bilateral symmetry of scale and treatment — one must never dominate or outrank the other.
- Do not render the display wordmark in a straight/geometric sans; it must keep the swirling ribbon-letterform character of `kurobara-cinderella`.
- Do not add drop shadows for elevation — depth comes only from black ink outline weight and painted volumetric shading.
- Keep all illustration shading flat/cel-shaded; do not introduce smooth photographic or mesh gradients.