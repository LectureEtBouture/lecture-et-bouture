// `altcha` ne déclare son typage JSX que sous un sous-chemin ("./react") non
// exposé dans son champ "exports" — on redéclare ici l'élément custom
// <altcha-widget> pour TypeScript, à partir des types réellement exportés.
import type { CSSProperties, HTMLAttributes, Ref } from 'react';
import type { CSSVariables, WidgetAttributes } from 'altcha/types';

interface AltchaWidgetProps
    extends WidgetAttributes, HTMLAttributes<HTMLElement> {
    ref?: Ref<HTMLElement>;
    style?: CSSProperties & Partial<CSSVariables>;
}

declare global {
    namespace React {
        namespace JSX {
            interface IntrinsicElements {
                'altcha-widget': AltchaWidgetProps;
            }
        }
    }
}

declare module 'react' {
    namespace JSX {
        interface IntrinsicElements {
            'altcha-widget': AltchaWidgetProps;
        }
    }
}

declare module 'react/jsx-runtime' {
    namespace JSX {
        interface IntrinsicElements {
            'altcha-widget': AltchaWidgetProps;
        }
    }
}

export {};
