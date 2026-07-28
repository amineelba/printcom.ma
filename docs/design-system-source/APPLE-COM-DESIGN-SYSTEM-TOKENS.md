# Apple.com Design System Tokens

> **Document type:** Reverse-engineered web design-system specification  
> **Target:** `https://www.apple.com/`  
> **Snapshot date:** 2026-07-28  
> **Version:** 0.1.0  
> **Token model:** Foundation → Semantic → Component → Template  
> **Interchange convention:** DTCG 2025.10-inspired JSON  
> **Themes covered:** Light, dark, translucent navigation, campaign-scoped surfaces  
> **Status:** Independent reconstruction; not an official Apple design-system release

---

## 1. Purpose

This document reconstructs the public-facing design system used across Apple.com.

It combines three evidence layers:

1. **Official Apple guidance**  
   Apple Human Interface Guidelines, Apple Design Resources, Apple accessibility guidance, and Apple font documentation.

2. **Observed Apple.com patterns**  
   Repeated structures visible across the global homepage, product-family pages, commerce pages, accessibility pages, global navigation, local navigation, product cards, promotional cards, galleries, footnotes, and footer.

3. **Reconstructed implementation tokens**  
   Normalized colours, spacing, type sizes, radii, breakpoints, motion, and component dimensions where Apple does not publish its private website token source.

This file can be used as a practical basis for:

- interface analysis;
- design-system documentation;
- Figma variables;
- CSS custom properties;
- Style Dictionary mappings;
- Tailwind theme generation;
- component specifications;
- responsive implementation;
- accessibility review;
- AI-assisted front-end development.

This document does **not** include:

- Apple’s private design-system repository;
- private CSS source;
- copyrighted product artwork;
- Apple logos or trademarks as reusable assets;
- SF Pro font files;
- SF Symbols files;
- internal experimentation or personalization rules.

---

## 2. Evidence and confidence model

Every specification belongs to one of the following evidence classes.

| Status | Meaning |
|---|---|
| `official` | Directly supported by Apple’s public documentation |
| `observed` | Repeatedly visible on Apple.com’s public pages |
| `reconstructed` | Normalized from public visual and structural evidence |
| `recommended` | Added to make the reconstructed system operational |
| `campaign` | Product- or campaign-specific value that must not become a permanent global token |

### Reliability rules

1. Official guidance takes precedence over reconstructed values.
2. Apple.com web patterns must be distinguished from native Apple-platform components.
3. Product campaign colours are local art-direction decisions, not universal Apple brand tokens.
4. Exact private CSS variable names, measurements, and breakpoints cannot be verified from the public sources used here.
5. Reconstructed numeric values must be checked in browser DevTools before claiming pixel parity.
6. Dynamic content, locale, viewport, A/B testing, product launches, and personalization can change the rendered site.
7. Apple fonts must not be redistributed through this document.

---

## 3. Public surfaces reviewed

| Surface | Coverage | Design-system evidence |
|---|---:|---|
| Apple.com homepage | High | Global navigation, full-width heroes, tile grid, CTA pairs, entertainment carousel, footer |
| iPhone family page | High | Local navigation, chapter navigation, editorial sections, feature cards, product lineup, comparison |
| Mac family page | High | Product lineup, category filters, buying-value cards, editorial cards |
| Buy iPhone | High | Commerce cards, shopping-guide rails, savings cards, product pricing, support modules |
| Accessibility | High | Long-form content, feature modules, media cards, resource cards, inclusive content patterns |
| Apple HIG — principles | High | Purpose, agency, responsibility, familiarity, flexibility, simplicity, craft, delight |
| Apple HIG — colour | High | Adaptive colour, contrast, inclusive colour, light/dark/high-contrast contexts |
| Apple HIG — typography | High | SF family, hierarchy, legibility, optical sizing, weight guidance |
| Apple HIG — layout | High | adaptability, safe areas, visual hierarchy, platform consistency |
| Apple HIG — materials | High | hierarchy through materials, translucency, Liquid Glass context |
| Apple Design Resources | High | SF Pro, SF Symbols, related design resources |
| Authenticated account | Not audited | Authentication required |
| Checkout completion | Partial | Transaction-specific states not fully audited |
| Native apps | Excluded | Website scope only |

---

## 4. System character

### 4.1 Core principles

Apple’s current public design principles emphasize:

- purpose;
- agency;
- responsibility;
- familiarity;
- flexibility;
- simplicity;
- craft;
- delight.

For Apple.com, these principles manifest through the following web-specific behaviours.

### 4.2 Apple.com visual principles

1. **Content-led reduction**  
   Each section promotes one dominant idea and removes competing interface noise.

2. **Product as hero**  
   Product imagery, silhouette, finish, material, and spatial composition carry much of the communication.

3. **Typography as structure**  
   Large headings, concise supporting copy, and restrained CTA pairs establish hierarchy without heavy framing.

4. **Neutral global foundation**  
   White, near-white, black, and deep charcoal provide a stable global shell.

5. **Campaign-local colour**  
   Product launches can introduce vivid colour, gradients, imagery, or dark surfaces without altering the global semantic system.

6. **Generous negative space**  
   Large vertical intervals and narrow copy measures create focus and perceived quality.

7. **Concentric geometry**  
   Rounded cards, pills, circular controls, and nested radii produce visual harmony.

8. **Low-noise interaction**  
   Links, buttons, galleries, and disclosures use subtle state changes and controlled motion.

9. **Layered translucency**  
   Navigation and overlay controls may use semi-transparent or material-like surfaces to retain spatial context.

10. **Responsive editorial composition**  
    Layout changes preserve narrative priority rather than merely shrinking desktop geometry.

11. **Precision over decoration**  
    Borders, shadows, and dividers are sparse and used only to clarify structure.

12. **Accessible alternatives**  
    Apple’s public guidance emphasizes legibility, adaptable text, inclusive colour, alternative cues, and support for accessibility settings.

---

## 5. Token architecture

```text
apple-com
├── foundation
│   ├── color
│   ├── typography
│   ├── dimension
│   ├── spacing
│   ├── radius
│   ├── border
│   ├── shadow
│   ├── opacity
│   ├── motion
│   ├── breakpoint
│   ├── layout
│   ├── icon
│   └── z-index
│
├── semantic
│   ├── color
│   ├── typography
│   ├── space
│   ├── radius
│   ├── elevation
│   ├── material
│   ├── motion
│   └── layout
│
├── component
│   ├── global-navigation
│   ├── global-search
│   ├── local-navigation
│   ├── chapter-navigation
│   ├── ribbon
│   ├── button
│   ├── link
│   ├── icon-button
│   ├── hero
│   ├── tile
│   ├── editorial-card
│   ├── product-card
│   ├── compare-card
│   ├── store-card
│   ├── price
│   ├── colour-swatch
│   ├── segmented-control
│   ├── gallery
│   ├── modal
│   ├── accordion
│   ├── tab-navigation
│   ├── footnote
│   └── global-footer
│
└── template
    ├── homepage
    ├── product-family
    ├── product-detail
    ├── commerce-index
    ├── compare
    ├── editorial
    └── support-content
```

### Dependency direction

```text
Template
   ↓
Component
   ↓
Semantic
   ↓
Foundation
```

### Token rule

A component should reference semantic roles instead of raw values whenever the role is reusable.

```text
Preferred:
component.button.primary.background
→ semantic.color.action.primary.background
→ foundation.color.blue.600

Avoid:
component.button.primary.background
→ #0071E3
```

---

# 6. Foundation colour tokens

## 6.1 Global neutral palette

The following values are strongly associated with repeated Apple.com web roles. Exact internal names are not public.

```json
{
  "foundation": {
    "color": {
      "neutral": {
        "$type": "color",
        "$description": "Reconstructed Apple.com neutral palette.",
        "white": {
          "$value": "#FFFFFF",
          "$extensions": {
            "com.audit.evidence": {
              "status": "observed",
              "confidence": 1
            }
          }
        },
        "near-white": {
          "$value": "#FBFBFD",
          "$description": "Subtle off-white content surface.",
          "$extensions": {
            "com.audit.evidence": {
              "status": "reconstructed",
              "confidence": 0.82
            }
          }
        },
        "gray-50": {
          "$value": "#F5F5F7",
          "$description": "Primary alternate page and footer background.",
          "$extensions": {
            "com.audit.evidence": {
              "status": "observed",
              "confidence": 0.96
            }
          }
        },
        "gray-100": {
          "$value": "#E8E8ED",
          "$description": "Subtle divider and muted control background.",
          "$extensions": {
            "com.audit.evidence": {
              "status": "reconstructed",
              "confidence": 0.9
            }
          }
        },
        "gray-200": {
          "$value": "#D2D2D7",
          "$description": "Default subtle border.",
          "$extensions": {
            "com.audit.evidence": {
              "status": "observed",
              "confidence": 0.92
            }
          }
        },
        "gray-300": {
          "$value": "#B6B6BA",
          "$description": "Disabled and low-emphasis interface content.",
          "$extensions": {
            "com.audit.evidence": {
              "status": "reconstructed",
              "confidence": 0.82
            }
          }
        },
        "gray-400": {
          "$value": "#A1A1A6",
          "$description": "Secondary content on dark surfaces.",
          "$extensions": {
            "com.audit.evidence": {
              "status": "observed",
              "confidence": 0.88
            }
          }
        },
        "gray-500": {
          "$value": "#86868B",
          "$description": "Tertiary text and legal content.",
          "$extensions": {
            "com.audit.evidence": {
              "status": "observed",
              "confidence": 0.96
            }
          }
        },
        "gray-600": {
          "$value": "#6E6E73",
          "$description": "Secondary text on light surfaces.",
          "$extensions": {
            "com.audit.evidence": {
              "status": "observed",
              "confidence": 0.98
            }
          }
        },
        "gray-700": {
          "$value": "#424245",
          "$description": "Elevated dark neutral.",
          "$extensions": {
            "com.audit.evidence": {
              "status": "reconstructed",
              "confidence": 0.8
            }
          }
        },
        "gray-800": {
          "$value": "#2D2D2F",
          "$description": "Dark surface and dark control state.",
          "$extensions": {
            "com.audit.evidence": {
              "status": "reconstructed",
              "confidence": 0.84
            }
          }
        },
        "gray-900": {
          "$value": "#1D1D1F",
          "$description": "Primary Apple.com text and deep surface.",
          "$extensions": {
            "com.audit.evidence": {
              "status": "observed",
              "confidence": 0.99
            }
          }
        },
        "gray-950": {
          "$value": "#161617",
          "$description": "Translucent dark-navigation base.",
          "$extensions": {
            "com.audit.evidence": {
              "status": "reconstructed",
              "confidence": 0.88
            }
          }
        },
        "black": {
          "$value": "#000000",
          "$description": "Full black campaign and product surface.",
          "$extensions": {
            "com.audit.evidence": {
              "status": "observed",
              "confidence": 1
            }
          }
        }
      }
    }
  }
}
```

---

## 6.2 Blue interaction palette

Apple.com commonly uses blue to communicate links and primary actions.

```json
{
  "foundation": {
    "color": {
      "blue": {
        "$type": "color",
        "100": {
          "$value": "#E8F2FF",
          "$description": "Recommended subtle selected background.",
          "$extensions": {
            "com.audit.evidence": {
              "status": "recommended",
              "confidence": 0.74
            }
          }
        },
        "500": {
          "$value": "#0066CC",
          "$description": "Common Apple.com text-link blue.",
          "$extensions": {
            "com.audit.evidence": {
              "status": "observed",
              "confidence": 0.96
            }
          }
        },
        "600": {
          "$value": "#0071E3",
          "$description": "Primary filled-action blue.",
          "$extensions": {
            "com.audit.evidence": {
              "status": "observed",
              "confidence": 0.96
            }
          }
        },
        "650": {
          "$value": "#0077ED",
          "$description": "Primary action hover colour.",
          "$extensions": {
            "com.audit.evidence": {
              "status": "reconstructed",
              "confidence": 0.9
            }
          }
        },
        "700": {
          "$value": "#005BB5",
          "$description": "Pressed or high-contrast blue state.",
          "$extensions": {
            "com.audit.evidence": {
              "status": "recommended",
              "confidence": 0.78
            }
          }
        }
      }
    }
  }
}
```

---

## 6.3 Functional colour palette

System colours in Apple’s platform guidance adapt to context. For a static web implementation, accessible web-specific variants are required.

