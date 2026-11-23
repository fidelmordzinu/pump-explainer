from __future__ import annotations

import math
import random
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter


WIDTH, HEIGHT = 1440, 1000
ASSETS = Path(__file__).resolve().parents[1] / "public" / "assets"


def background(seed: int) -> Image.Image:
    random.seed(seed)
    pixels = []
    for y in range(HEIGHT):
        for x in range(WIDTH):
            distance = math.sqrt(((x - 700) / 1000) ** 2 + ((y - 450) / 820) ** 2)
            light = max(0, 1 - distance) * 17
            noise = random.randint(-3, 3)
            pixels.append(
                (
                    max(0, min(255, 13 + int(light * 0.72) + noise)),
                    max(0, min(255, 21 + int(light * 0.92) + noise)),
                    max(0, min(255, 34 + int(light * 1.18) + noise)),
                )
            )
    image = Image.new("RGB", (WIDTH, HEIGHT))
    image.putdata(pixels)
    draw = ImageDraw.Draw(image, "RGBA")
    draw.rectangle((0, 760, WIDTH, HEIGHT), fill=(7, 13, 23, 100))
    draw.line((0, 760, WIDTH, 760), fill=(137, 158, 177, 42), width=3)
    for x in range(70, WIDTH, 90):
        draw.line((x, 0, x, HEIGHT), fill=(160, 180, 200, 7), width=1)
    return image


def gradient_panel(
    image: Image.Image,
    box: tuple[int, int, int, int],
    colors: tuple[tuple[int, int, int], ...],
    radius: int = 20,
    vertical: bool = False,
    outline: tuple[int, int, int] = (120, 139, 158),
    outline_width: int = 3,
) -> None:
    x0, y0, x1, y1 = box
    width, height = x1 - x0, y1 - y0
    steps = height if vertical else width
    ramp = Image.new("RGB", (width, height))
    ramp_draw = ImageDraw.Draw(ramp)
    for i in range(steps):
        segment = min(len(colors) - 2, int(i / max(1, steps - 1) * (len(colors) - 1)))
        start, end = colors[segment], colors[segment + 1]
        fraction = i / max(1, steps - 1) * (len(colors) - 1) - segment
        shade = tuple(round(a + (b - a) * fraction) for a, b in zip(start, end))
        if vertical:
            ramp_draw.line((0, i, width, i), fill=shade)
        else:
            ramp_draw.line((i, 0, i, height), fill=shade)
    mask = Image.new("L", (width, height))
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, width - 1, height - 1), radius, fill=255)
    image.paste(ramp, (x0, y0), mask)
    ImageDraw.Draw(image).rounded_rectangle(box, radius, outline=outline, width=outline_width)


