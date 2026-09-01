#!/usr/bin/env python3
"""Froni front ornament, structure pass.
Constructs the centerline drawing as SVG: one half drawn, mirrored about the axis.
Three layers: armature (cross, shaft, terminals), foliage (palmettes, lower chains),
incised (spiral eyes, lobe veins). Panel space 1951x2835 px (rectified photo frame),
uniform stroke. Border absent. Foot curls back per the 31 Jul ruling.
"""
import numpy as np

AX = 965.0            # symmetry axis x in panel space
W, H = 1951, 2835
STROKE = 5.0

def P(pts):
    return " ".join(f"{x:.1f},{y:.1f}" for x, y in pts)

def spiral(cx, cy, r0, r1, a0, a1, turns_pts=140, ccw=False):
    """Archimedean spiral polyline from angle a0 to a1 (radians), radius r0->r1."""
    a1e = a1 if not ccw else a1
    ts = np.linspace(0, 1, turns_pts)
    ang = a0 + (a1 - a0) * ts
    rad = r0 + (r1 - r0) * ts
    return [(cx + rad[i] * np.cos(ang[i]), cy + rad[i] * np.sin(ang[i])) for i in range(len(ts))]

def bez(p0, p1, p2, p3, n=90):
    ts = np.linspace(0, 1, n)
    out = []
    for t in ts:
        mt = 1 - t
        x = mt**3*p0[0] + 3*mt*mt*t*p1[0] + 3*mt*t*t*p2[0] + t**3*p3[0]
        y = mt**3*p0[1] + 3*mt*mt*t*p1[1] + 3*mt*t*t*p2[1] + t**3*p3[1]
        out.append((x, y))
    return out

def mirror(pts):
    return [(2*AX - x, y) for x, y in pts]

polylines = {"armature": [], "foliage": [], "incised": []}

def add(layer, pts):
    polylines[layer].append(pts)

def add_m(layer, pts):
    add(layer, pts)
    add(layer, mirror(pts))

# ---------------- ARMATURE ----------------
APEX = (AX, 1200.0)

# Upper sheaf: lens outline, tip to apex. Left side drawn, mirrored.
tip = (AX, 178.0)
lens_left = bez(tip, (AX-262, 340), (AX-322, 700), (AX-52, 1178))
add_m("armature", lens_left)
# Sheaf flutes: 2 internal lines on the half (plus the axis line itself)
for k, (dx1, dx2) in enumerate([(-205, -34), (-108, -17)]):
    fl = bez((AX+dx1*0.06, 255+k*12), (AX+dx1, 400), (AX+dx1*1.1, 680), (AX+dx2, 1150))
    add_m("armature", fl)
add("armature", [(AX, 205.0), (AX, 1130.0)])  # central flute on axis

# Top terminal volutes: doubled spiral, opening down-inward; left one at (805,215)
for rr, gap in [(112.0, 0.0), (88.0, 0.0)]:
    s = spiral(805, 218, rr, 14.0, np.pi*0.62, np.pi*0.62 + np.pi*1.9)
    add_m("armature", s)
# connecting cusp between the two volutes over the sheaf tip
cusp = bez((805+112*np.cos(np.pi*0.62), 218+112*np.sin(np.pi*0.62)), (AX-60, 60), (AX-18, 78), (AX, 96))
add_m("armature", cusp)

# Arms: four groove lines converging to the apex; terminal at x=210
term_x = 212.0
ys_term = [1081.0, 1151.0, 1235.0, 1301.0]
fan_x = 822.0
for i, yt in enumerate(ys_term):
    end = (APEX[0] - 4 + 2.5*i, APEX[1] - 7 + 5*i)
    add_m("armature", [(term_x, yt), (fan_x, yt)] + bez((fan_x, yt), (fan_x+55, yt), (end[0]-38, end[1]), end, n=40))
# Terminal volutes of the arm: upper curls up-in, lower curls down-in, doubled
for cy, sgn in [(1042.0, -1.0), (1352.0, +1.0)]:
    for rr in (86.0, 62.0):
        a0 = (np.pi/2)*sgn
        s = spiral(205, cy, rr, 12.0, a0, a0 + sgn*np.pi*1.75)
        add_m("armature", s)
# cap: outer ends of top and bottom groove lines wrap into the volutes
add_m("armature", bez((term_x, 1081), (170, 1081), (150, 1093), (146, 1111)))
add_m("armature", bez((term_x, 1301), (170, 1301), (150, 1289), (146, 1271)))

# Lower shaft: four flute lines fanning from apex to the foot flare
foot_y = 2300.0
for i, dx in enumerate([-108.0, -36.0, 36.0, 108.0]):
    start = (APEX[0] - 6 + 4*i, APEX[1] + 8)
    add("armature", bez(start, (AX+dx*0.55, 1500), (AX+dx*0.9, 1950), (AX+dx, foot_y)))