```json
{
  "foundation": {
    "color": {
      "functional": {
        "$type": "color",
        "success": {
          "$value": "#008009",
          "$description": "Accessible positive status on white.",
          "$extensions": {
            "com.audit.evidence": {
              "status": "reconstructed",
              "confidence": 0.78
            }
          }
        },
        "success-subtle": {
          "$value": "#EAF7EA",
          "$extensions": {
            "com.audit.evidence": {
              "status": "recommended",
              "confidence": 0.72
            }
          }
        },
        "warning": {
          "$value": "#9A6700",
          "$description": "Warning text on light surfaces.",
          "$extensions": {
            "com.audit.evidence": {
              "status": "recommended",
              "confidence": 0.7
            }
          }
        },
        "warning-subtle": {
          "$value": "#FFF4CE",
          "$extensions": {
            "com.audit.evidence": {
              "status": "recommended",
              "confidence": 0.7
            }
          }
        },
        "error": {
          "$value": "#E30000",
          "$description": "Accessible web error text on white.",
          "$extensions": {
            "com.audit.evidence": {
              "status": "reconstructed",
              "confidence": 0.84
            }
          }
        },
        "error-subtle": {
          "$value": "#FFF0F0",
          "$extensions": {
            "com.audit.evidence": {
              "status": "recommended",
              "confidence": 0.7
            }
          }
        },
        "info": {
          "$value": "{foundation.color.blue.500}",
          "$extensions": {
            "com.audit.evidence": {
              "status": "recommended",
              "confidence": 0.9
            }
          }
        },
        "info-subtle": {
          "$value": "{foundation.color.blue.100}",
          "$extensions": {
            "com.audit.evidence": {
              "status": "recommended",
              "confidence": 0.8
            }
          }
        }
      }
    }
  }
}
```

---

## 6.4 Campaign colour policy

Apple.com frequently introduces page-local colours for products, services, entertainment, and launches.

Examples can include:

- product finish colours;
- photographic colour fields;
- radial and linear gradients;
- deep black product sections;
- warm editorial backgrounds;
- service-specific colours;
- environmental green;
- privacy blue;
- entertainment artwork palettes.

These must be scoped as campaign tokens.

```json
{
  "campaign": {
    "example-product": {
      "color": {
        "$type": "color",
        "surface": {
          "$value": "#000000",
          "$extensions": {
            "com.audit.evidence": {
              "status": "campaign",
              "confidence": 1
            }
          }
        },
        "content": {
          "$value": "#F5F5F7",
          "$extensions": {
            "com.audit.evidence": {
              "status": "campaign",
              "confidence": 1
            }
          }
        },
        "accent": {
          "$value": "#A7C7FF",
          "$description": "Placeholder only. Replace per campaign."
        }
      }
    }
  }
}
```

### Campaign rules

1. Campaign values must not overwrite global semantic roles.
2. Product artwork determines local visual balance.
3. Text contrast must be tested against the final rendered artwork.
4. Use overlays or local scrims when artwork reduces legibility.
5. Retain the global CTA and focus behaviour unless a verified contrast requirement demands a local variant.
6. Campaign gradients must be treated as art-direction assets, not general-purpose foundations.

---

# 7. Opacity and material tokens

## 7.1 Opacity

```json
{
  "foundation": {
    "opacity": {
      "$type": "number",
      "0": { "$value": 0 },
      "subtle": { "$value": 0.08 },
      "soft": { "$value": 0.16 },
      "disabled": { "$value": 0.42 },
      "muted": { "$value": 0.64 },
      "navigation": { "$value": 0.8 },
      "scrim-light": { "$value": 0.32 },
      "scrim": { "$value": 0.48 },
      "scrim-heavy": { "$value": 0.72 },
      "100": { "$value": 1 }
    }
  }
}
```

## 7.2 Material surfaces

Apple’s HIG describes materials as a way to establish depth, layering, hierarchy, and spatial continuity. Apple.com uses web-compatible translucency and blur patterns in navigation and overlay controls.

```json
{
  "semantic": {
    "material": {
      "navigation-light": {
        "$description": "Translucent light navigation surface.",
        "background": {
          "$type": "color",
          "$value": "#FAFAFC"
        },
        "opacity": {
          "$type": "number",
          "$value": 0.8
        },
        "blur": {
          "$type": "dimension",
          "$value": { "value": 20, "unit": "px" }
        },
        "saturate": {
          "$type": "number",
          "$value": 1.8
        }
      },
      "navigation-dark": {
        "$description": "Translucent dark navigation surface.",
        "background": {
          "$type": "color",
          "$value": "{foundation.color.neutral.gray-950}"
        },
        "opacity": {
          "$type": "number",
          "$value": 0.8
        },
        "blur": {
          "$type": "dimension",
          "$value": { "value": 20, "unit": "px" }
        },
        "saturate": {
          "$type": "number",
          "$value": 1.8
        }
      },
      "floating-light": {
        "$description": "Floating control above visual content.",
        "background": {
          "$type": "color",
          "$value": "#FFFFFFD9"
        },
        "blur": {
          "$type": "dimension",
          "$value": { "value": 16, "unit": "px" }
        }
      },
      "floating-dark": {
        "$description": "Dark floating control above visual content.",
        "background": {
          "$type": "color",
          "$value": "#1D1D1FD9"
        },
        "blur": {
          "$type": "dimension",
          "$value": { "value": 16, "unit": "px" }
        }
      }
    }
  }
}
```

### Material rules

- Materials support hierarchy; they do not replace it.
- Underlying content must not make controls illegible.
- A fallback opaque surface is required when backdrop filtering is unavailable.
- Reduce transparency preferences should receive a more opaque alternative.
- Text, icons, and focus indicators must be tested across the actual background range.

---

# 8. Typography tokens

## 8.1 Font families

Apple states that SF Pro is the system font for iOS, iPadOS, macOS, and tvOS. Apple.com uses a San Francisco-oriented web stack with system fallbacks.

```json
{
  "foundation": {
    "font-family": {
      "$type": "fontFamily",
      "display": {
        "$value": [
          "SF Pro Display",
          "SF Pro Icons",
          "Helvetica Neue",
          "Helvetica",
          "Arial",
          "sans-serif"
        ],
        "$description": "Large marketing and editorial display typography."
      },
      "text": {
        "$value": [
          "SF Pro Text",
          "SF Pro Icons",
          "Helvetica Neue",
          "Helvetica",
          "Arial",
          "sans-serif"
        ],
        "$description": "Body, navigation, control, and compact interface typography."
      },
      "system-web": {
        "$value": [
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Helvetica Neue",
          "Arial",
          "sans-serif"
        ],
        "$description": "Standards-compliant web fallback that uses the local system font."
      },
      "mono": {
        "$value": [
          "SF Mono",
          "ui-monospace",
          "Menlo",
          "Monaco",
          "Consolas",
          "Liberation Mono",
          "monospace"
        ]
      },
      "serif": {
        "$value": [
          "New York",
          "Iowan Old Style",
          "Times New Roman",
          "serif"
        ],
        "$description": "Optional editorial serif; not a default Apple.com interface family."
      }
    }
  }
}
```

### Font licensing rule

Do not download, convert, embed, or redistribute Apple font files unless the intended use is permitted by the applicable Apple licence.

For a general website implementation, use:

```css
font-family:
  -apple-system,
  BlinkMacSystemFont,
  "Segoe UI",
  Helvetica,
  Arial,
  sans-serif;
```

---

## 8.2 Font weights

Apple’s typography guidance recommends avoiding very light weights for small text and prioritizing legibility.

```json
{
  "foundation": {
    "font-weight": {
      "$type": "fontWeight",
      "regular": { "$value": 400 },
      "medium": { "$value": 500 },
      "semibold": { "$value": 600 },
      "bold": { "$value": 700 }
    }
  }
}
```

Marketing display typography may use lighter optical treatments at large sizes, but these should not be generalized to compact controls or body text.

---

## 8.3 Font-size scale

The following web scale is reconstructed from repeated Apple.com hierarchy.

```json
{
  "foundation": {
    "font-size": {
      "$type": "dimension",
      "100": { "$value": { "value": 11, "unit": "px" } },
      "150": { "$value": { "value": 12, "unit": "px" } },
      "200": { "$value": { "value": 14, "unit": "px" } },
      "300": { "$value": { "value": 17, "unit": "px" } },
      "350": { "$value": { "value": 19, "unit": "px" } },
      "400": { "$value": { "value": 21, "unit": "px" } },
      "500": { "$value": { "value": 24, "unit": "px" } },
      "600": { "$value": { "value": 28, "unit": "px" } },
      "700": { "$value": { "value": 32, "unit": "px" } },
      "800": { "$value": { "value": 40, "unit": "px" } },
      "900": { "$value": { "value": 48, "unit": "px" } },
      "1000": { "$value": { "value": 56, "unit": "px" } },
      "1100": { "$value": { "value": 64, "unit": "px" } },
      "1200": { "$value": { "value": 72, "unit": "px" } },
      "1300": { "$value": { "value": 80, "unit": "px" } },
      "1400": { "$value": { "value": 96, "unit": "px" } },
      "1500": { "$value": { "value": 120, "unit": "px" } }
    }
  }
}
```

---

## 8.4 Line-height scale

```json
{
  "foundation": {
    "line-height": {
      "$type": "number",
      "display-tight": { "$value": 1.0 },
      "display": { "$value": 1.05 },
      "heading-tight": { "$value": 1.08 },
      "heading": { "$value": 1.14 },
      "compact": { "$value": 1.25 },
      "body": { "$value": 1.47 },
      "legal": { "$value": 1.33 }
    }
  }
}
```

---

## 8.5 Letter spacing

```json
{
  "foundation": {
    "letter-spacing": {
      "$type": "dimension",
      "display-xl": {
        "$value": { "value": -0.05, "unit": "rem" }
      },
      "display": {
        "$value": { "value": -0.035, "unit": "rem" }
      },
      "heading": {
        "$value": { "value": -0.02, "unit": "rem" }
      },
      "body": {
        "$value": { "value": -0.005, "unit": "rem" }
      },
      "normal": {
        "$value": { "value": 0, "unit": "rem" }
      },
      "legal": {
        "$value": { "value": 0.005, "unit": "rem" }
      }
    }
  }
}
```

---

## 8.6 Semantic typography

```json
{
  "semantic": {
    "typography": {
      "global-nav": {
        "$type": "typography",
        "$value": {
          "fontFamily": "{foundation.font-family.text}",
          "fontSize": "{foundation.font-size.150}",
          "fontWeight": "{foundation.font-weight.regular}",
          "letterSpacing": "{foundation.letter-spacing.normal}",
          "lineHeight": "{foundation.line-height.compact}"
        }
      },
      "eyebrow": {
        "$type": "typography",
        "$value": {
          "fontFamily": "{foundation.font-family.text}",
          "fontSize": "{foundation.font-size.300}",
          "fontWeight": "{foundation.font-weight.semibold}",
          "letterSpacing": "{foundation.letter-spacing.body}",
          "lineHeight": "{foundation.line-height.compact}"
        }
      },
      "hero-display-xl": {
        "$type": "typography",
        "$value": {
          "fontFamily": "{foundation.font-family.display}",
          "fontSize": "{foundation.font-size.1400}",
          "fontWeight": "{foundation.font-weight.semibold}",
          "letterSpacing": "{foundation.letter-spacing.display-xl}",
          "lineHeight": "{foundation.line-height.display-tight}"
        }
      },
      "hero-display": {
        "$type": "typography",
        "$value": {
          "fontFamily": "{foundation.font-family.display}",
          "fontSize": "{foundation.font-size.1000}",
          "fontWeight": "{foundation.font-weight.semibold}",
          "letterSpacing": "{foundation.letter-spacing.display}",
          "lineHeight": "{foundation.line-height.display}"
        }
      },
      "page-title": {
        "$type": "typography",
        "$value": {
          "fontFamily": "{foundation.font-family.display}",
          "fontSize": "{foundation.font-size.900}",
          "fontWeight": "{foundation.font-weight.semibold}",
          "letterSpacing": "{foundation.letter-spacing.heading}",
          "lineHeight": "{foundation.line-height.heading-tight}"
        }
      },
      "section-title": {
        "$type": "typography",
        "$value": {
          "fontFamily": "{foundation.font-family.display}",
          "fontSize": "{foundation.font-size.800}",
          "fontWeight": "{foundation.font-weight.semibold}",
          "letterSpacing": "{foundation.letter-spacing.heading}",
          "lineHeight": "{foundation.line-height.heading}"
        }
      },
      "card-title-large": {
        "$type": "typography",
        "$value": {
          "fontFamily": "{foundation.font-family.display}",
          "fontSize": "{foundation.font-size.700}",
          "fontWeight": "{foundation.font-weight.semibold}",
          "letterSpacing": "{foundation.letter-spacing.heading}",
          "lineHeight": "{foundation.line-height.heading}"
        }
      },
      "card-title": {
        "$type": "typography",
        "$value": {
          "fontFamily": "{foundation.font-family.display}",
          "fontSize": "{foundation.font-size.500}",
          "fontWeight": "{foundation.font-weight.semibold}",
          "letterSpacing": "{foundation.letter-spacing.body}",
          "lineHeight": "{foundation.line-height.compact}"
        }
      },
      "intro": {
        "$type": "typography",
        "$value": {
          "fontFamily": "{foundation.font-family.text}",
          "fontSize": "{foundation.font-size.400}",
          "fontWeight": "{foundation.font-weight.regular}",
          "letterSpacing": "{foundation.letter-spacing.body}",
          "lineHeight": "{foundation.line-height.body}"
        }
      },
      "body": {
        "$type": "typography",
        "$value": {
          "fontFamily": "{foundation.font-family.text}",
          "fontSize": "{foundation.font-size.300}",
          "fontWeight": "{foundation.font-weight.regular}",
          "letterSpacing": "{foundation.letter-spacing.body}",
          "lineHeight": "{foundation.line-height.body}"
        }
      },
      "body-small": {
        "$type": "typography",
        "$value": {
          "fontFamily": "{foundation.font-family.text}",
          "fontSize": "{foundation.font-size.200}",
          "fontWeight": "{foundation.font-weight.regular}",
          "letterSpacing": "{foundation.letter-spacing.normal}",
          "lineHeight": "{foundation.line-height.body}"
        }
      },
      "label": {
        "$type": "typography",
        "$value": {
          "fontFamily": "{foundation.font-family.text}",
          "fontSize": "{foundation.font-size.200}",
          "fontWeight": "{foundation.font-weight.semibold}",
          "letterSpacing": "{foundation.letter-spacing.normal}",
          "lineHeight": "{foundation.line-height.compact}"
        }
      },
      "footnote": {
        "$type": "typography",
        "$value": {
          "fontFamily": "{foundation.font-family.text}",
          "fontSize": "{foundation.font-size.150}",
          "fontWeight": "{foundation.font-weight.regular}",
          "letterSpacing": "{foundation.letter-spacing.legal}",
          "lineHeight": "{foundation.line-height.legal}"
        }
      }
    }
  }
}
```

