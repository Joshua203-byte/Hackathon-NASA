import { useCallback, useState } from 'react';

const KEY = 'altaris-detalle';

/** localStorage puede faltar o estar bloqueado: sin él todo se ve igual, solo que la preferencia no se recuerda. */
export function readDetailPref(): boolean {
  try { return window.localStorage.getItem(KEY) === '1'; } catch { return false; }
}
export function writeDetailPref(on: boolean): void {
  try { window.localStorage.setItem(KEY, on ? '1' : '0'); } catch { /* sin almacenamiento */ }
}

export function useDetailPref(): [boolean, (on: boolean) => void] {
  const [on, setOn] = useState(readDetailPref);
  const set = useCallback((v: boolean) => { setOn(v); writeDetailPref(v); }, []);
  return [on, set];
}