# Foot lyre: inner volutes + center arch; doubled spirals at (±200, 2540)
for rr in (150.0, 118.0):
    s = spiral(AX-200, 2540, rr, 20.0, -np.pi*0.845, -np.pi*0.845 - np.pi*1.70, ccw=True)
    add_m("armature", s)
# sweep from shaft outer line into the foot volute
add_m("armature", bez((AX-95, foot_y), (AX-150, 2400), (AX-260, 2420), (AX-330, 2470)))
# center arch: axis low point up into the inner volute
add_m("armature", bez((AX, 2702), (AX-70, 2694), (AX-130, 2662), (AX-165, 2618)))
# shaft inner flutes close onto the arch shoulders
add_m("armature", bez((AX-32, foot_y), (AX-40, 2450), (AX-30, 2560), (AX-8, 2700)))

# Foot curl-back (31 Jul ruling), calibrated 28 Aug 2026 against the accepted
# Banana Pro render. Render reading: the outer runs do not form separate
# outboard spirals; the outermost run wraps around the lyre volute as its
# outer lamina (outer band ~1.28x volute radius, counterclockwise like the
# volute itself, tucking over the eye), and lesser runs close into small
# CCW curls (~0.3x volute radius). The 2 Aug outboard spirals at +-455 are
# removed; carving and render agree the volute winds CCW.
LAM_A0 = -np.pi*1.15
lam_entry = (AX-200 + 192.0*np.cos(LAM_A0), 2540 + 192.0*np.sin(LAM_A0))
# outer edge stalk's lower end sweeps down-inboard and enters the wrap low
add_m("armature", bez((160, 2430), (250, 2520), (420, 2575), lam_entry))
# outer lamina: bottom -> inboard -> over the eye, CCW, taper 192 -> 56
add_m("armature", spiral(AX-200, 2540, 192.0, 56.0, LAM_A0, LAM_A0 - np.pi*1.35))

# ---------------- FOLIAGE ----------------
# Rebuilt 31 Aug 2026 from the rectified carving (ORNAMENT_NOTES items 1 and 2),
# measured on labeled grids. Palmette: rib bows low toward the corner; five
# outboard lobes with terminal CCW eyes, two upper inboard lobes with eyes and
# a lanceolate pair below them. Chains: three clusters per side (eye plus four
# cupped blades), a large chain-top curl, calyx pairs under the arm, an outer
# stalk, sheath runs flanking the shaft, the lowest stem joining the foot wrap.

def blade(spring, eye, r_eye, sag=0.30, entry=np.pi*0.35, sweep=1.35):
    sx, sy = spring; ex, ey = eye
    dx, dy = ex - sx, ey - sy
    L = (dx*dx + dy*dy) ** 0.5
    px, py = -dy / L, dx / L
    if py < 0: px, py = -px, -py
    if sag < 0: px, py = -px, -py
    a = abs(sag)
    c1 = (sx + dx*0.35 + px*L*a, sy + dy*0.35 + py*L*a)
    c2 = (sx + dx*0.8 + px*L*a*0.6, sy + dy*0.8 + py*L*a*0.6)
    a0 = entry
    start_eye = (ex + r_eye*np.cos(a0), ey + r_eye*np.sin(a0))
    return bez((sx, sy), c1, c2, start_eye) + spiral(ex, ey, r_eye, max(6.0, r_eye*0.14), a0, a0 - np.pi*sweep)

# Palmette main rib, bowed to the carved spine, tip at the corner
main_rib = bez((705, 955), (470, 760), (225, 415), (88, 88))
add_m("foliage", main_rib + spiral(112, 112, 26.0, 6.0, -np.pi*0.25, -np.pi*0.25 - np.pi*1.3))

palm_out = [
    ((240, 375), (105, 295), 52.0),
    ((305, 528), (140, 480), 45.0),
    ((362, 655), (172, 618), 40.0),
    ((428, 782), (208, 748), 35.0),
    ((560, 920), (128, 930), 55.0),
]
for spring, eye, r in palm_out:
    add_m("foliage", blade(spring, eye, r, sag=0.34))

palm_in = [
    ((168, 196), (250, 148), 48.0, 1.3),
    ((238, 372), (415, 298), 44.0, 1.3),
]
for spring, eye, r, sw in palm_in:
    add_m("foliage", blade(spring, eye, r, sag=-0.26, entry=-np.pi*0.6, sweep=sw))
# Lanceolate pair, the two long inboard blades flanking the sheaf
lance = [
    ((330, 530), (610, 700), 26.0),
    ((400, 660), (680, 855), 22.0),
]
for spring, eye, r in lance:
    add_m("foliage", blade(spring, eye, r, sag=-0.30, entry=-np.pi*0.55, sweep=1.2))