### Responsive typography rule

Large display styles must use responsive interpolation instead of a single fixed size.

```css
font-size: clamp(3rem, 7vw, 6rem);
```

The exact clamp must be tuned for the component’s content measure and product artwork.

---

# 9. Spacing and dimensions

## 9.1 Base spacing scale

```json
{
  "foundation": {
    "space": {
      "$type": "dimension",
      "0": { "$value": { "value": 0, "unit": "px" } },
      "0-5": { "$value": { "value": 2, "unit": "px" } },
      "1": { "$value": { "value": 4, "unit": "px" } },
      "2": { "$value": { "value": 8, "unit": "px" } },
      "3": { "$value": { "value": 12, "unit": "px" } },
      "4": { "$value": { "value": 16, "unit": "px" } },
      "5": { "$value": { "value": 20, "unit": "px" } },
      "6": { "$value": { "value": 24, "unit": "px" } },
      "7": { "$value": { "value": 28, "unit": "px" } },
      "8": { "$value": { "value": 32, "unit": "px" } },
      "10": { "$value": { "value": 40, "unit": "px" } },
      "12": { "$value": { "value": 48, "unit": "px" } },
      "14": { "$value": { "value": 56, "unit": "px" } },
      "16": { "$value": { "value": 64, "unit": "px" } },
      "18": { "$value": { "value": 72, "unit": "px" } },
      "20": { "$value": { "value": 80, "unit": "px" } },
      "24": { "$value": { "value": 96, "unit": "px" } },
      "30": { "$value": { "value": 120, "unit": "px" } },
      "36": { "$value": { "value": 144, "unit": "px" } },
      "40": { "$value": { "value": 160, "unit": "px" } }
    }
  }
}
```

## 9.2 Semantic spacing

```json
{
  "semantic": {
    "space": {
      "$type": "dimension",
      "inline-tight": { "$value": "{foundation.space.2}" },
      "inline-default": { "$value": "{foundation.space.4}" },
      "inline-comfortable": { "$value": "{foundation.space.6}" },
      "stack-tight": { "$value": "{foundation.space.2}" },
      "stack-default": { "$value": "{foundation.space.4}" },
      "stack-relaxed": { "$value": "{foundation.space.6}" },
      "component-gap": { "$value": "{foundation.space.5}" },
      "card-padding-small": { "$value": "{foundation.space.5}" },
      "card-padding": { "$value": "{foundation.space.8}" },
      "card-padding-large": { "$value": "{foundation.space.12}" },
      "section-gap-small": { "$value": "{foundation.space.16}" },
      "section-gap": { "$value": "{foundation.space.24}" },
      "section-gap-large": { "$value": "{foundation.space.36}" },
      "page-gutter-small": { "$value": "{foundation.space.4}" },
      "page-gutter-medium": { "$value": "{foundation.space.6}" },
      "page-gutter-large": { "$value": "{foundation.space.8}" }
    }
  }
}
```

## 9.3 Control dimensions

```json
{
  "foundation": {
    "size": {
      "$type": "dimension",
      "control-xs": { "$value": { "value": 28, "unit": "px" } },
      "control-sm": { "$value": { "value": 32, "unit": "px" } },
      "control-md": { "$value": { "value": 36, "unit": "px" } },
      "control-lg": { "$value": { "value": 44, "unit": "px" } },
      "control-xl": { "$value": { "value": 52, "unit": "px" } },
      "touch-target-min": { "$value": { "value": 44, "unit": "px" } },
      "global-nav-height": { "$value": { "value": 44, "unit": "px" } },
      "local-nav-height": { "$value": { "value": 52, "unit": "px" } }
    }
  }
}
```

---

# 10. Radius and border tokens

## 10.1 Radius scale

Apple.com combines square editorial fields, softly rounded cards, pill buttons, and circular controls.

```json
{
  "foundation": {
    "radius": {
      "$type": "dimension",
      "none": { "$value": { "value": 0, "unit": "px" } },
      "xs": { "$value": { "value": 4, "unit": "px" } },
      "sm": { "$value": { "value": 8, "unit": "px" } },
      "md": { "$value": { "value": 12, "unit": "px" } },
      "lg": { "$value": { "value": 18, "unit": "px" } },
      "xl": { "$value": { "value": 24, "unit": "px" } },
      "2xl": { "$value": { "value": 28, "unit": "px" } },
      "3xl": { "$value": { "value": 32, "unit": "px" } },
      "full": { "$value": { "value": 9999, "unit": "px" } }
    }
  }
}
```

## 10.2 Border widths

```json
{
  "foundation": {
    "border-width": {
      "$type": "dimension",
      "none": { "$value": { "value": 0, "unit": "px" } },
      "hairline": { "$value": { "value": 1, "unit": "px" } },
      "strong": { "$value": { "value": 2, "unit": "px" } },
      "focus": { "$value": { "value": 3, "unit": "px" } }
    }
  }
}
```

## 10.3 Semantic radii

```json
{
  "semantic": {
    "radius": {
      "$type": "dimension",
      "control": { "$value": "{foundation.radius.full}" },
      "compact-control": { "$value": "{foundation.radius.sm}" },
      "card-small": { "$value": "{foundation.radius.lg}" },
      "card": { "$value": "{foundation.radius.2xl}" },
      "card-large": { "$value": "{foundation.radius.3xl}" },
      "modal": { "$value": "{foundation.radius.lg}" },
      "media": { "$value": "{foundation.radius.xl}" },
      "circle": { "$value": "{foundation.radius.full}" }
    }
  }
}
```

---

# 11. Shadow and elevation tokens

Apple.com generally prefers clean surfaces, image depth, spacing, and contrast over visible shadow.

```json
{
  "foundation": {
    "shadow": {
      "none": {
        "$type": "shadow",
        "$value": {
          "color": "#00000000",
          "offsetX": { "value": 0, "unit": "px" },
          "offsetY": { "value": 0, "unit": "px" },
          "blur": { "value": 0, "unit": "px" },
          "spread": { "value": 0, "unit": "px" }
        }
      },
      "subtle": {
        "$type": "shadow",
        "$value": {
          "color": "#00000014",
          "offsetX": { "value": 0, "unit": "px" },
          "offsetY": { "value": 2, "unit": "px" },
          "blur": { "value": 8, "unit": "px" },
          "spread": { "value": 0, "unit": "px" }
        }
      },
      "card": {
        "$type": "shadow",
        "$value": {
          "color": "#0000001A",
          "offsetX": { "value": 0, "unit": "px" },
          "offsetY": { "value": 4, "unit": "px" },
          "blur": { "value": 18, "unit": "px" },
          "spread": { "value": 0, "unit": "px" }
        }
      },
      "floating": {
        "$type": "shadow",
        "$value": {
          "color": "#00000024",
          "offsetX": { "value": 0, "unit": "px" },
          "offsetY": { "value": 8, "unit": "px" },
          "blur": { "value": 28, "unit": "px" },
          "spread": { "value": 0, "unit": "px" }
        }
      },
      "modal": {
        "$type": "shadow",
        "$value": {
          "color": "#00000033",
          "offsetX": { "value": 0, "unit": "px" },
          "offsetY": { "value": 18, "unit": "px" },
          "blur": { "value": 60, "unit": "px" },
          "spread": { "value": 0, "unit": "px" }
        }
      }
    }
  }
}
```

```json
{
  "semantic": {
    "elevation": {
      "flat": { "$value": "{foundation.shadow.none}" },
      "subtle": { "$value": "{foundation.shadow.subtle}" },
      "card": { "$value": "{foundation.shadow.card}" },
      "floating": { "$value": "{foundation.shadow.floating}" },
      "modal": { "$value": "{foundation.shadow.modal}" }
    }
  }
}
```

---

# 12. Motion tokens

Apple’s public design guidance emphasizes deliberate, smooth, useful motion. Apple.com uses motion for product storytelling, scroll progression, galleries, menu disclosure, and state change.

```json
{
  "foundation": {
    "duration": {
      "$type": "duration",
      "instant": { "$value": { "value": 0, "unit": "ms" } },
      "fast": { "$value": { "value": 120, "unit": "ms" } },
      "standard": { "$value": { "value": 200, "unit": "ms" } },
      "moderate": { "$value": { "value": 350, "unit": "ms" } },
      "slow": { "$value": { "value": 600, "unit": "ms" } },
      "story": { "$value": { "value": 1000, "unit": "ms" } }
    },
    "easing": {
      "$type": "cubicBezier",
      "standard": { "$value": [0.25, 0.1, 0.25, 1] },
      "enter": { "$value": [0.16, 1, 0.3, 1] },
      "exit": { "$value": [0.7, 0, 0.84, 0] },
      "smooth": { "$value": [0.4, 0, 0.2, 1] },
      "spring-like": { "$value": [0.34, 1.56, 0.64, 1] }
    }
  }
}
```

```json
{
  "semantic": {
    "motion": {
      "interaction": {
        "$type": "transition",
        "$value": {
          "duration": "{foundation.duration.standard}",
          "delay": "{foundation.duration.instant}",
          "timingFunction": "{foundation.easing.standard}"
        }
      },
      "menu-enter": {
        "$type": "transition",
        "$value": {
          "duration": "{foundation.duration.moderate}",
          "delay": "{foundation.duration.instant}",
          "timingFunction": "{foundation.easing.enter}"
        }
      },
      "menu-exit": {
        "$type": "transition",
        "$value": {
          "duration": "{foundation.duration.fast}",
          "delay": "{foundation.duration.instant}",
          "timingFunction": "{foundation.easing.exit}"
        }
      },
      "gallery": {
        "$type": "transition",
        "$value": {
          "duration": "{foundation.duration.slow}",
          "delay": "{foundation.duration.instant}",
          "timingFunction": "{foundation.easing.smooth}"
        }
      }
    }
  }
}
```

### Motion rules

- Motion must reinforce hierarchy, continuity, or cause and effect.
- Avoid blocking interaction for decorative sequencing.
- Preserve content position where possible during loading.
- Scroll-linked effects must remain readable and controllable.
- Respect `prefers-reduced-motion`.
- Reduced-motion mode should replace large transforms with opacity or immediate state changes.
- Never require animation to understand essential information.
- Autoplay media requires appropriate controls.

---

# 13. Breakpoints and layout

## 13.1 Reconstructed Apple.com breakpoints

