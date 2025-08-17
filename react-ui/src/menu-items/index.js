import { IconApiApp} from '@tabler/icons';

const icons = { IconApiApp: IconApiApp};

//-----------------------|| MENU ITEMS ||-----------------------//

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
        }
    ]
};

const menuItems = {
    items: [utilities]
};

export default menuItems;
