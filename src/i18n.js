import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
    en: {
        translation: {
            "game": {
                "title": "Tetonor",
                "subtitle": "Find the pairs that sum and multiply",
                "new_game": "New Game",
                "solved": "🎉 Completed!",
                "mode": "Mode:",
                "easy": "easy",
                "normal": "normal",
                "hard": "hard"
            },
            "board": {
                "tablero": "BOARD",
                "numeros_disponibles": "AVAILABLE NUMBERS",
                "operaciones": "Operations"
            },
            "rules": {
                "title": "Tetonor Rules",
                "easy_title": "Easy Mode",
                "easy_p1": "The board shows 8 columns. Each column has a <strong>sum</strong> and a <strong>product</strong>.",
                "easy_p2": "You must find the <strong>pair of numbers</strong> (from the 16 available) that satisfies both operations for each column. Enter one number in each empty box.",
                "normal_title": "Normal Mode",
                "normal_p1": "You face a board of 16 independent tasks (sum or multiplication).",
                "normal_p2": "For each box, you must enter: <strong>Number 1</strong>, the <strong>Operation</strong> (+ or x), and <strong>Number 2</strong> that result in the cell's fixed number.",
                "normal_p3": "<em>Important:</em> Each number from the list must be used exactly <strong>twice</strong>: once for a sum and once for a multiplication. Use the right panel to track your progress!",
                "hard_title": "Hard Mode",
                "coming_soon": "Coming soon...",
                "footer": "Use <strong>Tab</strong> to navigate and <strong>Arrows</strong> to move around the board.",
                "view_rules": "View Rules"
            },
            "sidebar": {
                "available_ops": "AVAILABLE OPS",
                "sums_available": "Sums",
                "prods_available": "Products",
                "pending": "PENDING NUMBERS",
                "pending_desc": "PENDING PROGRESS",
                "pending_hint": "Numbers used only once. Find their missing operation!",
                "empty_hint": "All numbers are balanced!",
                "and": "and",
                "missing_prod": "needs product",
                "missing_sum": "needs sum",
                "pick_number": "Select value",
                "clear_guess": "Clear",
                "no_options": "No middle values",
                "variable_title": "Variable {{letter}}"
            }
        }
    },
    es: {
        translation: {
            "game": {
                "title": "Tetonor",
                "subtitle": "Encuentra los pares que suman y multiplican",
                "new_game": "Nuevo Juego",
                "solved": "🎉 ¡Completado!",
                "mode": "Modo:",
                "easy": "fácil",
                "normal": "normal",
                "hard": "difícil"
            },
            "board": {
                "tablero": "TABLERO",
                "numeros_disponibles": "NÚMEROS DISPONIBLES",
                "operaciones": "Operaciones"
            },
            "rules": {
                "title": "Reglas de Tetonor",
                "easy_title": "Modo Fácil",
                "easy_p1": "El tablero muestra 8 columnas. Cada columna tiene una <strong>suma</strong> y un <strong>producto</strong>.",
                "easy_p2": "Debes encontrar la <strong>pareja de números</strong> (de la lista de 16 disponibles) que cumpla ambas operaciones para cada columna. Escribe un número en cada casilla vacía.",
                "normal_title": "Modo Normal",
                "normal_p1": "Te enfrentas a un tablero de 16 tareas independientes (suma o multiplicación).",
                "normal_p2": "Para cada casilla, debes ingresar: <strong>Número 1</strong>, la <strong>Operación</strong> (+ o x) y el <strong>Número 2</strong> que den como resultado el número fijo de la celda.",
                "normal_p3": "<em>Importante:</em> Cada número de la lista debe usarse exactamente <strong>dos veces</strong>: una para una suma y otra para una multiplicación. ¡Usa el panel de la derecha para seguir tu progreso!",
                "hard_title": "Modo Difícil",
                "coming_soon": "Próximamente...",
                "footer": "Usa <strong>Tab</strong> para navegar y las <strong>Flechas</strong> para moverte por el tablero.",
                "view_rules": "Ver Reglas"
            },
            "sidebar": {
                "available_ops": "OPS DISPONIBLES",
                "sums_available": "Sumas",
                "prods_available": "Productos",
                "pending": "NÚMEROS PENDIENTES",
                "pending_desc": "PROGRESO PENDIENTE",
                "pending_hint": "Números usados solo una vez. ¡Busca su operación restante!",
                "empty_hint": "¡Todos los números están balanceados!",
                "and": "y",
                "missing_prod": "falta producto",
                "missing_sum": "falta suma",
                "pick_number": "Seleccionar valor",
                "clear_guess": "Limpiar",
                "no_options": "Sin valores intermedios",
                "variable_title": "Variable {{letter}}"
            }
        }
    }
};

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: 'es',
        interpolation: {
            escapeValue: false
        }
    });

export default i18n;
