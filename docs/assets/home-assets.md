# Home hero asset provenance

The Home hero uses two art-directed WebP derivatives of `MIKESUTE.png`, the image Q supplied and
explicitly directed Codex to use for this private design proposal on 2026-07-15. On 2026-07-19, Q
reported that the Mike's Pub owner approved this exact image and its derivatives for production use
on the Mike's Pub website. The full-resolution PNG is a local source master: it is ignored by Git
and must not be committed.

## Supplied source

| Field           | Recorded value                                                     |
| --------------- | ------------------------------------------------------------------ |
| Source filename | `MIKESUTE.png`                                                     |
| SHA-256         | `0df92268d913da3a165ff26d943133c5d213dc126d670101bae5124df05c95e3` |
| Format          | PNG, non-interlaced, 8-bit RGB                                     |
| Dimensions      | 3840 × 2160 pixels                                                 |
| People          | No identifiable people visible                                     |
| Current use     | Owner-approved Mike’s Pub website and private design proposal      |

The image depicts a black pub exterior with a lit `Mike’s Pub` sign and green entrance. Q’s active
instruction and reported owner approval are the authority for production use in this project. Its
authorship, generation history and third-party ownership chain have not been independently audited;
the production clearance records the client's authorization rather than a separate copyright audit.

## Reproducible derivatives

Generated with `cwebp 1.6.0`. Both outputs are compressed and resized; the mobile derivative also
uses a portrait crop to keep the venue sign and entrance legible on narrow screens. No content-aware
fill or object removal was performed.

```sh
cwebp -quiet -mt -q 88 -resize 1920 1080 MIKESUTE.png \
  -o src/assets/images/mikes-pub-exterior-desktop.webp

cwebp -quiet -mt -q 88 -crop 1120 0 1728 2160 -resize 1080 1350 MIKESUTE.png \
  -o src/assets/images/mikes-pub-exterior-mobile.webp
```

| Repository derivative                               | Crop and use                                 | Dimensions  | SHA-256                                                            |
| --------------------------------------------------- | -------------------------------------------- | ----------- | ------------------------------------------------------------------ |
| `src/assets/images/mikes-pub-exterior-desktop.webp` | Full 16:9 frame for desktop, focal point 50% | 1920 × 1080 | `1aceb4537abd7b75e6ae8581c7b05518fb4d7490593f818fe10133c9cc5a72d2` |
| `src/assets/images/mikes-pub-exterior-mobile.webp`  | `1728x2160+1120+0` portrait crop, focal 50%  | 1080 × 1350 | `4ecbb2654825a592ea25fe27b6bc277648a89e79d08b0233286b7bd66ddd96de` |

Alternative text: “Den svarte fasaden til Mike’s Pub med belyst skilt og grønn inngang i Sætre.”

The repository derivatives remain rights-controlled project assets. Their presence does not place
them under the application’s `UNLICENSED` terms or grant a separate reuse licence.