Apple.com frequently uses a three-range responsive model close to small, medium, and large layouts.

```json
{
  "foundation": {
    "breakpoint": {
      "$type": "dimension",
      "small-min": { "$value": { "value": 0, "unit": "px" } },
      "small-max": { "$value": { "value": 734, "unit": "px" } },
      "medium-min": { "$value": { "value": 735, "unit": "px" } },
      "medium-max": { "$value": { "value": 1068, "unit": "px" } },
      "large-min": { "$value": { "value": 1069, "unit": "px" } },
      "wide": { "$value": { "value": 1440, "unit": "px" } },
      "ultra-wide": { "$value": { "value": 2560, "unit": "px" } }
    }
  }
}
```

These values are reconstructed and must be verified against the specific current page CSS.

## 13.2 Content widths

```json
{
  "semantic": {
    "layout": {
      "global-nav-max": {
        "$type": "dimension",
        "$value": { "value": 1024, "unit": "px" }
      },
      "footer-max": {
        "$type": "dimension",
        "$value": { "value": 980, "unit": "px" }
      },
      "content-narrow": {
        "$type": "dimension",
        "$value": { "value": 680, "unit": "px" }
      },
      "content-reading": {
        "$type": "dimension",
        "$value": { "value": 760, "unit": "px" }
      },
      "content-standard": {
        "$type": "dimension",
        "$value": { "value": 980, "unit": "px" }
      },
      "content-wide": {
        "$type": "dimension",
        "$value": { "value": 1200, "unit": "px" }
      },
      "content-ultra": {
        "$type": "dimension",
        "$value": { "value": 1440, "unit": "px" }
      },
      "homepage-tile-gap": {
        "$type": "dimension",
        "$value": { "value": 12, "unit": "px" }
      }
    }
  }
}
```

## 13.3 Grid

```json
{
  "semantic": {
    "layout": {
      "columns-small": {
        "$type": "number",
        "$value": 4
      },
      "columns-medium": {
        "$type": "number",
        "$value": 8
      },
      "columns-large": {
        "$type": "number",
        "$value": 12
      },
      "gutter-small": {
        "$type": "dimension",
        "$value": "{semantic.space.page-gutter-small}"
      },
      "gutter-medium": {
        "$type": "dimension",
        "$value": "{semantic.space.page-gutter-medium}"
      },
      "gutter-large": {
        "$type": "dimension",
        "$value": "{semantic.space.page-gutter-large}"
      }
    }
  }
}
```

## 13.4 Layout behaviours

### Small

- Single-column narrative flow.
- Simplified global navigation.
- Local navigation becomes compact or horizontally constrained.
- Cards become full-width or horizontally scrollable.
- Product comparison reduces visible columns.
- Large display typography scales down aggressively.
- Media may crop or reorder to preserve the product story.
- CTA groups wrap without changing hierarchy.

### Medium

- Two-column editorial compositions become available.
- Card rails preserve partial next-card visibility.
- Product and copy can share a balanced frame.
- Navigation remains compact but gains horizontal room.

### Large

- Twelve-column composition.
- Large product-media fields.
- Two-up homepage tiles.
- Wide editorial sections with controlled copy measures.
- Sticky or scroll-linked storytelling may activate.
- Product lineup and comparison modules show additional columns.

### Ultra-wide

- Do not stretch text measure indefinitely.
- Artwork may scale or receive additional negative space.
- Content remains centered inside a maximum logical width.
- Background fields can extend edge to edge.

---

# 14. Icon and symbol tokens

Apple Design Resources describes SF Symbols as a large symbol library designed to integrate with San Francisco, align with text, match weights, adapt directionally, and support accessibility features.

```json
{
  "foundation": {
    "icon-size": {
      "$type": "dimension",
      "xs": { "$value": { "value": 10, "unit": "px" } },
      "sm": { "$value": { "value": 14, "unit": "px" } },
      "md": { "$value": { "value": 17, "unit": "px" } },
      "lg": { "$value": { "value": 21, "unit": "px" } },
      "xl": { "$value": { "value": 28, "unit": "px" } },
      "2xl": { "$value": { "value": 40, "unit": "px" } }
    }
  }
}
```

### Symbol rules

- Match symbol weight to adjacent text.
- Maintain optical alignment.
- Mirror directional symbols in right-to-left contexts where appropriate.
- Provide an accessible name for functional symbols.
- Hide decorative symbols from assistive technology.
- Do not redistribute SF Symbols assets without complying with their licence.
- On general web implementations, use legally licensed SVG equivalents with the same semantic and optical principles.

---

# 15. Z-index tokens

```json
{
  "foundation": {
    "z-index": {
      "$type": "number",
      "base": { "$value": 0 },
      "raised": { "$value": 10 },
      "sticky-content": { "$value": 100 },
      "local-navigation": { "$value": 200 },
      "global-navigation": { "$value": 300 },
      "dropdown": { "$value": 400 },
      "scrim": { "$value": 500 },
      "drawer": { "$value": 600 },
      "modal": { "$value": 700 },
      "toast": { "$value": 800 },
      "tooltip": { "$value": 900 }
    }
  }
}
```

---

# 16. Semantic colour system

## 16.1 Light theme

```json
{
  "semantic": {
    "color": {
      "light": {
        "text": {
          "primary": { "$value": "{foundation.color.neutral.gray-900}" },
          "secondary": { "$value": "{foundation.color.neutral.gray-600}" },
          "tertiary": { "$value": "{foundation.color.neutral.gray-500}" },
          "disabled": { "$value": "{foundation.color.neutral.gray-400}" },
          "inverse": { "$value": "{foundation.color.neutral.gray-50}" },
          "link": { "$value": "{foundation.color.blue.500}" },
          "link-hover": { "$value": "{foundation.color.blue.600}" }
        },
        "background": {
          "canvas": { "$value": "{foundation.color.neutral.white}" },
          "alternate": { "$value": "{foundation.color.neutral.gray-50}" },
          "subtle": { "$value": "{foundation.color.neutral.near-white}" },
          "elevated": { "$value": "{foundation.color.neutral.white}" },
          "selected": { "$value": "{foundation.color.blue.100}" },
          "scrim": { "$value": "#0000007A" }
        },
        "border": {
          "subtle": { "$value": "{foundation.color.neutral.gray-100}" },
          "default": { "$value": "{foundation.color.neutral.gray-200}" },
          "strong": { "$value": "{foundation.color.neutral.gray-500}" },
          "focus": { "$value": "{foundation.color.blue.600}" },
          "error": { "$value": "{foundation.color.functional.error}" }
        }
      }
    }
  }
}
```

## 16.2 Dark theme

```json
{
  "semantic": {
    "color": {
      "dark": {
        "text": {
          "primary": { "$value": "{foundation.color.neutral.gray-50}" },
          "secondary": { "$value": "{foundation.color.neutral.gray-400}" },
          "tertiary": { "$value": "{foundation.color.neutral.gray-500}" },
          "disabled": { "$value": "{foundation.color.neutral.gray-600}" },
          "inverse": { "$value": "{foundation.color.neutral.gray-900}" },
          "link": { "$value": "#2997FF" },
          "link-hover": { "$value": "#4EAAFF" }
        },
        "background": {
          "canvas": { "$value": "{foundation.color.neutral.black}" },
          "alternate": { "$value": "{foundation.color.neutral.gray-950}" },
          "subtle": { "$value": "{foundation.color.neutral.gray-900}" },
          "elevated": { "$value": "{foundation.color.neutral.gray-800}" },
          "selected": { "$value": "#0A3B66" },
          "scrim": { "$value": "#000000B8" }
        },
        "border": {
          "subtle": { "$value": "{foundation.color.neutral.gray-800}" },
          "default": { "$value": "{foundation.color.neutral.gray-700}" },
          "strong": { "$value": "{foundation.color.neutral.gray-400}" },
          "focus": { "$value": "#2997FF" },
          "error": { "$value": "#FF6961" }
        }
      }
    }
  }
}
```

## 16.3 Action colours

```json
{
  "semantic": {
    "color": {
      "action": {
        "primary": {
          "background": { "$value": "{foundation.color.blue.600}" },
          "background-hover": { "$value": "{foundation.color.blue.650}" },
          "background-active": { "$value": "{foundation.color.blue.700}" },
          "content": { "$value": "{foundation.color.neutral.white}" },
          "border": { "$value": "{foundation.color.blue.600}" }
        },
        "secondary-light": {
          "background": { "$value": "#FFFFFF00" },
          "background-hover": { "$value": "{foundation.color.blue.100}" },
          "content": { "$value": "{foundation.color.blue.500}" },
          "border": { "$value": "{foundation.color.blue.600}" }
        },
        "secondary-dark": {
          "background": { "$value": "#00000000" },
          "background-hover": { "$value": "#2997FF1F" },
          "content": { "$value": "#2997FF" },
          "border": { "$value": "#2997FF" }
        },
        "disabled-light": {
          "background": { "$value": "{foundation.color.neutral.gray-100}" },
          "content": { "$value": "{foundation.color.neutral.gray-500}" }
        },
        "disabled-dark": {
          "background": { "$value": "{foundation.color.neutral.gray-800}" },
          "content": { "$value": "{foundation.color.neutral.gray-500}" }
        }
      }
    }
  }
}
```

---

# 17. Focus and interaction states

```json
{
  "semantic": {
    "focus": {
      "ring-color-light": {
        "$type": "color",
        "$value": "{foundation.color.blue.600}"
      },
      "ring-color-dark": {
        "$type": "color",
        "$value": "#2997FF"
      },
      "ring-width": {
        "$type": "dimension",
        "$value": "{foundation.border-width.focus}"
      },
      "ring-offset": {
        "$type": "dimension",
        "$value": "{foundation.space.0-5}"
      }
    }
  }
}
```

### State matrix

| State | Required visual treatment |
|---|---|
| Rest | Default semantic content and surface |
| Hover | Subtle colour, opacity, underline, or surface shift |
| Focus visible | High-contrast ring independent of hover |
| Active | Darker colour, slight opacity shift, or controlled transform |
| Selected | Persistent semantic treatment and non-colour cue |
| Disabled | Reduced emphasis and disabled semantics |
| Loading | Stable layout and clear progress |
| Error | Error message, icon or label, and associated control state |
| Expanded | Correct disclosure icon and ARIA state |
| Current | Current-page marker in local or chapter navigation |

---

# 18. Component tokens

## 18.1 Global navigation

Observed anatomy:

```text
Global navigation
├── Apple home mark
├── Store
├── Mac
├── iPad
├── iPhone
├── Watch
├── Vision
├── AirPods
├── TV & Home
├── Entertainment
├── Accessories
├── Support
├── Search
└── Bag
```

```json
{
  "component": {
    "global-navigation": {
      "height": { "$value": "{foundation.size.global-nav-height}" },
      "max-width": { "$value": "{semantic.layout.global-nav-max}" },
      "padding-inline-small": { "$value": "{semantic.space.page-gutter-small}" },
      "padding-inline-large": { "$value": "{semantic.space.page-gutter-large}" },
      "item-gap": { "$value": "{foundation.space.7}" },
      "typography": { "$value": "{semantic.typography.global-nav}" },
      "icon-size": { "$value": "{foundation.icon-size.md}" },
      "z-index": { "$value": "{foundation.z-index.global-navigation}" },
      "light": {
        "content": { "$value": "#000000CC" },
        "content-hover": { "$value": "{foundation.color.neutral.black}" },
        "surface": { "$value": "#FAFAFCCC" }
      },
      "dark": {
        "content": { "$value": "#FFFFFFCC" },
        "content-hover": { "$value": "{foundation.color.neutral.white}" },
        "surface": { "$value": "#161617CC" }
      },
      "backdrop-blur": {
        "$type": "dimension",
        "$value": { "value": 20, "unit": "px" }
      }
    }
  }
}
```

### Navigation behaviour

- Global navigation is compact and content-first.
- Desktop exposes the category links horizontally.
- Small screens replace the horizontal list with a menu trigger.
- Search and bag remain top-level utilities.
- Expanded navigation acts as a structured disclosure or megamenu.
- Keyboard and screen-reader navigation must remain complete.
- The navigation material adapts to light and dark page contexts.
- Scrolling may increase surface opacity for legibility.

---

## 18.2 Global search overlay

