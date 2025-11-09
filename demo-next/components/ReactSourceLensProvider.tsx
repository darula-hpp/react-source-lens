'use client';

import { useReactSourceLens } from 'react-source-lens';

export function ReactSourceLensProvider() {
    useReactSourceLens({
        projectRoot: '/Users/olebogengmbedzi/dev/react-source-lens/demo-next'
    });

    return null;
}
