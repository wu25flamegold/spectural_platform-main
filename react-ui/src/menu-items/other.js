// assets
import { IconBrandChrome, IconHelp, IconSitemap } from '@tabler/icons';

// constant
const icons = {
    IconBrandChrome: IconBrandChrome,
    IconHelp: IconHelp,
    IconSitemap: IconSitemap
};

//-----------------------|| SAMPLE PAGE & DOCUMENTATION MENU ITEMS ||-----------------------//

export const other = {
    id: 'sample-docs-roadmap',
    type: 'group',
    children: [
        // {
        //     id: 'fft',
        //     title: 'FFT',
        //     type: 'item',
        //     url: '/fft',
        //     icon: icons['IconBrandChrome'],
        //     breadcrumbs: false
        // },
        // {
        //     id: 'hht',
        //     title: 'HHT',
        //     type: 'item',
        //     url: '/hht',
        //     icon: icons['IconBrandChrome'],
        //     breadcrumbs: false
        // },
        {
            id: 'simulateSignal',
            title: 'Simulate Signal',
            type: 'item',
            url: '/simulateSignal',
            icon: icons['IconBrandChrome'],
            breadcrumbs: false
        },
        {
            id: 'hhsa',
            title: 'Analyze EEG File',
            type: 'item',
            url: '/hhsa',
            icon: icons['IconBrandChrome'],
            breadcrumbs: false
        },
        // {
        //     id: 'documentation',
        //     title: 'Documentation',
        //     type: 'item',
        //     url: 'https://docs.appseed.us/products/react/flask-berry-dashboard',
        //     icon: icons['IconHelp'],
        //     external: true,
        //     target: true
        // }
    ]
};