```json
{
  "component": {
    "global-search": {
      "surface-light": { "$value": "{foundation.color.neutral.near-white}" },
      "surface-dark": { "$value": "{foundation.color.neutral.gray-950}" },
      "content-light": { "$value": "{foundation.color.neutral.gray-900}" },
      "content-dark": { "$value": "{foundation.color.neutral.gray-50}" },
      "placeholder-light": { "$value": "{foundation.color.neutral.gray-500}" },
      "placeholder-dark": { "$value": "{foundation.color.neutral.gray-400}" },
      "input-height": { "$value": "{foundation.size.control-xl}" },
      "input-font-size": { "$value": "{foundation.font-size.500}" },
      "result-row-min-height": { "$value": "{foundation.size.control-lg}" },
      "result-gap": { "$value": "{foundation.space.2}" },
      "section-gap": { "$value": "{foundation.space.6}" },
      "icon-size": { "$value": "{foundation.icon-size.lg}" },
      "scrim": { "$value": "#0000007A" },
      "z-index": { "$value": "{foundation.z-index.dropdown}" }
    }
  }
}
```

### Search requirements

- Use combobox semantics where suggestions are dynamic.
- Provide a clear accessible name.
- Keyboard users can move through results.
- Escape closes the overlay.
- Focus returns to the search trigger.
- Recent searches and quick links are labelled as separate groups.
- Search results do not rely on icons alone.

---

## 18.3 Local navigation

Product pages use a local bar that identifies the current product or family and exposes local links and a purchase CTA.

```json
{
  "component": {
    "local-navigation": {
      "height": { "$value": "{foundation.size.local-nav-height}" },
      "max-width": { "$value": "{semantic.layout.content-standard}" },
      "surface-light": { "$value": "#FFFFFFE0" },
      "surface-dark": { "$value": "#1D1D1FE0" },
      "content-light": { "$value": "{foundation.color.neutral.gray-900}" },
      "content-dark": { "$value": "{foundation.color.neutral.gray-50}" },
      "secondary-content-light": { "$value": "{foundation.color.neutral.gray-600}" },
      "secondary-content-dark": { "$value": "{foundation.color.neutral.gray-400}" },
      "divider-light": { "$value": "{foundation.color.neutral.gray-200}" },
      "divider-dark": { "$value": "{foundation.color.neutral.gray-700}" },
      "title-font-size": { "$value": "{foundation.font-size.400}" },
      "title-font-weight": { "$value": "{foundation.font-weight.semibold}" },
      "link-font-size": { "$value": "{foundation.font-size.150}" },
      "item-gap": { "$value": "{foundation.space.6}" },
      "backdrop-blur": {
        "$type": "dimension",
        "$value": { "value": 20, "unit": "px" }
      },
      "z-index": { "$value": "{foundation.z-index.local-navigation}" }
    }
  }
}
```

---

## 18.4 Chapter navigation

Product-family pages display a horizontal row of product icons and labels.

```json
{
  "component": {
    "chapter-navigation": {
      "background": { "$value": "{foundation.color.neutral.near-white}" },
      "content": { "$value": "{foundation.color.neutral.gray-900}" },
      "secondary-content": { "$value": "{foundation.color.neutral.gray-600}" },
      "new-content": { "$value": "#B64400" },
      "item-min-width": {
        "$type": "dimension",
        "$value": { "value": 72, "unit": "px" }
      },
      "item-gap": { "$value": "{foundation.space.5}" },
      "padding-block": { "$value": "{foundation.space.3}" },
      "label-font-size": { "$value": "{foundation.font-size.100}" },
      "image-height": {
        "$type": "dimension",
        "$value": { "value": 54, "unit": "px" }
      },
      "scroll-padding": { "$value": "{semantic.space.page-gutter-small}" }
    }
  }
}
```

### Chapter-navigation behaviour

- Horizontal scrolling is available on narrow screens.
- Product image and label form one focusable destination.
- Current destination is distinguishable without colour alone.
- “New” status is supplementary text.
- Scrollbars can be visually minimized but not at the cost of operability.

---

## 18.5 Promotional ribbon

Apple.com places compact messages below navigation for education savings, trade-in, shipping, and related promotions.

```json
{
  "component": {
    "ribbon": {
      "min-height": { "$value": "{foundation.size.control-lg}" },
      "background-light": { "$value": "{foundation.color.neutral.gray-50}" },
      "background-dark": { "$value": "{foundation.color.neutral.gray-900}" },
      "content-light": { "$value": "{foundation.color.neutral.gray-900}" },
      "content-dark": { "$value": "{foundation.color.neutral.gray-50}" },
      "font-size": { "$value": "{foundation.font-size.200}" },
      "line-height": { "$value": "{foundation.line-height.body}" },
      "padding-inline": { "$value": "{semantic.space.page-gutter-small}" },
      "padding-block": { "$value": "{foundation.space.3}" },
      "link": { "$value": "{foundation.color.blue.500}" }
    }
  }
}
```

---

## 18.6 Buttons

Observed variants:

```text
primary filled
secondary outlined
compact buy
text link with chevron
icon-only circular
floating media control
```

```json
{
  "component": {
    "button": {
      "font-family": { "$value": "{foundation.font-family.text}" },
      "font-weight": { "$value": "{foundation.font-weight.regular}" },
      "font-size": { "$value": "{foundation.font-size.300}" },
      "radius": { "$value": "{semantic.radius.control}" },
      "height-small": { "$value": "{foundation.size.control-sm}" },
      "height-medium": { "$value": "{foundation.size.control-md}" },
      "height-large": { "$value": "{foundation.size.control-lg}" },
      "padding-inline-small": { "$value": "{foundation.space.4}" },
      "padding-inline-medium": { "$value": "{foundation.space.5}" },
      "padding-inline-large": { "$value": "{foundation.space.6}" },
      "gap": { "$value": "{foundation.space.2}" },
      "border-width": { "$value": "{foundation.border-width.hairline}" },
      "primary": {
        "background": { "$value": "{semantic.color.action.primary.background}" },
        "background-hover": { "$value": "{semantic.color.action.primary.background-hover}" },
        "background-active": { "$value": "{semantic.color.action.primary.background-active}" },
        "content": { "$value": "{semantic.color.action.primary.content}" },
        "border": { "$value": "{semantic.color.action.primary.border}" }
      },
      "secondary-light": {
        "background": { "$value": "{semantic.color.action.secondary-light.background}" },
        "background-hover": { "$value": "{semantic.color.action.secondary-light.background-hover}" },
        "content": { "$value": "{semantic.color.action.secondary-light.content}" },
        "border": { "$value": "{semantic.color.action.secondary-light.border}" }
      },
      "secondary-dark": {
        "background": { "$value": "{semantic.color.action.secondary-dark.background}" },
        "background-hover": { "$value": "{semantic.color.action.secondary-dark.background-hover}" },
        "content": { "$value": "{semantic.color.action.secondary-dark.content}" },
        "border": { "$value": "{semantic.color.action.secondary-dark.border}" }
      }
    }
  }
}
```

### Button rules

- Use concise labels.
- Primary action appears first in reading order.
- CTA groups commonly pair “Learn more” and “Buy”.
- Buttons use pill geometry.
- Compact purchase buttons can use smaller text and height.
- Loading does not change the button’s external dimensions.
- Icon-only buttons require accessible names.
- Dark campaign modules use a verified dark-theme variant.

---

## 18.7 Text links and chevrons

Apple.com often uses text links followed by a chevron rather than underlining every navigation-style link.

```json
{
  "component": {
    "link": {
      "content-light": { "$value": "{foundation.color.blue.500}" },
      "content-light-hover": { "$value": "{foundation.color.blue.600}" },
      "content-dark": { "$value": "#2997FF" },
      "content-dark-hover": { "$value": "#4EAAFF" },
      "font-size": { "$value": "{foundation.font-size.300}" },
      "gap": { "$value": "{foundation.space.1}" },
      "chevron-size": { "$value": "{foundation.icon-size.xs}" },
      "underline-offset": {
        "$type": "dimension",
        "$value": { "value": 3, "unit": "px" }
      }
    }
  }
}
```

### Link rules

- Inline prose links should be underlined or otherwise unmistakable.
- CTA links can use a trailing chevron.
- Chevron direction adapts to reading direction.
- Hover alone cannot be the only affordance.
- Links and buttons must not be styled identically when their behaviours differ.

---

## 18.8 Icon buttons and floating controls

```json
{
  "component": {
    "icon-button": {
      "size-small": { "$value": "{foundation.size.control-sm}" },
      "size-medium": { "$value": "{foundation.size.control-lg}" },
      "size-large": { "$value": "{foundation.size.control-xl}" },
      "radius": { "$value": "{semantic.radius.circle}" },
      "icon-size-small": { "$value": "{foundation.icon-size.sm}" },
      "icon-size-medium": { "$value": "{foundation.icon-size.md}" },
      "icon-size-large": { "$value": "{foundation.icon-size.lg}" },
      "light": {
        "surface": { "$value": "#FFFFFFD9" },
        "surface-hover": { "$value": "{foundation.color.neutral.white}" },
        "content": { "$value": "{foundation.color.neutral.gray-900}" }
      },
      "dark": {
        "surface": { "$value": "#1D1D1FD9" },
        "surface-hover": { "$value": "{foundation.color.neutral.gray-900}" },
        "content": { "$value": "{foundation.color.neutral.gray-50}" }
      },
      "shadow": { "$value": "{semantic.elevation.subtle}" }
    }
  }
}
```

Common uses:

- play/pause;
- gallery previous/next;
- close;
- expand;
- compare;
- media mute;
- card details.

---

## 18.9 Hero

Apple.com’s homepage and product launches use large media-led heroes.

```json
{
  "component": {
    "hero": {
      "min-height-small": {
        "$type": "dimension",
        "$value": { "value": 500, "unit": "px" }
      },
      "min-height-large": {
        "$type": "dimension",
        "$value": { "value": 692, "unit": "px" }
      },
      "content-max-width": { "$value": "{semantic.layout.content-wide}" },
      "copy-max-width": {
        "$type": "dimension",
        "$value": { "value": 680, "unit": "px" }
      },
      "padding-inline": { "$value": "{semantic.space.page-gutter-small}" },
      "padding-top-small": { "$value": "{foundation.space.12}" },
      "padding-top-large": { "$value": "{foundation.space.14}" },
      "title": { "$value": "{semantic.typography.hero-display}" },
      "subtitle": { "$value": "{semantic.typography.intro}" },
      "copy-gap": { "$value": "{foundation.space.2}" },
      "cta-gap": { "$value": "{foundation.space.4}" },
      "media-fit": {
        "$type": "string",
        "$value": "cover"
      },
      "surface-light": { "$value": "{foundation.color.neutral.gray-50}" },
      "surface-dark": { "$value": "{foundation.color.neutral.black}" }
    }
  }
}
```

### Hero anatomy

```text
Hero
├── optional eyebrow
├── product or campaign title
├── concise proposition
├── CTA pair
└── product artwork or media
```

### Hero rules

- One dominant message.
- Supporting copy remains short.
- Product artwork is never stretched.
- Text placement adapts to artwork rather than using a fixed overlay location everywhere.
- The first CTA is primary.
- Ensure text remains legible at all responsive crops.
- Do not autoplay audio.
- Large animation has a reduced-motion alternative.

---

## 18.10 Homepage tile

The Apple homepage commonly uses a two-column grid of promotional tiles below full-width heroes.

```json
{
  "component": {
    "tile": {
      "min-height-small": {
        "$type": "dimension",
        "$value": { "value": 500, "unit": "px" }
      },
      "min-height-large": {
        "$type": "dimension",
        "$value": { "value": 580, "unit": "px" }
      },
      "gap": { "$value": "{semantic.layout.homepage-tile-gap}" },
      "padding-inline": { "$value": "{foundation.space.4}" },
      "padding-top": { "$value": "{foundation.space.10}" },
      "title": { "$value": "{semantic.typography.section-title}" },
      "subtitle": { "$value": "{semantic.typography.body}" },
      "cta-gap": { "$value": "{foundation.space.4}" },
      "surface-light": { "$value": "{foundation.color.neutral.gray-50}" },
      "surface-dark": { "$value": "{foundation.color.neutral.black}" }
    }
  }
}
```

---

## 18.11 Editorial card

Product-family and accessibility pages use large rounded cards for focused feature narratives.