# Calyx pairs under the arm, pointed
for tx, ty, w, h in [(452, 1348, 55, 115), (688, 1352, 55, 110)]:
    add_m("foliage", bez((tx-w, ty+h), (tx-w*0.45, ty+h*0.4), (tx-w*0.14, ty+h*0.12), (tx, ty)))
    add_m("foliage", bez((tx+w, ty+h), (tx+w*0.45, ty+h*0.4), (tx+w*0.14, ty+h*0.12), (tx, ty)))

# Chain-top curl and the outer edge stalk
add_m("foliage", spiral(170, 1400, 90.0, 13.0, np.pi*0.5, np.pi*0.5 - np.pi*1.7))
add_m("foliage", bez((160, 2430), (100, 2150), (105, 1790), (162, 1488)))

# Chain clusters: four cupped blades each; eyes live in the incised layer
chain_clusters = [
    ((505, 1600), [(360, 1478), (348, 1640), (445, 1735), (620, 1500)]),
    ((195, 1885), [(95, 1745), (88, 1930), (245, 2010), (320, 1795)]),
    ((350, 2120), [(248, 2015), (252, 2215), (430, 2265), (475, 2020)]),
]
for (ex, ey), tips in chain_clusters:
    for tx, ty in tips:
        dx, dy = tx - ex, ty - ey
        add_m("foliage", bez((ex + dx*0.3, ey + dy*0.3), (ex + dx*0.62 - dy*0.2, ey + dy*0.62 + dx*0.2), (ex + dx*0.9 - dy*0.08, ey + dy*0.9 + dx*0.08), (tx, ty)))

# Stems linking the clusters, the last one joining the foot wrap entry
add_m("foliage", bez((438, 1688), (350, 1730), (285, 1760), (255, 1788)))
add_m("foliage", bez((268, 1988), (292, 2012), (315, 2028), (332, 2042)))
add_m("foliage", bez((432, 2252), (500, 2320), (570, 2370), (642, 2392)))

# Sheath runs flanking the shaft
add_m("foliage", bez((720, 1380), (768, 1750), (775, 2100), (722, 2370)))
add_m("foliage", bez((792, 1442), (830, 1800), (822, 2150), (772, 2380)))

# ---------------- INCISED ----------------
# Nine spiral eyes per side: one primary and two minors per cluster
for (ex, ey, r0), minors in [
    ((505, 1600, 95.0), [(612, 1688), (422, 1502)]),
    ((195, 1885, 90.0), [(100, 1802), (298, 1988)]),
    ((350, 2120, 85.0), [(468, 2228), (258, 2052)]),
]:
    add_m("incised", spiral(ex, ey, r0, 12.0, 0.4, 0.4 - np.pi*1.9))
    for mx, my in minors:
        add_m("incised", spiral(mx, my, 26.0, 5.0, 0.1, 0.1 - np.pi*1.5))
# Palmette lobe veins: one per curled lobe
for spring, eye, r in palm_out + [(s, e, r) for s, e, r, _ in palm_in]:
    sx, sy = spring; ex, ey = eye
    add_m("incised", [(sx + (ex-sx)*0.2, sy + (ey-sy)*0.28), (sx + (ex-sx)*0.68, sy + (ey-sy)*0.74)])
# Lanceolate pair: twin parallel veins each
for spring, eye, r in lance:
    sx, sy = spring; ex, ey = eye
    for f in (0.12, -0.12):
        dxp, dyp = -(ey-sy), (ex-sx)
        Lp = (dxp*dxp + dyp*dyp) ** 0.5
        ox, oy = dxp/Lp * abs(f)*180, dyp/Lp * abs(f)*180
        if f < 0: ox, oy = -ox, -oy
        add_m("incised", [(sx + (ex-sx)*0.15 + ox*0.5, sy + (ey-sy)*0.2 + oy*0.5), (sx + (ex-sx)*0.75 + ox, sy + (ey-sy)*0.78 + oy)])
# Sheaf fine striations
for dx1, dx2 in [(-122, -20), (-48, -7)]:
    add_m("incised", bez((AX+dx1*0.06, 290), (AX+dx1, 430), (AX+dx1*1.05, 700), (AX+dx2, 1120)))

# ---------------- SVG OUT ----------------
def layer_svg(name, color):
    parts = [f'<g id="{name}" fill="none" stroke="{color}" stroke-width="{STROKE}" stroke-linecap="round">']
    for pts in polylines[name]:
        parts.append(f'<polyline points="{P(pts)}"/>')
    parts.append("</g>")
    return "\n".join(parts)

svg = f'''<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">
<rect width="{W}" height="{H}" fill="white"/>
{layer_svg("armature", "#000000")}
{layer_svg("foliage", "#0044aa")}
{layer_svg("incised", "#aa2200")}
</svg>'''
open("ornament_structure.svg", "w").write(svg)
print("layers:", {k: len(v) for k, v in polylines.items()})
