// assets
import { IconBrandFramer, IconTypography, IconApiApp, IconPalette, IconShadow, IconWindmill, IconLayoutGridAdd } from '@tabler/icons';

// constant
const icons = {
    IconTypography: IconTypography,
    IconPalette: IconPalette,
    IconShadow: IconShadow,
    IconWindmill: IconWindmill,
    IconBrandFramer: IconBrandFramer,
    IconLayoutGridAdd: IconLayoutGridAdd,
    IconApiApp: IconApiApp
};

//-----------------------|| UTILITIES MENU ITEMS ||-----------------------//

export const utilities = {
    id: 'utilities',
    title: 'HHSA utilities',
    type: 'group',
    children: [
        {
            id: 'simulateSignal',
            title: 'Simulate Signal',
            type: 'item',
            url: '/simulateSignal',
            icon: icons['IconApiApp'],
            breadcrumbs: false
        },
        {
            id: 'hhsa',
            title: 'Analyze EEG File',
            type: 'item',
            url: '/hhsa',
            icon: icons['IconApiApp'],
            breadcrumbs: false
        },
        // {
        //     id: 'util-color',
        //     title: 'Color',
        //     type: 'item',
        //     url: '/utils/util-color',
        //     icon: icons['IconPalette'],
        //     breadcrumbs: false
        // },
        // {
        //     id: 'util-shadow',
        //     title: 'Shadow',
        //     type: 'item',
        //     url: '/utils/util-shadow',
        //     icon: icons['IconShadow'],
        //     breadcrumbs: false
        // },
        // {
        //     id: 'icons',
        //     title: 'Icons',
        //     type: 'collapse',
        //     icon: icons['IconWindmill'],
        //     children: [
        //         {
        //             id: 'tabler-icons',
        //             title: 'Tabler Icons',
        //             type: 'item',
        //             url: '/icons/tabler-icons',
        //             breadcrumbs: false
        //         },
        //         {
        //             id: 'material-icons',
        //             title: 'Material Icons',
        //             type: 'item',
        //             url: '/icons/material-icons',
        //             breadcrumbs: false
        //         }
        //     ]
        // }
    ]
};