```json
{
  "component": {
    "editorial-card": {
      "background-light": { "$value": "{foundation.color.neutral.white}" },
      "background-alternate": { "$value": "{foundation.color.neutral.gray-50}" },
      "background-dark": { "$value": "{foundation.color.neutral.gray-900}" },
      "content-light": { "$value": "{foundation.color.neutral.gray-900}" },
      "content-dark": { "$value": "{foundation.color.neutral.gray-50}" },
      "secondary-content-light": { "$value": "{foundation.color.neutral.gray-600}" },
      "secondary-content-dark": { "$value": "{foundation.color.neutral.gray-400}" },
      "radius": { "$value": "{semantic.radius.card}" },
      "padding-small": { "$value": "{semantic.space.card-padding}" },
      "padding-large": { "$value": "{semantic.space.card-padding-large}" },
      "gap": { "$value": "{foundation.space.5}" },
      "shadow-rest": { "$value": "{semantic.elevation.flat}" },
      "shadow-floating": { "$value": "{semantic.elevation.card}" },
      "title": { "$value": "{semantic.typography.card-title-large}" },
      "body": { "$value": "{semantic.typography.body}" },
      "media-radius": { "$value": "{semantic.radius.media}" }
    }
  }
}
```

### Editorial-card variants

- image top / copy bottom;
- copy top / image bottom;
- side-by-side;
- full-bleed media with overlay;
- dark immersive;
- compact resource card;
- expandable detail card.

---

## 18.12 Product lineup card

The Mac and iPhone family pages use product-lineup modules with model names, finish swatches, proposition, CTAs, and product media.

```json
{
  "component": {
    "product-card": {
      "background": { "$value": "{foundation.color.neutral.white}" },
      "content": { "$value": "{foundation.color.neutral.gray-900}" },
      "secondary-content": { "$value": "{foundation.color.neutral.gray-600}" },
      "radius": { "$value": "{semantic.radius.card}" },
      "padding": { "$value": "{semantic.space.card-padding}" },
      "gap": { "$value": "{foundation.space.4}" },
      "image-background": { "$value": "{foundation.color.neutral.white}" },
      "image-aspect-ratio": {
        "$type": "number",
        "$value": 1
      },
      "title": { "$value": "{semantic.typography.card-title}" },
      "body": { "$value": "{semantic.typography.body-small}" },
      "swatch-gap": { "$value": "{foundation.space.2}" },
      "cta-gap": { "$value": "{foundation.space.4}" },
      "min-width-small": {
        "$type": "dimension",
        "$value": { "value": 260, "unit": "px" }
      },
      "min-width-large": {
        "$type": "dimension",
        "$value": { "value": 300, "unit": "px" }
      }
    }
  }
}
```

---

## 18.13 Compare card

```json
{
  "component": {
    "compare-card": {
      "background": { "$value": "{foundation.color.neutral.white}" },
      "content": { "$value": "{foundation.color.neutral.gray-900}" },
      "secondary-content": { "$value": "{foundation.color.neutral.gray-600}" },
      "divider": { "$value": "{foundation.color.neutral.gray-200}" },
      "padding-inline": { "$value": "{foundation.space.6}" },
      "padding-block": { "$value": "{foundation.space.8}" },
      "column-gap": { "$value": "{foundation.space.8}" },
      "row-gap": { "$value": "{foundation.space.6}" },
      "image-height": {
        "$type": "dimension",
        "$value": { "value": 200, "unit": "px" }
      },
      "feature-icon-size": { "$value": "{foundation.icon-size.2xl}" },
      "title": { "$value": "{semantic.typography.card-title}" },
      "feature": { "$value": "{semantic.typography.body-small}" }
    }
  }
}
```

### Comparison rules

- Comparison categories remain aligned by row.
- Empty or unavailable features use clear language, not blank space alone.
- Horizontal scrolling preserves row labels on small screens.
- Product names remain accessible while columns scroll.
- Do not rely on checkmarks or colour alone.

---

## 18.14 Commerce store card

The Apple Store pages use horizontally scrollable rounded cards for product models, buying advice, savings, services, and setup.

```json
{
  "component": {
    "store-card": {
      "background": { "$value": "{foundation.color.neutral.white}" },
      "content": { "$value": "{foundation.color.neutral.gray-900}" },
      "secondary-content": { "$value": "{foundation.color.neutral.gray-600}" },
      "radius": { "$value": "{semantic.radius.card}" },
      "padding": { "$value": "{semantic.space.card-padding}" },
      "shadow": { "$value": "{semantic.elevation.card}" },
      "shadow-hover": { "$value": "{semantic.elevation.floating}" },
      "transition": { "$value": "{semantic.motion.interaction}" },
      "min-width-small": {
        "$type": "dimension",
        "$value": { "value": 280, "unit": "px" }
      },
      "min-width-large": {
        "$type": "dimension",
        "$value": { "value": 400, "unit": "px" }
      },
      "min-height": {
        "$type": "dimension",
        "$value": { "value": 500, "unit": "px" }
      },
      "eyebrow": { "$value": "{semantic.typography.label}" },
      "title": { "$value": "{semantic.typography.card-title-large}" },
      "body": { "$value": "{semantic.typography.body-small}" }
    }
  }
}
```

### Store-card types

- product model;
- shopping guide;
- specialist service;
- trade-in;
- financing;
- carrier deal;
- setup and support;
- accessory promotion;
- ecosystem value.

---

## 18.15 Price

```json
{
  "component": {
    "price": {
      "content-light": { "$value": "{foundation.color.neutral.gray-900}" },
      "content-dark": { "$value": "{foundation.color.neutral.gray-50}" },
      "secondary-content-light": { "$value": "{foundation.color.neutral.gray-600}" },
      "secondary-content-dark": { "$value": "{foundation.color.neutral.gray-400}" },
      "font-family": { "$value": "{foundation.font-family.text}" },
      "font-weight": { "$value": "{foundation.font-weight.semibold}" },
      "small": { "$value": "{foundation.font-size.200}" },
      "medium": { "$value": "{foundation.font-size.300}" },
      "large": { "$value": "{foundation.font-size.500}" },
      "gap": { "$value": "{foundation.space.1}" }
    }
  }
}
```

### Price rules

- Include “From”, “or”, “per month”, and financing context as real text.
- Footnotes remain linked to the relevant claim.
- Installment price and full price are not visually ambiguous.
- Screen readers receive the price in the intended spoken order.
- Superscripts must not interrupt comprehension.

---

## 18.16 Colour swatches

```json
{
  "component": {
    "color-swatch": {
      "size-small": {
        "$type": "dimension",
        "$value": { "value": 12, "unit": "px" }
      },
      "size-medium": {
        "$type": "dimension",
        "$value": { "value": 20, "unit": "px" }
      },
      "size-large": {
        "$type": "dimension",
        "$value": { "value": 32, "unit": "px" }
      },
      "radius": { "$value": "{semantic.radius.circle}" },
      "border": { "$value": "{foundation.color.neutral.gray-200}" },
      "selected-ring": { "$value": "{foundation.color.blue.600}" },
      "selected-ring-width": { "$value": "{foundation.border-width.strong}" },
      "selected-offset": {
        "$type": "dimension",
        "$value": { "value": 3, "unit": "px" }
      }
    }
  }
}
```

### Swatch rules

- Every swatch has a text name.
- Selected state is not colour alone.
- Product finish values are product-scoped tokens.
- Swatches remain large enough to target when interactive.

---

## 18.17 Segmented control and category filters

Product-family pages may use compact category filters such as “All products”, “Laptops”, “Desktops”, and “Displays”.

```json
{
  "component": {
    "segmented-control": {
      "height": { "$value": "{foundation.size.control-lg}" },
      "background": { "$value": "{foundation.color.neutral.gray-100}" },
      "selected-background": { "$value": "{foundation.color.neutral.white}" },
      "content": { "$value": "{foundation.color.neutral.gray-600}" },
      "selected-content": { "$value": "{foundation.color.neutral.gray-900}" },
      "radius": { "$value": "{semantic.radius.control}" },
      "item-radius": { "$value": "{semantic.radius.control}" },
      "padding": { "$value": "{foundation.space.1}" },
      "item-padding-inline": { "$value": "{foundation.space.4}" },
      "shadow-selected": { "$value": "{semantic.elevation.subtle}" },
      "font-size": { "$value": "{foundation.font-size.200}" }
    }
  }
}
```

---

## 18.18 Gallery and horizontal rail

```json
{
  "component": {
    "gallery": {
      "gap-small": { "$value": "{foundation.space.4}" },
      "gap-large": { "$value": "{foundation.space.6}" },
      "scroll-padding-small": { "$value": "{semantic.space.page-gutter-small}" },
      "scroll-padding-large": { "$value": "{semantic.space.page-gutter-large}" },
      "control-size": { "$value": "{foundation.size.control-lg}" },
      "control-radius": { "$value": "{semantic.radius.circle}" },
      "control-shadow": { "$value": "{semantic.elevation.subtle}" },
      "transition": { "$value": "{semantic.motion.gallery}" },
      "progress-track": { "$value": "{foundation.color.neutral.gray-200}" },
      "progress-value": { "$value": "{foundation.color.neutral.gray-900}" }
    }
  }
}
```

### Gallery behaviour

- Use native horizontal scrolling and scroll snapping where practical.
- Preserve partial next-card visibility when it helps discoverability.
- Previous/next controls are keyboard operable.
- Disabled end controls communicate their state.
- Focus does not move unexpectedly during scroll.
- Offscreen cards must not create confusing keyboard order.
- Reduced-motion users receive immediate or minimal movement.

---

## 18.19 Modal and detail overlay

```json
{
  "component": {
    "modal": {
      "surface-light": { "$value": "{foundation.color.neutral.white}" },
      "surface-dark": { "$value": "{foundation.color.neutral.gray-900}" },
      "content-light": { "$value": "{foundation.color.neutral.gray-900}" },
      "content-dark": { "$value": "{foundation.color.neutral.gray-50}" },
      "radius": { "$value": "{semantic.radius.modal}" },
      "padding-small": { "$value": "{foundation.space.6}" },
      "padding-large": { "$value": "{foundation.space.10}" },
      "scrim": { "$value": "#0000007A" },
      "shadow": { "$value": "{semantic.elevation.modal}" },
      "max-width-small": {
        "$type": "dimension",
        "$value": { "value": 480, "unit": "px" }
      },
      "max-width-medium": {
        "$type": "dimension",
        "$value": { "value": 760, "unit": "px" }
      },
      "max-width-large": {
        "$type": "dimension",
        "$value": { "value": 1100, "unit": "px" }
      },
      "z-index": { "$value": "{foundation.z-index.modal}" }
    }
  }
}
```

### Modal requirements

- Move focus into the dialog.
- Maintain a valid focus trap while modal.
- Escape closes when safe.
- Restore focus to the trigger.
- Give the dialog an accessible name.
- Make background content inert.
- Prevent content loss during responsive resizing.

---

## 18.20 Accordion and disclosure

```json
{
  "component": {
    "accordion": {
      "surface": { "$value": "#FFFFFF00" },
      "content-light": { "$value": "{foundation.color.neutral.gray-900}" },
      "content-dark": { "$value": "{foundation.color.neutral.gray-50}" },
      "secondary-content-light": { "$value": "{foundation.color.neutral.gray-600}" },
      "secondary-content-dark": { "$value": "{foundation.color.neutral.gray-400}" },
      "divider-light": { "$value": "{foundation.color.neutral.gray-200}" },
      "divider-dark": { "$value": "{foundation.color.neutral.gray-700}" },
      "header-min-height": { "$value": "{foundation.size.control-xl}" },
      "padding-block": { "$value": "{foundation.space.4}" },
      "content-padding-bottom": { "$value": "{foundation.space.6}" },
      "icon-size": { "$value": "{foundation.icon-size.md}" }
    }
  }
}
```

---

## 18.21 Tab navigation

```json
{
  "component": {
    "tab-navigation": {
      "content-light": { "$value": "{foundation.color.neutral.gray-600}" },
      "content-dark": { "$value": "{foundation.color.neutral.gray-400}" },
      "selected-content-light": { "$value": "{foundation.color.neutral.gray-900}" },
      "selected-content-dark": { "$value": "{foundation.color.neutral.gray-50}" },
      "indicator-light": { "$value": "{foundation.color.neutral.gray-900}" },
      "indicator-dark": { "$value": "{foundation.color.neutral.gray-50}" },
      "indicator-height": { "$value": "{foundation.border-width.strong}" },
      "height": { "$value": "{foundation.size.control-xl}" },
      "gap": { "$value": "{foundation.space.8}" },
      "font-size": { "$value": "{foundation.font-size.200}" }
    }
  }
}
```

---

## 18.22 Footnotes and legal copy

Apple.com uses extensive claim footnotes and a structured “sosumi” legal region.

