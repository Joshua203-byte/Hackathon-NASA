import { Component, type ReactNode } from 'react';

interface Props {
  /** Nombre visible de la sección, para la tarjeta de aviso. */
  name: string;
  children: ReactNode;
}

/**
 * Un fallo de render queda contenido en su sección: el resto del panel sigue en pie.
 * Se monta con key={celda + indicador}, así al navegar la sección se recupera sola.
 */
export class SectionBoundary extends Component<Props, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.error(`[ALTARIS] ${this.props.name}`, error);
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div role="alert" className="panel-warning">
        <strong>{this.props.name}:</strong> no se pudo mostrar con los datos de esta celda.
      </div>
    );
  }
}
