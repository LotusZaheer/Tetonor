import React, { useEffect, useRef } from 'react';

export default function RulesModal({ onClose }) {
    const modalRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                onClose();
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    return (
        <div className="rules-modal-overlay">
            <div className="rules-modal-content" ref={modalRef}>
                <button className="close-btn" onClick={onClose} aria-label="Cerrar">
                    &times;
                </button>

                <h2 className="modal-title">Reglas de Tetonor</h2>

                <div className="rules-sections">
                    <section className="rules-section">
                        <h3 className="rules-header easy">Modo Fácil</h3>
                        <p>
                            El tablero muestra 8 columnas. Cada columna tiene una <strong>suma</strong> y un <strong>producto</strong>.
                        </p>
                        <p>
                            Debes encontrar la <strong>pareja de números</strong> (de la lista de 16 disponibles) que cumpla ambas operaciones para cada columna.
                            Escribe un número en cada casilla vacía.
                        </p>
                    </section>

                    <section className="rules-section">
                        <h3 className="rules-header normal">Modo Normal</h3>
                        <p>
                            Te enfrentas a un tablero de 16 tareas independientes (suma o multiplicación).
                        </p>
                        <p>
                            Para cada casilla, debes ingresar: <strong>Número 1</strong>, la <strong>Operación</strong> (+ o x) y el <strong>Número 2</strong> que den como resultado el número fijo de la celda.
                        </p>
                        <p>
                            <em>Importante:</em> Cada número de la lista debe usarse exactamente <strong>dos veces</strong>: una para una suma y otra para una multiplicación. ¡Usa el panel de la derecha para seguir tu progreso!
                        </p>
                    </section>

                    <section className="rules-section">
                        <h3 className="rules-header difficult">Modo Difícil</h3>
                        <p className="coming-soon">Próximamente...</p>
                    </section>
                </div>

                <div className="modal-footer">
                    <p>Usa <strong>Tab</strong> para navegar y las <strong>Flechas</strong> para moverte por el tablero.</p>
                </div>
            </div>
        </div>
    );
}