```json
{
  "component": {
    "footnote": {
      "background": { "$value": "{foundation.color.neutral.gray-50}" },
      "content": { "$value": "{foundation.color.neutral.gray-500}" },
      "link": { "$value": "{foundation.color.neutral.gray-700}" },
      "divider": { "$value": "{foundation.color.neutral.gray-200}" },
      "typography": { "$value": "{semantic.typography.footnote}" },
      "max-width": { "$value": "{semantic.layout.footer-max}" },
      "padding-inline": { "$value": "{semantic.space.page-gutter-small}" },
      "padding-top": { "$value": "{foundation.space.4}" },
      "padding-bottom": { "$value": "{foundation.space.3}" },
      "item-gap": { "$value": "{foundation.space.2}" }
    }
  }
}
```

### Footnote rules

- Claim markers link to the relevant note.
- Footnotes are ordered and uniquely addressable.
- Return links are available where useful.
- Superscript styling does not reduce the interactive target below usability.
- Legal copy remains zoomable and readable.
- Footnotes do not carry essential information that is absent from the main content.

---

## 18.23 Global footer

Observed anatomy:

```text
Global footer
├── claim footnotes and legal notes
├── breadcrumbs on inner pages
├── directory columns
│   ├── Shop and Learn
│   ├── Apple Wallet
│   ├── Account
│   ├── Entertainment
│   ├── Apple Store
│   ├── For Business
│   ├── For Education
│   ├── For Healthcare
│   ├── For Government
│   ├── Apple Values
│   └── About Apple
├── shopping assistance
├── country or region
├── copyright
└── legal links
```

```json
{
  "component": {
    "global-footer": {
      "background": { "$value": "{foundation.color.neutral.gray-50}" },
      "content": { "$value": "{foundation.color.neutral.gray-500}" },
      "heading": { "$value": "{foundation.color.neutral.gray-900}" },
      "link": { "$value": "{foundation.color.neutral.gray-700}" },
      "link-hover": { "$value": "{foundation.color.neutral.gray-900}" },
      "divider": { "$value": "{foundation.color.neutral.gray-200}" },
      "max-width": { "$value": "{semantic.layout.footer-max}" },
      "padding-inline": { "$value": "{semantic.space.page-gutter-small}" },
      "padding-top": { "$value": "{foundation.space.5}" },
      "padding-bottom": { "$value": "{foundation.space.4}" },
      "column-gap": { "$value": "{foundation.space.6}" },
      "section-gap": { "$value": "{foundation.space.5}" },
      "heading-font-size": { "$value": "{foundation.font-size.150}" },
      "link-font-size": { "$value": "{foundation.font-size.150}" },
      "line-height": { "$value": "{foundation.line-height.legal}" }
    }
  }
}
```

### Footer behaviour

- Desktop uses multiple directory columns.
- Small screens transform directory groups into disclosures.
- Disclosure state is communicated with button semantics.
- Country or region selection remains accessible.
- Legal links are distinct and keyboard accessible.
- Footnotes appear before the directory.

---

# 19. Page-template patterns

## 19.1 Homepage

```text
Global navigation
Promotional ribbon
Full-width hero
Full-width hero
Full-width hero
Two-column promotional tile grid
Entertainment/media carousel
Legal footnotes
Global footer
```

### Homepage rules

- Full-width modules are separated by a narrow consistent gap.
- Each hero owns one message and one CTA group.
- Campaign colour stays local.
- Product art is responsive and art-directed.
- Tiles collapse to one column on small screens.
- Entertainment modules can adopt artwork-led dark or colourful styling.

---

## 19.2 Product-family page

Observed on pages such as iPhone and Mac.

```text
Global navigation
Optional ribbon
Family title
Chapter navigation
Editorial hero or opening module
Product lineup
Category segmentation
Buying-value cards
Feature-story cards
Comparison
Accessories
Ecosystem
Footnotes
Global footer
```

### Family-page rules

- Family title remains simple and direct.
- Chapter navigation provides rapid model access.
- Product lineup uses consistent cards and CTA order.
- Feature stories alternate scale and composition to create rhythm.
- “Why Apple is the best place to buy” is a reusable commerce-value section.
- Comparison appears after product understanding, not before it.

---

## 19.3 Product-detail page

```text
Global navigation
Local navigation
Promotional ribbon
Product hero
Key proposition
Feature storytelling
Scroll-linked or gallery media
Performance/specification modules
Comparison or lineup
Buying CTA
Accessories
Related ecosystem
Legal notes
Global footer
```

### Product-detail rules

- Local navigation remains available near the top during long storytelling.
- The hero establishes model, proposition, and purchase path.
- Feature modules use product-specific art direction.
- Technical information is translated into a human benefit before deep specifications.
- Long pages maintain orientation through headings and local navigation.
- Purchase actions repeat only when contextually justified.

---

## 19.4 Commerce index

Observed on Buy iPhone and related Apple Store pages.

```text
Global navigation
Commerce heading
Product-model card rail
Shopping-guide rail
Savings rail
Accessories rail
Setup and support rail
Ecosystem rail
Legal notes
Global footer
```

### Commerce-index rules

- Heading pairs often use a dark primary phrase and muted continuation.
- Cards are horizontally scrollable with generous space.
- Different card sizes indicate content importance.
- Commerce cards use soft shadow and rounded geometry.
- Model cards expose price and a clear purchase action.
- Service cards communicate one benefit each.

---

## 19.5 Compare page

```text
Global navigation
Local or family navigation
Comparison heading
Product selector
Comparison table
Feature categories
Purchase CTA
Footnotes
Global footer
```

### Compare-page rules

- Preserve row alignment.
- Provide sticky product names where appropriate.
- Avoid relying on empty cells or icons alone.
- Keep table semantics when content is truly tabular.
- Small-screen horizontal scrolling retains labels and context.

---

## 19.6 Editorial or values page

Observed on accessibility and values-oriented experiences.

```text
Global navigation
Large editorial statement
Feature introduction
Media-led feature modules
Long-form detail overlays or sections
Resource cards
Video or story gallery
Footnotes
Global footer
```

### Editorial-page rules

- Larger copy measure is still controlled.
- Media supports the narrative rather than acting as decoration.
- Accessibility information uses descriptive headings.
- Long feature detail can be progressively disclosed.
- Resource cards separate support, education, and developer destinations.

---

# 20. Content design

## 20.1 Voice characteristics

Apple.com copy commonly uses:

- short declarative headlines;
- direct second-person language;
- benefit-led statements;
- compact product naming;
- controlled wordplay;
- parallel structure;
- minimal jargon in primary messaging;
- deeper technical detail later in the page;
- explicit privacy, accessibility, environmental, and support context.

## 20.2 Heading pattern

```text
Eyebrow or category
Short benefit statement.
Optional second line for rhythm.
```

## 20.3 CTA patterns

```text
Learn more
Buy
Shop
Compare all models
Take a closer look
Get your estimate
Apply now
Explore
Watch now
```

## 20.4 Content rules

- Use sentence case.
- Prefer concise labels.
- Do not add punctuation to compact navigation labels.
- Avoid redundant link language.
- Keep model names and trademark formatting correct.
- Do not split meaningful product names awkwardly.
- Use nonbreaking spaces where a unit or product term must remain together.
- Translate marketing rhythm carefully instead of preserving English line breaks mechanically.

---

# 21. Accessibility specification

Apple’s public design guidance emphasizes inclusive colour, adaptable layouts, legible typography, text enlargement, accessibility settings, and non-colour alternatives.

## 21.1 Text and zoom

- Support browser zoom to at least 200%.
- Avoid fixed-height text containers.
- Let headings and CTAs wrap.
- Use scalable units in implementation.
- Preserve relative hierarchy when text grows.
- Do not use very light weights for small text.
- Maintain readable line lengths.

## 21.2 Colour

- Normal text targets at least `4.5:1`.
- Large text targets at least `3:1`.
- Meaningful interface boundaries and graphics target at least `3:1`.
- Do not use colour as the only state cue.
- Test light, dark, increased contrast, transparency reduction, and artwork overlays.
- Campaign colours receive the same contrast validation as global colours.

## 21.3 Keyboard

- Every interactive element is keyboard operable.
- Focus order follows the content narrative.
- Sticky navigation does not obscure focused elements.
- Menus, search, tabs, disclosures, galleries, and dialogs follow established ARIA patterns.
- Custom horizontal rails remain usable without a pointer.

## 21.4 Media

- Product images receive meaningful alternative text.
- Decorative images use empty alternative text.
- Video has captions.
- Audio-described alternatives are considered for important visual storytelling.
- Autoplay media is muted and controllable.
- Moving content can be paused when required.
- Reduced-motion mode remains complete.

## 21.5 Touch

- Interactive targets are at least `44 × 44px`.
- Visually small icons receive a larger hit area.
- Adjacent targets have sufficient spacing.
- Horizontal carousels do not interfere with vertical page scrolling.

## 21.6 Structure

- One logical page title.
- Headings form a coherent hierarchy.
- Landmarks identify navigation, main content, complementary content, and footer.
- Skip navigation is available.
- Product comparisons use appropriate table semantics.
- Footnote markers and notes are programmatically connected.

## 21.7 Modals and menus

- Focus moves into overlays.
- Background content becomes inert where appropriate.
- Escape closes dismissible overlays.
- Focus returns to the trigger.
- Expanded state is exposed through ARIA.
- Hover-only disclosure is prohibited.

---

# 22. Contrast reference

Calculated against the reconstructed core values:

| Pair | Contrast ratio | Normal text |
|---|---:|---|
| Primary text `#1D1D1F` on white | 16.83:1 | Pass AAA |
| Secondary text `#6E6E73` on white | 5.07:1 | Pass AA |
| Tertiary text `#86868B` on white | 3.62:1 | Fail AA for normal text |
| Link `#0066CC` on white | 5.57:1 | Pass AA |
| White on button blue `#0071E3` | 4.70:1 | Pass AA |
| White on hover blue `#0077ED` | 4.32:1 | Fail AA for normal text |
| Error `#E30000` on white | 4.92:1 | Pass AA |
| Success `#008009` on white | 5.13:1 | Pass AA |
| Near-black `#1D1D1F` on `#F5F5F7` | 15.46:1 | Pass AAA |
| `#F5F5F7` on black | 19.29:1 | Pass AAA |

### Contrast consequences

- `#86868B` is suitable for large text, nonessential metadata, or contexts with additional differentiation; it is not a default normal-text colour on white.
- The reconstructed hover blue `#0077ED` should not replace the accessible resting button blue for small normal text without contextual verification.
- White text on `#0071E3` passes the AA normal-text threshold.
- Product artwork and translucent materials require rendered-state testing.
- Contrast calculations do not replace visual testing across display profiles and accessibility modes.

---

# 23. CSS custom-property mapping