def pipe(draw: ImageDraw.ImageDraw, points: list[tuple[int, int]], width: int = 46) -> None:
    draw.line(points, fill=(20, 29, 38), width=width + 13, joint="curve")
    draw.line(points, fill=(130, 147, 158), width=width, joint="curve")
    draw.line(
        [(x - 3, y - width // 4) for x, y in points],
        fill=(211, 221, 225),
        width=max(4, width // 7),
        joint="curve",
    )
    for x, y in points[1:-1]:
        draw.ellipse(
            (x - width // 2, y - width // 2, x + width // 2, y + width // 2),
            fill=(162, 176, 183),
            outline=(55, 69, 80),
            width=5,
        )


def draw_gauge(
    draw: ImageDraw.ImageDraw,
    center: tuple[int, int],
    radius: int,
    needle_degrees: float = -42,
    face: tuple[int, int, int] = (226, 232, 232),
) -> None:
    x, y = center
    draw.ellipse((x - radius + 10, y - radius + 14, x + radius + 12, y + radius + 16), fill=(2, 7, 13))
    draw.ellipse(
        (x - radius, y - radius, x + radius, y + radius),
        fill=(44, 56, 67),
        outline=(174, 190, 197),
        width=9,
    )
    draw.ellipse(
        (x - radius + 15, y - radius + 15, x + radius - 15, y + radius - 15),
        fill=face,
        outline=(28, 38, 48),
        width=5,
    )
    inner = radius - 34
    for i in range(31):
        angle = math.radians(135 + i * 270 / 30)
        outer_r = inner - (15 if i % 5 == 0 else 6)
        x1, y1 = x + math.cos(angle) * outer_r, y + math.sin(angle) * outer_r
        x2, y2 = x + math.cos(angle) * inner, y + math.sin(angle) * inner
        draw.line((x1, y1, x2, y2), fill=(20, 31, 40), width=5 if i % 5 == 0 else 2)
    for i, label in enumerate(("0", "20", "40", "60", "80", "100")):
        angle = math.radians(135 + i * 54)
        tx, ty = x + math.cos(angle) * (inner - 32), y + math.sin(angle) * (inner - 32)
        draw.text((tx - 10, ty - 12), label, fill=(30, 43, 52))
    angle = math.radians(needle_degrees)
    draw.line(
        (x, y, x + math.cos(angle) * (inner - 10), y + math.sin(angle) * (inner - 10)),
        fill=(190, 45, 42),
        width=8,
    )
    draw.ellipse((x - 12, y - 12, x + 12, y + 12), fill=(31, 42, 52), outline=(222, 230, 230), width=4)
    draw.arc((x - radius + 24, y - radius + 24, x + radius - 24, y + radius - 24), 205, 325, fill=(255, 255, 255), width=7)


def render_pressure_switch() -> Image.Image:
    image = background(2)
    shadow = Image.new("RGBA", (WIDTH, HEIGHT))
    ImageDraw.Draw(shadow).ellipse((180, 690, 1240, 825), fill=(0, 0, 0, 185))
    image = Image.alpha_composite(image.convert("RGBA"), shadow.filter(ImageFilter.GaussianBlur(38))).convert("RGB")
    draw = ImageDraw.Draw(image)
    pipe(draw, [(120, 650), (1320, 650)], 46)
    pipe(draw, [(710, 650), (710, 470), (525, 470), (525, 380)], 34)
    pipe(draw, [(710, 470), (900, 470), (900, 405)], 34)
    draw_gauge(draw, (520, 285), 148, -48)
    gradient_panel(image, (780, 295, 1015, 430), ((61, 76, 86), (25, 38, 51), (13, 23, 35)), 25, outline=(176, 190, 194), outline_width=5)
    draw = ImageDraw.Draw(image)
    draw.rounded_rectangle((818, 322, 977, 394), 14, fill=(18, 29, 40), outline=(77, 95, 107), width=4)
    for x, y in ((808, 320), (987, 320), (808, 406), (987, 406)):
        draw.ellipse((x - 7, y - 7, x + 7, y + 7), fill=(202, 209, 207), outline=(43, 53, 61), width=2)
    draw.polygon(((890, 430), (928, 430), (955, 470), (864, 470)), fill=(80, 93, 99), outline=(190, 199, 197))
    draw.rounded_rectangle((855, 468, 965, 520), 14, fill=(155, 112, 63), outline=(218, 180, 119), width=5)
    draw.line((875, 476, 875, 512), fill=(235, 206, 154), width=4)
    draw.line((945, 476, 945, 512), fill=(64, 48, 34), width=4)
    draw.arc((776, 330, 1015, 600), 0, 80, fill=(188, 198, 197), width=7)
    draw.rounded_rectangle((675, 420, 745, 460), 8, fill=(185, 140, 78), outline=(225, 193, 137), width=4)
    draw.rounded_rectangle((660, 439, 760, 477), 10, fill=(91, 103, 105), outline=(210, 217, 211), width=4)
    for x in range(665, 759, 13):
        draw.line((x, 444, x, 472), fill=(213, 219, 211), width=2)
    return image


def render_motor() -> Image.Image:
    image = background(3)
    shadow = Image.new("RGBA", (WIDTH, HEIGHT))
    ImageDraw.Draw(shadow).ellipse((190, 660, 1250, 830), fill=(0, 0, 0, 185))
    image = Image.alpha_composite(image.convert("RGBA"), shadow.filter(ImageFilter.GaussianBlur(36))).convert("RGB")
    draw = ImageDraw.Draw(image)
    draw.polygon(((265, 620), (1080, 620), (1170, 690), (235, 690)), fill=(48, 58, 66), outline=(149, 160, 164))
    draw.polygon(((345, 598), (420, 598), (400, 645), (320, 645)), fill=(73, 86, 93), outline=(172, 182, 183))
    draw.polygon(((920, 598), (995, 598), (1030, 645), (945, 645)), fill=(65, 78, 86), outline=(175, 185, 185))
    gradient_panel(image, (300, 350, 1000, 610), ((91, 108, 121), (36, 50, 64), (17, 29, 42)), 112, outline=(158, 176, 183), outline_width=6)
    draw = ImageDraw.Draw(image)
    draw.ellipse((270, 370, 405, 590), fill=(37, 51, 65), outline=(178, 191, 193), width=8)
    draw.ellipse((289, 392, 390, 569), fill=(18, 29, 42), outline=(97, 113, 123), width=5)
    for x in range(420, 932, 26):
        draw.line((x, 366, x, 587), fill=(163, 178, 183), width=5)
        draw.line((x + 7, 372, x + 7, 580), fill=(37, 51, 64), width=5)
    draw.ellipse((925, 376, 1045, 585), fill=(54, 70, 82), outline=(195, 205, 205), width=7)
    draw.ellipse((952, 409, 1024, 551), fill=(22, 33, 44), outline=(116, 130, 138), width=4)
    draw.rounded_rectangle((475, 377, 855, 576), 76, fill=(9, 17, 27), outline=(176, 186, 188), width=7)
    draw.rounded_rectangle((497, 395, 833, 559), 59, fill=(24, 31, 38), outline=(72, 86, 94), width=4)
    for i in range(9):
        x = 520 + i * 34
        draw.arc((x - 27, 398, x + 28, 552), 65, 295, fill=(190, 89, 39), width=15)
        draw.arc((x - 18, 405, x + 19, 546), 70, 290, fill=(255, 180, 93), width=5)
        draw.arc((x - 27, 398, x + 28, 552), 245, 65, fill=(166, 69, 33), width=15)
    draw.rounded_rectangle((480, 466, 854, 486), 10, fill=(145, 157, 162), outline=(229, 232, 227), width=4)
    draw.ellipse((630, 443, 705, 516), fill=(67, 82, 91), outline=(225, 230, 224), width=6)
    draw.line((670, 479, 1090, 479), fill=(183, 194, 194), width=15)
    draw.ellipse((1070, 450, 1127, 508), fill=(144, 158, 164), outline=(230, 233, 228), width=6)
    for x in (350, 970):
        draw.ellipse((x, 621, x + 17, 638), fill=(211, 216, 212), outline=(34, 45, 53), width=3)
    draw.arc((470, 370, 865, 585), 188, 352, fill=(236, 166, 105), width=6)
    return image


def save(name: str, image: Image.Image) -> None:
    ASSETS.mkdir(parents=True, exist_ok=True)
    image.save(ASSETS / name, format="JPEG", quality=94, optimize=True, progressive=True)
    print(f"Wrote {ASSETS / name}")


if __name__ == "__main__":
    save("pressure-switch-gauge.jpg", render_pressure_switch())
    save("electric-motor.jpg", render_motor())
