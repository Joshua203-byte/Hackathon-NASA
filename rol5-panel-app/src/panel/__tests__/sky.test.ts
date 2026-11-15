import { describe, expect, it } from 'vitest';
import { bodiesAt, project, raDecToVec, skyFrame, starColor, toHorizon } from '../space/sky';

const DATE = new Date('2026-11-15T20:00:00Z');

describe('cielo real detrás del globo', () => {
  it('el nadir del observador cae en el centro de la pantalla', () => {
    // En el polo norte el cenit es el polo celeste: la dirección opuesta (declinación −90°) está bajo los pies, al centro.
    const p = project(toHorizon(skyFrame(DATE, 90, 0), raDecToVec(0, -90)), 1600, 900);
    expect(p).not.toBeNull();
    expect(Math.abs(p![0] - 800)).toBeLessThan(900 * 0.05); // precesión desde J2000: menos de 0,4°
    expect(Math.abs(p![1] - 450)).toBeLessThan(900 * 0.05);
  });

  it('con el norte hacia arriba, el polo sur celeste queda debajo del centro desde 45° N', () => {
    const p = project(toHorizon(skyFrame(DATE, 45, -86), raDecToVec(0, -90)), 1600, 900)!;
    expect(p[1]).toBeGreaterThan(450);
    expect(Math.abs(p[0] - 800)).toBeLessThan(40);
  });

  it('lo que queda detrás de la cámara no se dibuja (el cenit)', () => {
    const f = skyFrame(DATE, 45, -86);
    const zenith = raDecToVec(0, 0); // cualquier dirección: se busca una con profundidad negativa
    const stars = [zenith, raDecToVec(90, 0), raDecToVec(180, 0), raDecToVec(270, 0), raDecToVec(0, 90), raDecToVec(0, -90)];
    const seen = stars.map(s => project(toHorizon(f, s), 1600, 900));
    expect(seen.some(s => s === null)).toBe(true);
    expect(seen.some(s => s !== null)).toBe(true);
  });

  it('las direcciones de planetas, Luna y Sol son vectores unitarios y el Sol cae en la eclíptica', () => {
    const bodies = bodiesAt(DATE);
    expect(bodies.map(b => b.id)).toEqual(['Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Moon', 'Sun']);
    for (const b of bodies) expect(Math.hypot(...b.vec)).toBeCloseTo(1, 6);
    const sun = bodies.find(b => b.id === 'Sun')!;
    // Mediados de noviembre: el Sol está cerca de ascensión recta 15 h (≈ 225°) y declinación ≈ −18°.
    const ra = ((Math.atan2(sun.vec[1], sun.vec[0]) * 180) / Math.PI + 360) % 360;
    expect(ra).toBeGreaterThan(220); expect(ra).toBeLessThan(235);
    expect((Math.asin(sun.vec[2]) * 180) / Math.PI).toBeLessThan(-16);
    expect(bodies.find(b => b.id === 'Sun')!.mag).toBeLessThan(-26);
  });

  it('el color de las estrellas es un rgb válido para todo el rango B−V', () => {
    for (const bv of [-0.4, 0, 0.6, 1.2, 2]) expect(starColor(bv)).toMatch(/^rgb\(\d+,\d+,\d+\)$/);
  });
});