```css
:root {
  /* Neutral */
  --apple-color-white: #ffffff;
  --apple-color-near-white: #fbfbfd;
  --apple-color-gray-50: #f5f5f7;
  --apple-color-gray-100: #e8e8ed;
  --apple-color-gray-200: #d2d2d7;
  --apple-color-gray-300: #b6b6ba;
  --apple-color-gray-400: #a1a1a6;
  --apple-color-gray-500: #86868b;
  --apple-color-gray-600: #6e6e73;
  --apple-color-gray-700: #424245;
  --apple-color-gray-800: #2d2d2f;
  --apple-color-gray-900: #1d1d1f;
  --apple-color-gray-950: #161617;
  --apple-color-black: #000000;

  /* Interactive */
  --apple-color-link: #0066cc;
  --apple-color-action: #0071e3;
  --apple-color-action-hover: #0077ed;
  --apple-color-action-active: #005bb5;

  /* Functional */
  --apple-color-success: #008009;
  --apple-color-warning: #9a6700;
  --apple-color-error: #e30000;

  /* Semantic light */
  --apple-color-text-primary: var(--apple-color-gray-900);
  --apple-color-text-secondary: var(--apple-color-gray-600);
  --apple-color-text-tertiary: var(--apple-color-gray-500);
  --apple-color-canvas: var(--apple-color-white);
  --apple-color-surface-alternate: var(--apple-color-gray-50);
  --apple-color-border-subtle: var(--apple-color-gray-100);
  --apple-color-border-default: var(--apple-color-gray-200);

  /* Font families */
  --apple-font-display:
    "SF Pro Display",
    "SF Pro Icons",
    "Helvetica Neue",
    Helvetica,
    Arial,
    sans-serif;

  --apple-font-text:
    "SF Pro Text",
    "SF Pro Icons",
    "Helvetica Neue",
    Helvetica,
    Arial,
    sans-serif;

  --apple-font-system:
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    Helvetica,
    Arial,
    sans-serif;

  /* Font weights */
  --apple-font-weight-regular: 400;
  --apple-font-weight-medium: 500;
  --apple-font-weight-semibold: 600;
  --apple-font-weight-bold: 700;

  /* Font sizes */
  --apple-font-size-100: 0.6875rem;
  --apple-font-size-150: 0.75rem;
  --apple-font-size-200: 0.875rem;
  --apple-font-size-300: 1.0625rem;
  --apple-font-size-350: 1.1875rem;
  --apple-font-size-400: 1.3125rem;
  --apple-font-size-500: 1.5rem;
  --apple-font-size-600: 1.75rem;
  --apple-font-size-700: 2rem;
  --apple-font-size-800: 2.5rem;
  --apple-font-size-900: 3rem;
  --apple-font-size-1000: 3.5rem;
  --apple-font-size-1100: 4rem;
  --apple-font-size-1200: 4.5rem;
  --apple-font-size-1300: 5rem;
  --apple-font-size-1400: 6rem;

  /* Spacing */
  --apple-space-0: 0;
  --apple-space-1: 0.25rem;
  --apple-space-2: 0.5rem;
  --apple-space-3: 0.75rem;
  --apple-space-4: 1rem;
  --apple-space-5: 1.25rem;
  --apple-space-6: 1.5rem;
  --apple-space-7: 1.75rem;
  --apple-space-8: 2rem;
  --apple-space-10: 2.5rem;
  --apple-space-12: 3rem;
  --apple-space-14: 3.5rem;
  --apple-space-16: 4rem;
  --apple-space-20: 5rem;
  --apple-space-24: 6rem;
  --apple-space-30: 7.5rem;
  --apple-space-36: 9rem;

  /* Radius */
  --apple-radius-xs: 0.25rem;
  --apple-radius-sm: 0.5rem;
  --apple-radius-md: 0.75rem;
  --apple-radius-lg: 1.125rem;
  --apple-radius-xl: 1.5rem;
  --apple-radius-2xl: 1.75rem;
  --apple-radius-3xl: 2rem;
  --apple-radius-full: 9999px;

  /* Controls */
  --apple-control-xs: 1.75rem;
  --apple-control-sm: 2rem;
  --apple-control-md: 2.25rem;
  --apple-control-lg: 2.75rem;
  --apple-control-xl: 3.25rem;

  /* Layout */
  --apple-nav-max: 64rem;
  --apple-footer-max: 61.25rem;
  --apple-content-standard: 61.25rem;
  --apple-content-wide: 75rem;
  --apple-page-gutter-small: 1rem;
  --apple-page-gutter-medium: 1.5rem;
  --apple-page-gutter-large: 2rem;

  /* Motion */
  --apple-duration-fast: 120ms;
  --apple-duration-standard: 200ms;
  --apple-duration-moderate: 350ms;
  --apple-duration-slow: 600ms;
  --apple-easing-standard: cubic-bezier(0.25, 0.1, 0.25, 1);
  --apple-easing-enter: cubic-bezier(0.16, 1, 0.3, 1);

  /* Material */
  --apple-nav-light: rgb(250 250 252 / 80%);
  --apple-nav-dark: rgb(22 22 23 / 80%);
  --apple-material-blur: 20px;
}

@media (prefers-color-scheme: dark) {
  :root {
    --apple-color-text-primary: #f5f5f7;
    --apple-color-text-secondary: #a1a1a6;
    --apple-color-text-tertiary: #86868b;
    --apple-color-canvas: #000000;
    --apple-color-surface-alternate: #161617;
    --apple-color-border-subtle: #2d2d2f;
    --apple-color-border-default: #424245;
    --apple-color-link: #2997ff;
  }
}
```

---

# 24. Example component recipes

## 24.1 Primary button

```css
.apple-button-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: var(--apple-control-md);
  padding-inline: var(--apple-space-5);
  border: 1px solid var(--apple-color-action);
  border-radius: var(--apple-radius-full);
  background: var(--apple-color-action);
  color: #fff;
  font-family: var(--apple-font-text);
  font-size: var(--apple-font-size-300);
  font-weight: var(--apple-font-weight-regular);
  line-height: 1.2;
  text-decoration: none;
  transition:
    background-color var(--apple-duration-standard) var(--apple-easing-standard),
    border-color var(--apple-duration-standard) var(--apple-easing-standard);
}

.apple-button-primary:hover {
  border-color: var(--apple-color-action-hover);
  background: var(--apple-color-action-hover);
}

.apple-button-primary:active {
  border-color: var(--apple-color-action-active);
  background: var(--apple-color-action-active);
}

.apple-button-primary:focus-visible {
  outline: 3px solid var(--apple-color-action);
  outline-offset: 3px;
}
```

## 24.2 Text CTA

```css
.apple-cta-link {
  display: inline-flex;
  align-items: baseline;
  gap: var(--apple-space-1);
  color: var(--apple-color-link);
  font-family: var(--apple-font-text);
  font-size: var(--apple-font-size-300);
  line-height: 1.47;
  text-decoration: none;
}

.apple-cta-link:hover {
  text-decoration: underline;
  text-underline-offset: 0.18em;
}

.apple-cta-link::after {
  content: "›";
  font-size: 1.15em;
  line-height: 1;
}
```

## 24.3 Translucent navigation

```css
.apple-global-nav {
  position: sticky;
  inset-block-start: 0;
  z-index: 300;
  min-height: 44px;
  background: var(--apple-nav-light);
  backdrop-filter: saturate(180%) blur(var(--apple-material-blur));
  -webkit-backdrop-filter: saturate(180%) blur(var(--apple-material-blur));
}

@media (prefers-reduced-transparency: reduce) {
  .apple-global-nav {
    background: #fafafc;
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
  }
}
```

The `prefers-reduced-transparency` media feature does not have universal browser support; provide an application-level fallback where needed.

## 24.4 Editorial card

```css
.apple-editorial-card {
  overflow: hidden;
  border-radius: var(--apple-radius-2xl);
  background: var(--apple-color-canvas);
  color: var(--apple-color-text-primary);
}

.apple-editorial-card__copy {
  display: grid;
  gap: var(--apple-space-4);
  padding: clamp(2rem, 5vw, 4rem);
}

.apple-editorial-card__media {
  display: block;
  width: 100%;
  height: auto;
  object-fit: cover;
}
```

## 24.5 Horizontal store rail

```css
.apple-store-rail {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: minmax(17.5rem, 25rem);
  gap: var(--apple-space-5);
  overflow-x: auto;
  padding-inline: max(
    var(--apple-page-gutter-small),
    calc((100vw - var(--apple-content-wide)) / 2)
  );
  padding-block: var(--apple-space-5);
  scroll-padding-inline: var(--apple-page-gutter-small);
  scroll-snap-type: inline mandatory;
}

.apple-store-rail > * {
  scroll-snap-align: start;
}
```

---

# 25. Naming convention

Use lowercase kebab-case paths.

```text
foundation.color.neutral.gray-900
semantic.color.light.text.primary
component.button.primary.background
template.product-family.section-gap
```

## Naming rules

1. Foundation tokens describe a measurable value or scale.
2. Semantic tokens describe a role.
3. Component tokens describe component, variant, state, and property.
4. Campaign tokens remain under a campaign namespace.
5. Avoid appearance-only semantic names such as `dark-gray-text`.
6. Use state suffixes consistently:
   - `rest`
   - `hover`
   - `focus`
   - `active`
   - `selected`
   - `disabled`
   - `loading`
   - `expanded`
   - `error`
7. Do not include a specific product name in a global foundation token.
8. Deprecations include a reason and replacement.

```json
{
  "semantic": {
    "color": {
      "link-old": {
        "$value": "{foundation.color.blue.500}",
        "$deprecated": "Use {semantic.color.light.text.link}."
      }
    }
  }
}
```

---

# 26. Governance

## 26.1 Token lifecycle

```text
proposed
→ experimental
→ stable
→ deprecated
→ removed
```

## 26.2 Change classification

| Change | Version impact |
|---|---|
| Documentation correction | Patch |
| New nonbreaking semantic token | Minor |
| New component variant | Minor |
| Material visual-value change | Minor after visual review |
| Accessibility correction | Patch or minor depending on impact |
| Rename or removal | Major |
| Alias target change that alters meaning | Major |
| Campaign-only update | Campaign version, not global-system version |

## 26.3 Required review

Every global token change must be reviewed for:

- semantic correctness;
- visual hierarchy;
- light and dark contexts;
- accessibility;
- reduced motion;
- reduced transparency;
- responsive behaviour;
- localization;
- right-to-left behaviour;
- component coverage;
- alias integrity;
- backward compatibility;
- campaign isolation.

## 26.4 Validation gates

- Valid JSON for JSON token files.
- Every alias resolves.
- No circular references.
- Every token has a determinable type.
- Components reference semantic roles where available.
- Critical contrast pairs pass.
- Focus is visible in light and dark modes.
- Text survives 200% zoom.
- Touch targets meet the intended minimum.
- Motion has a reduced alternative.
- Translucency has an opaque fallback.
- Campaign values do not leak into global semantics.
- Font files are not bundled without a valid licence.

---

# 27. Known gaps

The following cannot be verified from the public materials used in this reconstruction:

- Apple’s internal web token names;
- exact current CSS custom-property names;
- complete private component APIs;
- every current page-specific breakpoint;
- exact current spacing values on every template;
- all A/B-tested navigation or commerce variants;
- authenticated account patterns;
- checkout-completion patterns;
- personalization logic;
- analytics rules;
- proprietary motion curves;
- internal artwork-placement tools;
- private campaign tokens;
- the precise relationship between Apple.com web tokens and Apple platform design-system infrastructure.

The values most likely to require page-level measurement are:

- hero heights;
- exact display sizes;
- card widths;
- card radii;
- carousel gaps;
- navigation opacity;
- blur intensity;
- local-navigation height;
- hover colours;
- transition duration;
- ultra-wide art direction.

This is a **high-coverage reconstruction**, not a claim of access to Apple’s internal design-system repository.

---

# 28. Public references

## Apple.com pages

- Apple homepage: `https://www.apple.com/`
- iPhone family: `https://www.apple.com/iphone/`
- Mac family: `https://www.apple.com/mac/`
- Buy iPhone: `https://www.apple.com/shop/buy-iphone`
- Accessibility: `https://www.apple.com/accessibility/`

## Apple design documentation

- Human Interface Guidelines:  
  `https://developer.apple.com/design/human-interface-guidelines/`
- Design principles:  
  `https://developer.apple.com/design/human-interface-guidelines/design-principles`
- Colour:  
  `https://developer.apple.com/design/human-interface-guidelines/color`
- Typography:  
  `https://developer.apple.com/design/human-interface-guidelines/typography`
- Layout:  
  `https://developer.apple.com/design/human-interface-guidelines/layout`
- Materials:  
  `https://developer.apple.com/design/human-interface-guidelines/materials`
- Accessibility:  
  `https://developer.apple.com/design/human-interface-guidelines/accessibility`
- Apple Design Resources:  
  `https://developer.apple.com/design/resources/`
- Apple fonts:  
  `https://developer.apple.com/fonts/`

## Standards

- Design Tokens Community Group Format Module 2025.10:  
  `https://www.designtokens.org/tr/2025.10/format/`
- WCAG 2.2:  
  `https://www.w3.org/TR/WCAG22/`
- WAI-ARIA Authoring Practices:  
  `https://www.w3.org/WAI/ARIA/apg/`

---

# 29. Final implementation guidance

Use the reconstructed system in four layers:

```text
1. Preserve the neutral global shell.
2. Resolve interface components through semantic aliases.
3. Scope product colours and gradients to campaigns.
4. Validate every responsive composition against actual content and artwork.
```

## Highest-priority foundation tokens

```text
foundation.color.neutral.gray-900
foundation.color.neutral.gray-600
foundation.color.neutral.gray-50
foundation.color.blue.500
foundation.color.blue.600
foundation.font-family.system-web
foundation.space
foundation.radius
foundation.duration
foundation.breakpoint
```

## Highest-priority semantic tokens

```text
semantic.color.light.text.primary
semantic.color.light.text.secondary
semantic.color.light.background.canvas
semantic.color.dark.text.primary
semantic.color.dark.background.canvas
semantic.color.action.primary
semantic.typography.hero-display
semantic.typography.body
semantic.radius.card
semantic.material.navigation-light
semantic.material.navigation-dark
```

## Implementation warning

An Apple-like result does not come from copying black, white, blue, and SF-style typography alone.

The system depends on the relationship between:

- product-first art direction;
- precise copy hierarchy;
- negative space;
- responsive media composition;
- restrained interaction;
- concentric geometry;
- accessible states;
- campaign-scoped colour;
- controlled motion;
- consistent navigation and footer infrastructure.

Before declaring visual parity, verify the target Apple.com page at small, medium, large, and ultra-wide viewports and measure its current computed styles directly.
