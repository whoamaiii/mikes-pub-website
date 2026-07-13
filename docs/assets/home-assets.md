# WHO-18 Home asset provenance

The Home hero uses two art-directed web derivatives of one Q-owned exterior photograph. The TIFF
master remains outside Git and must not be committed, overwritten or substituted.

## Authoritative source

| Field           | Verified value                                                                |
| --------------- | ----------------------------------------------------------------------------- |
| Source filename | `a342be10-b517-4bea-b08f-ef1257ddea70.tiff`                                   |
| SHA-256         | `4ce32467e449def948337339cf0eea83efff4154b5edcf86b7feac4d02800b26`            |
| Format          | TIFF, big-endian, uncompressed                                                |
| Dimensions      | 1402 × 1122 pixels                                                            |
| Colour          | 8-bit RGB with embedded `sRGB IEC61966-2.1` profile                           |
| Orientation     | TopLeft                                                                       |
| Copyright       | Q-created and Q-owned; declaration and exact local mapping recorded in WHO-18 |
| People          | No identifiable people visible                                                |

Q confirms that the source depicts the real exterior intended for the Home hero and has not been
generatively altered. The full source also includes unrelated vehicles and neighboring bank
branding. The approved crops exclude those elements while retaining the building, entrance and
Mike’s Pub sign.

The source contains Mike’s Pub signage. Its inclusion is approved for this clearly labeled private
concept implementation; client authorization is still required before presenting the website or
branding as official.

## Reproducible derivatives

Generated with ImageMagick `7.1.2-12 Q16-HDRI`. No generative editing, fill, removal, invented
extension, replacement, retouching or upscaling is used.

```sh
SOURCE=/absolute/path/to/a342be10-b517-4bea-b08f-ef1257ddea70.tiff

magick "$SOURCE" -crop 960x640+180+180 +repage -colorspace sRGB -strip \
  -define webp:method=6 -quality 82 \
  src/assets/images/mikes-pub-exterior-desktop.webp

magick "$SOURCE" -crop 880x660+220+180 +repage -colorspace sRGB -strip \
  -define webp:method=6 -quality 82 \
  src/assets/images/mikes-pub-exterior-mobile.webp
```

| Repository derivative                               | Crop and use                                                | Dimensions | SHA-256                                                            |
| --------------------------------------------------- | ----------------------------------------------------------- | ---------- | ------------------------------------------------------------------ |
| `src/assets/images/mikes-pub-exterior-desktop.webp` | `960x640+180+180`, desktop 3:2, focal point `50% 55%`       | 960 × 640  | `cb218b6a662d9ba67ac912b2c24792684b8734d9e3560d403f046ab2f733ea16` |
| `src/assets/images/mikes-pub-exterior-mobile.webp`  | `880x660+220+180`, mobile/tablet 4:3, focal point `50% 55%` | 880 × 660  | `58456c4566d911822c43de4478c0383a822a9e4011c7284ca514c4c791c9eedc` |

Alternative text: “Fasaden til Mike’s Pub i Sætre.”

These derivatives remain Q’s copyrighted work. Their inclusion in this public source repository is
approved for this project and does not place them under the application’s `UNLICENSED` terms or
grant a separate reuse licence.
