import { useEffect, useRef } from 'react';

/**
 * HeroBackground
 * Living pixel art landscape for StatQuest:
 * - Animated twilight gradient sky
 * - Twinkling pixel stars & statistical constellations (Bell curve & Regression line)
 * - Occasional shooting star
 * - Drifting pixel clouds
 * - Distant mountain peaks with a glowing Citadel/Lighthouse beacon
 * - Animated lake with shimmering water ripples & glowing reflections
 * - Majestic pine trees framing both sides (matching the inspo style)
 * - Floating glowing data motes / fireflies
 * - Smooth mouse parallax
 */
export default function HeroBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initScene();
    };

    window.addEventListener('resize', handleResize);

    // Mouse parallax tracking
    let targetMouseX = 0;
    let targetMouseY = 0;
    let currentMouseX = 0;
    let currentMouseY = 0;

    const handleMouseMove = (e) => {
      targetMouseX = (e.clientX / width - 0.5) * 2; // -1 to 1
      targetMouseY = (e.clientY / height - 0.5) * 2;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Scene state
    let stars = [];
    let clouds = [];
    let waterRipples = [];
    let motes = [];
    let shootingStar = null;
    let lastShootingStarTime = 0;

    const initScene = () => {
      const horizonY = height * 0.53;

      // 1. Stars (upper sky)
      stars = [];
      const starCount = Math.floor((width * horizonY) / 6000);
      const starColors = ['#FFF8EC', '#FFE9A8', '#BFF0DC', '#E7DEFF', '#FFD66B'];
      for (let i = 0; i < starCount; i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * (horizonY - 30) + 10,
          size: Math.random() < 0.2 ? 3 : Math.random() < 0.5 ? 2 : 1,
          color: starColors[Math.floor(Math.random() * starColors.length)],
          phase: Math.random() * Math.PI * 2,
          speed: 1.5 + Math.random() * 2.5,
        });
      }

      // 2. Pixel Clouds
      clouds = [];
      const cloudCount = Math.max(3, Math.floor(width / 350));
      for (let i = 0; i < cloudCount; i++) {
        clouds.push({
          x: Math.random() * width,
          y: (horizonY * 0.15) + (i * horizonY * 0.7) / cloudCount,
          speed: 0.12 + Math.random() * 0.18,
          scale: 0.8 + Math.random() * 0.6,
          opacity: 0.25 + Math.random() * 0.35,
          blocks: generateCloudBlocks(),
        });
      }

      // 3. Water Ripples (lower half)
      waterRipples = [];
      const rippleCount = Math.floor((height - horizonY) / 9);
      for (let i = 0; i < rippleCount; i++) {
        const ry = horizonY + 8 + i * 9;
        const depthRatio = (ry - horizonY) / (height - horizonY); // 0 at horizon, 1 at bottom
        waterRipples.push({
          y: ry,
          baseY: ry,
          x: Math.random() * width,
          width: 30 + Math.random() * 80 + depthRatio * 60,
          height: depthRatio > 0.6 ? 3 : 2,
          speed: (0.2 + Math.random() * 0.3) * (i % 2 === 0 ? 1 : -1),
          phase: Math.random() * Math.PI * 2,
          isHighlight: Math.random() < 0.38,
        });
      }

      // 4. Floating Motes (Fireflies / Data particles)
      motes = [];
      const moteCount = Math.floor(width / 60);
      for (let i = 0; i < moteCount; i++) {
        motes.push({
          x: Math.random() * width,
          y: horizonY - 100 + Math.random() * (height - horizonY + 120),
          size: Math.random() < 0.3 ? 3 : 2,
          color: Math.random() < 0.5 ? '#FFD66B' : '#BFF0DC',
          speedY: 0.25 + Math.random() * 0.45,
          swaySpeed: 1 + Math.random() * 2,
          swayWidth: 15 + Math.random() * 25,
          phase: Math.random() * Math.PI * 2,
          baseX: Math.random() * width,
        });
      }
    };

    function generateCloudBlocks() {
      // Create chunky retro pixel cloud cluster
      return [
        { dx: 0, dy: 0, w: 90, h: 14 },
        { dx: 18, dy: -8, w: 55, h: 12 },
        { dx: -14, dy: 4, w: 110, h: 10 },
        { dx: 30, dy: -14, w: 32, h: 8 },
        { dx: 70, dy: -4, w: 30, h: 10 },
      ];
    }

    initScene();

    let startTime = performance.now();

    const render = (now) => {
      const elapsed = (now - startTime) / 1000;

      // Smooth mouse parallax lerp
      currentMouseX += (targetMouseX - currentMouseX) * 0.05;
      currentMouseY += (targetMouseY - currentMouseY) * 0.05;

      const horizonY = height * 0.53;

      ctx.clearRect(0, 0, width, height);

      // ==========================================
      // LAYER 1: SKY GRADIENT (Rich Twilight Palette)
      // ==========================================
      const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY);
      skyGrad.addColorStop(0.0, '#0F0926');  // Cosmic deep purple/navy
      skyGrad.addColorStop(0.3, '#21134A');  // Deep twilight indigo
      skyGrad.addColorStop(0.6, '#46237A');  // Royal statquest violet
      skyGrad.addColorStop(0.82, '#7C4DFF'); // Vibrant electric purple
      skyGrad.addColorStop(0.94, '#B9A2FF'); // Soft dusk lavender
      skyGrad.addColorStop(1.0, '#FFE494');  // Warm butter sunset glow at horizon
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, horizonY);

      // ==========================================
      // LAYER 2: TWINKLING STARS & CONSTELLATIONS
      // ==========================================
      for (const s of stars) {
        const twinkle = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(elapsed * s.speed + s.phase));
        ctx.fillStyle = s.color;
        ctx.globalAlpha = twinkle;
        // Parallax slight offset for stars
        const px = s.x - currentMouseX * 4;
        const py = s.y - currentMouseY * 2;
        ctx.fillRect(Math.floor(px), Math.floor(py), s.size, s.size);
      }
      ctx.globalAlpha = 1;

      // Draw Bell Curve Constellation (Upper Left)
      drawBellCurveConstellation(ctx, width * 0.15, horizonY * 0.35, elapsed, currentMouseX, currentMouseY);

      // Draw Regression Line Constellation (Upper Right)
      drawRegressionConstellation(ctx, width * 0.82, horizonY * 0.32, elapsed, currentMouseX, currentMouseY);

      // Shooting Star (streaks across the sky occasionally)
      if (!shootingStar && now - lastShootingStarTime > 6500 && Math.random() < 0.02) {
        lastShootingStarTime = now;
        shootingStar = {
          x: Math.random() * width * 0.7 + width * 0.1,
          y: Math.random() * (horizonY * 0.4) + 20,
          dx: 7 + Math.random() * 4,
          dy: 3.5 + Math.random() * 2.5,
          life: 0,
          maxLife: 40,
        };
      }

      if (shootingStar) {
        shootingStar.x += shootingStar.dx;
        shootingStar.y += shootingStar.dy;
        shootingStar.life++;

        const alpha = 1 - shootingStar.life / shootingStar.maxLife;
        ctx.strokeStyle = `rgba(255, 248, 236, ${alpha})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(shootingStar.x, shootingStar.y);
        ctx.lineTo(shootingStar.x - shootingStar.dx * 6, shootingStar.y - shootingStar.dy * 6);
        ctx.stroke();

        ctx.fillStyle = `rgba(255, 233, 168, ${alpha})`;
        ctx.fillRect(Math.floor(shootingStar.x), Math.floor(shootingStar.y), 3, 3);

        if (shootingStar.life >= shootingStar.maxLife) {
          shootingStar = null;
        }
      }

      // ==========================================
      // LAYER 3: DRIFTING PIXEL CLOUDS
      // ==========================================
      for (const c of clouds) {
        c.x += c.speed;
        if (c.x > width + 150) c.x = -200;

        const cx = c.x - currentMouseX * 8;
        const cy = c.y - currentMouseY * 4;

        ctx.fillStyle = '#E7DEFF';
        ctx.globalAlpha = c.opacity;
        for (const b of c.blocks) {
          ctx.fillRect(
            Math.floor(cx + b.dx * c.scale),
            Math.floor(cy + b.dy * c.scale),
            Math.floor(b.w * c.scale),
            Math.floor(b.h * c.scale)
          );
        }
      }
      ctx.globalAlpha = 1;

      // ==========================================
      // LAYER 4: DISTANT MOUNTAIN RANGES & CITADEL
      // ==========================================
      drawDistantMountains(ctx, width, horizonY, currentMouseX, currentMouseY);
      drawCitadelLighthouse(ctx, width * 0.61, horizonY, elapsed, currentMouseX, currentMouseY);

      // ==========================================
      // LAYER 5: LAKE / LIVING WATER SURFACE
      // ==========================================
      const waterGrad = ctx.createLinearGradient(0, horizonY, 0, height);
      waterGrad.addColorStop(0.0, '#2D1B54'); // Horizon reflection
      waterGrad.addColorStop(0.25, '#1D133B');
      waterGrad.addColorStop(0.65, '#120D26');
      waterGrad.addColorStop(1.0, '#070512'); // Dark abyss bottom
      ctx.fillStyle = waterGrad;
      ctx.fillRect(0, horizonY, width, height - horizonY);

      // Horizon atmospheric mist line
      const mistGrad = ctx.createLinearGradient(0, horizonY - 6, 0, horizonY + 8);
      mistGrad.addColorStop(0, 'rgba(255, 228, 148, 0)');
      mistGrad.addColorStop(0.5, 'rgba(255, 228, 148, 0.45)');
      mistGrad.addColorStop(1, 'rgba(255, 228, 148, 0)');
      ctx.fillStyle = mistGrad;
      ctx.fillRect(0, horizonY - 6, width, 14);

      // Animated Water Shimmer & Scanline Ripples
      for (const r of waterRipples) {
        r.x += r.speed;
        if (r.x > width + 100) r.x = -r.width - 20;
        if (r.x < -r.width - 40) r.x = width + 20;

        const waveSway = Math.sin(elapsed * 1.8 + r.phase) * 1.5;
        const ry = r.baseY + waveSway;
        const rx = r.x - currentMouseX * 12;

        // Depth perspective
        const depth = (ry - horizonY) / (height - horizonY);

        // Center reflection boost (under citadel & title)
        const distFromCenter = Math.abs(rx + r.width / 2 - width / 2) / (width / 2);
        const centerGlow = Math.max(0, 1 - distFromCenter * 1.4);

        if (r.isHighlight) {
          // Warm gold / lavender ripple
          ctx.fillStyle = centerGlow > 0.3 ? '#FFE494' : '#B9A2FF';
          ctx.globalAlpha = 0.22 + centerGlow * 0.45 + depth * 0.15;
        } else {
          // Deep violet water ripple
          ctx.fillStyle = '#5B34D6';
          ctx.globalAlpha = 0.18 + depth * 0.25;
        }

        ctx.fillRect(Math.floor(rx), Math.floor(ry), Math.floor(r.width), r.height);
      }
      ctx.globalAlpha = 1;

      // ==========================================
      // LAYER 6: FRAMING PINE TREES & ROCKY SHORES
      // ==========================================
      // Matches the Fluidia inspo framing: tall trees left & right
      drawLeftForest(ctx, width, height, horizonY, currentMouseX, currentMouseY);
      drawRightForest(ctx, width, height, horizonY, currentMouseX, currentMouseY);

      // ==========================================
      // LAYER 7: FLOATING DATA MOTES / FIREFLIES
      // ==========================================
      for (const m of motes) {
        m.y -= m.speedY;
        if (m.y < horizonY - 180) {
          m.y = height + 10;
          m.baseX = Math.random() * width;
        }
        const sway = Math.sin(elapsed * m.swaySpeed + m.phase) * m.swayWidth;
        const mx = m.baseX + sway - currentMouseX * 16;
        const my = m.y - currentMouseY * 8;

        const pulse = 0.5 + 0.5 * Math.sin(elapsed * 3 + m.phase);
        ctx.fillStyle = m.color;
        ctx.globalAlpha = 0.4 + pulse * 0.55;
        ctx.fillRect(Math.floor(mx), Math.floor(my), m.size, m.size);

        // Soft pixel halo
        ctx.globalAlpha = 0.18 * pulse;
        ctx.fillRect(Math.floor(mx) - 1, Math.floor(my) - 1, m.size + 2, m.size + 2);
      }
      ctx.globalAlpha = 1;

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="hero-canvas"
      aria-hidden="true"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        imageRendering: 'pixelated',
        zIndex: 0,
      }}
    />
  );
}

// -------------------------------------------------------------
// HELPER: Distant Mountain Ranges (Pixel art silhouette ridges)
// -------------------------------------------------------------
function drawDistantMountains(ctx, width, horizonY, mx, _my) {
  // Far range (Deep navy violet)
  ctx.fillStyle = '#26194F';
  ctx.beginPath();
  const ox1 = -mx * 6;
  ctx.moveTo(0, horizonY);
  ctx.lineTo(0, horizonY - 35);

  const peaks1 = [
    [0.08, 65], [0.18, 40], [0.28, 90], [0.38, 55],
    [0.52, 110], [0.63, 140], [0.72, 85], [0.85, 120], [0.95, 60], [1.02, 75]
  ];

  for (const [ratio, h] of peaks1) {
    const px = width * ratio + ox1;
    const py = horizonY - h;
    // Stepped pixel peak
    ctx.lineTo(px - 15, py + 12);
    ctx.lineTo(px, py);
    ctx.lineTo(px + 15, py + 12);
  }
  ctx.lineTo(width, horizonY);
  ctx.closePath();
  ctx.fill();

  // Mid range (Slightly darker, closer)
  ctx.fillStyle = '#1D133E';
  ctx.beginPath();
  const ox2 = -mx * 10;
  ctx.moveTo(0, horizonY);
  ctx.lineTo(0, horizonY - 20);

  const peaks2 = [
    [0.04, 35], [0.14, 55], [0.24, 30], [0.34, 45],
    [0.48, 70], [0.60, 95], [0.68, 60], [0.80, 80], [0.92, 45], [1.02, 35]
  ];

  for (const [ratio, h] of peaks2) {
    const px = width * ratio + ox2;
    const py = horizonY - h;
    ctx.lineTo(px - 12, py + 8);
    ctx.lineTo(px, py);
    ctx.lineTo(px + 12, py + 8);
  }
  ctx.lineTo(width, horizonY);
  ctx.closePath();
  ctx.fill();
}

// -------------------------------------------------------------
// HELPER: Citadel / Lighthouse Beacon (Island fortress in distance)
// -------------------------------------------------------------
function drawCitadelLighthouse(ctx, baseX, horizonY, elapsed, mx, _my) {
  const x = baseX - mx * 10;
  const towerH = 145;
  const topY = horizonY - towerH;

  // Island base rock
  ctx.fillStyle = '#191136';
  ctx.fillRect(Math.floor(x - 36), Math.floor(horizonY - 25), 72, 28);
  ctx.fillRect(Math.floor(x - 46), Math.floor(horizonY - 14), 92, 16);

  // Tower body
  ctx.fillStyle = '#1E1442';
  ctx.fillRect(Math.floor(x - 14), Math.floor(topY + 28), 28, towerH - 28);

  // Tower battlements / spires
  ctx.fillStyle = '#2A1D5A';
  ctx.fillRect(Math.floor(x - 18), Math.floor(topY + 20), 36, 8);
  ctx.fillRect(Math.floor(x - 8), Math.floor(topY + 6), 16, 14);

  // Beacon lantern (Glowing amber beacon)
  const beaconPulse = 0.6 + 0.4 * Math.sin(elapsed * 4);
  ctx.fillStyle = '#FFE494';
  ctx.globalAlpha = beaconPulse;
  ctx.fillRect(Math.floor(x - 4), Math.floor(topY + 8), 8, 8);

  // Sweeping light cone
  const sweepAngle = Math.sin(elapsed * 1.5) * 0.45;
  const coneLen = 160;
  const coneGrad = ctx.createRadialGradient(x, topY + 12, 4, x, topY + 12, coneLen);
  coneGrad.addColorStop(0, 'rgba(255, 233, 168, 0.45)');
  coneGrad.addColorStop(0.5, 'rgba(255, 214, 107, 0.15)');
  coneGrad.addColorStop(1, 'rgba(255, 214, 107, 0)');

  ctx.save();
  ctx.translate(x, topY + 12);
  ctx.rotate(sweepAngle - 0.2);
  ctx.fillStyle = coneGrad;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-coneLen, -45);
  ctx.lineTo(-coneLen, 45);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  ctx.globalAlpha = 1;
}

// -------------------------------------------------------------
// HELPER: Left Forest Framing (Tall layered pixel pine trees)
// -------------------------------------------------------------
function drawLeftForest(ctx, width, height, horizonY, mx, _my) {
  const ox = -mx * 18;

  // Background darker pine tree
  drawPixelPine(ctx, -20 + ox, height - 30, 480, 160, '#110C29', '#151034');
  // Middle tall pine tree
  drawPixelPine(ctx, 40 + ox, height - 10, 560, 190, '#0C0820', '#130E30');
  // Smaller foreground pine
  drawPixelPine(ctx, 130 + ox, height + 40, 440, 150, '#080518', '#0F0A24');
  // Shoreline rocky bank
  ctx.fillStyle = '#080516';
  ctx.beginPath();
  ctx.moveTo(0, height);
  ctx.lineTo(0, horizonY + 30);
  ctx.lineTo(80 + ox, horizonY + 60);
  ctx.lineTo(170 + ox, horizonY + 120);
  ctx.lineTo(220 + ox, height);
  ctx.closePath();
  ctx.fill();
}

// -------------------------------------------------------------
// HELPER: Right Forest Framing (Layered pine trees on right shore)
// -------------------------------------------------------------
function drawRightForest(ctx, width, height, horizonY, mx, _my) {
  const ox = -mx * 18;
  const rightX = width;

  // Background pine
  drawPixelPine(ctx, rightX - 50 + ox, height - 20, 490, 170, '#110C29', '#151034');
  // Foreground prominent pine
  drawPixelPine(ctx, rightX - 130 + ox, height + 20, 540, 185, '#0C0820', '#130E30');
  // Midground pine
  drawPixelPine(ctx, rightX - 220 + ox, height + 80, 410, 140, '#080518', '#0F0A24');

  // Shoreline rocky bank
  ctx.fillStyle = '#080516';
  ctx.beginPath();
  ctx.moveTo(rightX, height);
  ctx.lineTo(rightX, horizonY + 45);
  ctx.lineTo(rightX - 90 + ox, horizonY + 80);
  ctx.lineTo(rightX - 190 + ox, horizonY + 140);
  ctx.lineTo(rightX - 260 + ox, height);
  ctx.closePath();
  ctx.fill();
}

// -------------------------------------------------------------
// HELPER: Stepped Pixel Pine Tree Drawer
// -------------------------------------------------------------
function drawPixelPine(ctx, baseX, baseY, treeHeight, maxBranchW, darkCol, lightCol) {
  const tiers = 7;
  const tierH = treeHeight / tiers;

  // Trunk
  ctx.fillStyle = '#080514';
  const trunkW = Math.max(14, maxBranchW * 0.12);
  ctx.fillRect(Math.floor(baseX - trunkW / 2), Math.floor(baseY - treeHeight * 0.2), trunkW, treeHeight * 0.2);

  // Stepped pine tiers
  for (let i = 0; i < tiers; i++) {
    const tierRatio = (i + 1) / tiers;
    const branchW = maxBranchW * (0.2 + 0.8 * tierRatio);
    const top = baseY - treeHeight + i * tierH * 0.82;
    const h = tierH * 1.25;

    // Dark side (left/shadow)
    ctx.fillStyle = darkCol;
    for (let s = 0; s < 4; s++) {
      const stepW = (branchW * 0.5) * ((s + 1) / 4);
      const stepY = top + (h / 4) * s;
      ctx.fillRect(Math.floor(baseX - stepW), Math.floor(stepY), Math.floor(stepW), Math.floor(h / 4) + 1);
    }

    // Light side (right/edge highlight)
    ctx.fillStyle = lightCol;
    for (let s = 0; s < 4; s++) {
      const stepW = (branchW * 0.5) * ((s + 1) / 4);
      const stepY = top + (h / 4) * s;
      ctx.fillRect(Math.floor(baseX), Math.floor(stepY), Math.floor(stepW), Math.floor(h / 4) + 1);
    }
  }
}

// -------------------------------------------------------------
// HELPER: Bell Curve (Normal Distribution) Constellation
// -------------------------------------------------------------
function drawBellCurveConstellation(ctx, cx, cy, elapsed, mx, my) {
  const ox = cx - mx * 5;
  const oy = cy - my * 3;
  const points = [
    [-60, 30], [-40, 26], [-20, 10], [0, -18], [20, 10], [40, 26], [60, 30]
  ];

  const pulse = 0.4 + 0.4 * (0.5 + 0.5 * Math.sin(elapsed * 2));

  // Constellation connecting line
  ctx.strokeStyle = `rgba(185, 162, 255, ${pulse * 0.4})`;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  for (let i = 0; i < points.length; i++) {
    const px = ox + points[i][0];
    const py = oy + points[i][1];
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.stroke();

  // Constellation star nodes
  for (const [dx, dy] of points) {
    ctx.fillStyle = '#FFE9A8';
    ctx.globalAlpha = pulse + 0.2;
    ctx.fillRect(Math.floor(ox + dx - 1), Math.floor(oy + dy - 1), 3, 3);
  }
  ctx.globalAlpha = 1;
}

// -------------------------------------------------------------
// HELPER: Regression Line Constellation
// -------------------------------------------------------------
function drawRegressionConstellation(ctx, cx, cy, elapsed, mx, my) {
  const ox = cx - mx * 5;
  const oy = cy - my * 3;

  const pulse = 0.4 + 0.4 * (0.5 + 0.5 * Math.sin(elapsed * 2 + 1.2));

  // Scatter dots around line
  const scatter = [
    [-50, 26], [-35, 14], [-18, 18], [-2, 2], [14, -8], [30, -2], [46, -18], [60, -28]
  ];

  // Best fit line
  ctx.strokeStyle = `rgba(255, 107, 138, ${pulse * 0.5})`;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(ox - 60, oy + 32);
  ctx.lineTo(ox + 68, oy - 32);
  ctx.stroke();

  // Scatter points
  for (const [dx, dy] of scatter) {
    ctx.fillStyle = '#BFF0DC';
    ctx.globalAlpha = pulse + 0.2;
    ctx.fillRect(Math.floor(ox + dx - 1), Math.floor(oy + dy - 1), 3, 3);
  }
  ctx.globalAlpha = 1;
}
